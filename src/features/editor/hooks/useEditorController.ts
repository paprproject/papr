import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, Circle, IText, Rect } from "fabric";
import type { FabricObject } from "fabric";

const HISTORY_LIMIT = 50;
const SERIALIZED_PROPERTIES = ["editorId", "editorName"];

type EditorFabricObject = FabricObject & {
  editorId?: string;
  editorName?: string;
  isEditing?: boolean;
};

export type EditorSelection = {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  angle: number;
  opacity: number;
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  supportsFill: boolean;
  supportsStroke: boolean;
  typography: EditorTypography | null;
};

export type EditorTypography = {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right" | "justify";
  lineHeight: number;
  charSpacing: number;
  underline: boolean;
};

export type EditorSelectionUpdate = Partial<
  Pick<
    EditorSelection,
    "x" | "y" | "angle" | "opacity" | "fill" | "stroke" | "strokeWidth"
  > &
    EditorTypography
>;

export type EditorCanvasSettings = {
  width: number;
  height: number;
  backgroundColor: string;
};

export type EditorTemplateId =
  | "grand-opening"
  | "flash-sale"
  | "gig-poster"
  | "minimal-card";

export type EditorLayer = {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
};

function createObjectId() {
  return `object-${crypto.randomUUID()}`;
}

function getObjectType(object: EditorFabricObject) {
  if (object instanceof IText) {
    return "text";
  }

  if (object.type === "rect") {
    return "rectangle";
  }

  return object.type || "object";
}

function getObjectName(object: EditorFabricObject) {
  if (object instanceof IText && object.text?.trim()) {
    return object.text.trim().replace(/\s+/g, " ").slice(0, 32);
  }

  if (object.editorName) {
    return object.editorName;
  }

  const type = getObjectType(object);
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function ensureObjectMetadata(object: EditorFabricObject) {
  object.editorId ||= createObjectId();
  object.editorName ||= getObjectName(object);
  object.set({
    borderColor: "#ff5a00",
    cornerColor: "#ff5a00",
    cornerStrokeColor: "#ffffff",
    cornerStyle: "circle",
    cornerSize: 18,
    transparentCorners: false,
    borderScaleFactor: 4,
    padding: 8,
  });
  return object;
}

function nameEditorObject<T extends EditorFabricObject>(
  object: T,
  name: string
) {
  object.editorName = name;
  return ensureObjectMetadata(object) as T;
}

function getPaintColor(color: EditorFabricObject["fill"]) {
  return typeof color === "string" && color.startsWith("#") ? color : null;
}

function normalizeFontWeight(weight: string | number) {
  if (weight === "bold") return "700";
  if (weight === "normal") return "400";
  return String(weight);
}

function serializeCanvas(canvas: Canvas) {
  return JSON.stringify({
    canvas: canvas.toObject(SERIALIZED_PROPERTIES),
    width: canvas.width,
    height: canvas.height,
    backgroundColor:
      typeof canvas.backgroundColor === "string"
        ? canvas.backgroundColor
        : "#f5f1ea",
  });
}

export function useEditorController() {
  const canvasRef = useRef<Canvas | null>(null);
  const canvasCleanupRef = useRef<(() => void) | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const initialSnapshotRef = useRef<string | null>(null);
  const isRestoringRef = useRef(false);
  const isBatchingRef = useRef(false);

  const [selection, setSelection] = useState<EditorSelection | null>(null);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoomState] = useState(1);
  const [canvasSettings, setCanvasSettings] = useState<EditorCanvasSettings>({
    width: 700,
    height: 400,
    backgroundColor: "#f5f1ea",
  });

  const syncHistoryState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const syncCanvasState = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      setSelection(null);
      setSelectedLayerIds([]);
      setLayers([]);
      return;
    }

    setCanvasSettings({
      width: canvas.width,
      height: canvas.height,
      backgroundColor:
        typeof canvas.backgroundColor === "string"
          ? canvas.backgroundColor
          : "#f5f1ea",
    });

    const objects = canvas.getObjects().map((object) =>
      ensureObjectMetadata(object as EditorFabricObject)
    );
    const activeObjects = canvas
      .getActiveObjects()
      .map((object) => ensureObjectMetadata(object as EditorFabricObject));

    setSelectedLayerIds(activeObjects.map((object) => object.editorId!));
    setLayers(
      objects
        .map((object) => ({
          id: object.editorId!,
          name: getObjectName(object),
          type: getObjectType(object),
          visible: object.visible !== false,
          locked: object.selectable === false,
        }))
        .reverse()
    );

    if (activeObjects.length !== 1) {
      setSelection(null);
      return;
    }

    const object = activeObjects[0];
    setSelection({
      id: object.editorId!,
      name: getObjectName(object),
      type: getObjectType(object),
      x: Math.round(object.left ?? 0),
      y: Math.round(object.top ?? 0),
      angle: Math.round(object.angle ?? 0),
      opacity: Math.round((object.opacity ?? 1) * 100),
      fill: getPaintColor(object.fill),
      stroke: getPaintColor(object.stroke),
      strokeWidth: Math.round((object.strokeWidth ?? 0) * 10) / 10,
      supportsFill: object.type !== "line" && object.type !== "image",
      supportsStroke: object.type !== "image",
      typography:
        object instanceof IText
          ? {
              fontFamily: object.fontFamily,
              fontSize: Math.round(object.fontSize),
              fontWeight: normalizeFontWeight(object.fontWeight),
              fontStyle: object.fontStyle === "italic" ? "italic" : "normal",
              textAlign:
                object.textAlign === "center" ||
                object.textAlign === "right" ||
                object.textAlign === "justify"
                  ? object.textAlign
                  : "left",
              lineHeight: Math.round(object.lineHeight * 100) / 100,
              charSpacing: Math.round(object.charSpacing),
              underline: object.underline,
            }
          : null,
    });
  }, []);

  const commitHistory = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas || isRestoringRef.current || isBatchingRef.current) {
      return;
    }

    const snapshot = serializeCanvas(canvas);
    const currentSnapshot = historyRef.current[historyIndexRef.current];

    if (snapshot === currentSnapshot) {
      syncHistoryState();
      return;
    }

    historyRef.current = historyRef.current.slice(
      Math.max(0, historyIndexRef.current - HISTORY_LIMIT + 2),
      historyIndexRef.current + 1
    );
    historyRef.current.push(snapshot);
    historyIndexRef.current = historyRef.current.length - 1;
    syncHistoryState();
  }, [syncHistoryState]);

  const registerCanvas = useCallback(
    (canvas: Canvas | null) => {
      canvasCleanupRef.current?.();
      canvasCleanupRef.current = null;
      canvasRef.current = canvas;

      if (!canvas) {
        historyRef.current = [];
        historyIndexRef.current = -1;
        initialSnapshotRef.current = null;
        syncCanvasState();
        syncHistoryState();
        return;
      }

      canvas.getObjects().forEach((object) =>
        ensureObjectMetadata(object as EditorFabricObject)
      );

      const initialSnapshot = serializeCanvas(canvas);
      initialSnapshotRef.current = initialSnapshot;
      historyRef.current = [initialSnapshot];
      historyIndexRef.current = 0;

      const handleSelectionChange = () => syncCanvasState();
      const handleTransform = () => syncCanvasState();
      const handleObjectChange = () => {
        syncCanvasState();
        commitHistory();
      };
      const handleTextChange = () => syncCanvasState();

      canvas.on("selection:created", handleSelectionChange);
      canvas.on("selection:updated", handleSelectionChange);
      canvas.on("selection:cleared", handleSelectionChange);
      canvas.on("object:moving", handleTransform);
      canvas.on("object:scaling", handleTransform);
      canvas.on("object:rotating", handleTransform);
      canvas.on("object:modified", handleObjectChange);
      canvas.on("object:added", handleObjectChange);
      canvas.on("object:removed", handleObjectChange);
      canvas.on("text:changed", handleTextChange);
      canvas.on("text:editing:exited", handleObjectChange);

      canvasCleanupRef.current = () => {
        canvas.off("selection:created", handleSelectionChange);
        canvas.off("selection:updated", handleSelectionChange);
        canvas.off("selection:cleared", handleSelectionChange);
        canvas.off("object:moving", handleTransform);
        canvas.off("object:scaling", handleTransform);
        canvas.off("object:rotating", handleTransform);
        canvas.off("object:modified", handleObjectChange);
        canvas.off("object:added", handleObjectChange);
        canvas.off("object:removed", handleObjectChange);
        canvas.off("text:changed", handleTextChange);
        canvas.off("text:editing:exited", handleObjectChange);
      };

      syncCanvasState();
      syncHistoryState();
    },
    [commitHistory, syncCanvasState, syncHistoryState]
  );

  const restoreSnapshot = useCallback(
    async (snapshot: string) => {
      const canvas = canvasRef.current;

      if (!canvas || isRestoringRef.current) {
        return;
      }

      isRestoringRef.current = true;

      try {
        const document = JSON.parse(snapshot) as {
          canvas: Record<string, unknown>;
          width: number;
          height: number;
          backgroundColor: string;
        };

        await canvas.loadFromJSON(document.canvas);
        canvas.setDimensions({
          width: document.width,
          height: document.height,
        });
        canvas.backgroundColor = document.backgroundColor;
        canvas.getObjects().forEach((object) =>
          ensureObjectMetadata(object as EditorFabricObject)
        );
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      } finally {
        isRestoringRef.current = false;
        syncCanvasState();
        syncHistoryState();
      }
    },
    [syncCanvasState, syncHistoryState]
  );

  const undo = useCallback(async () => {
    if (isRestoringRef.current || historyIndexRef.current <= 0) {
      return;
    }

    historyIndexRef.current -= 1;
    await restoreSnapshot(historyRef.current[historyIndexRef.current]);
  }, [restoreSnapshot]);

  const redo = useCallback(async () => {
    if (
      isRestoringRef.current ||
      historyIndexRef.current >= historyRef.current.length - 1
    ) {
      return;
    }

    historyIndexRef.current += 1;
    await restoreSnapshot(historyRef.current[historyIndexRef.current]);
  }, [restoreSnapshot]);

  const deleteSelection = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const activeObject = canvas.getActiveObject() as EditorFabricObject | undefined;
    if (activeObject?.isEditing) {
      return;
    }

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) {
      return;
    }

    isBatchingRef.current = true;
    activeObjects.forEach((object) => canvas.remove(object));
    canvas.discardActiveObject();
    isBatchingRef.current = false;
    canvas.requestRenderAll();
    syncCanvasState();
    commitHistory();
  }, [commitHistory, syncCanvasState]);

  const updateSelection = useCallback(
    (updates: EditorSelectionUpdate) => {
      const canvas = canvasRef.current;
      const object = canvas?.getActiveObjects()[0] as EditorFabricObject | undefined;

      if (!canvas || canvas.getActiveObjects().length !== 1 || !object) {
        return;
      }

      if (updates.x !== undefined) {
        object.set({ left: updates.x });
      }
      if (updates.y !== undefined) {
        object.set({ top: updates.y });
      }
      if (updates.angle !== undefined) {
        object.set({ angle: updates.angle });
      }
      if (updates.opacity !== undefined) {
        object.set({ opacity: Math.min(100, Math.max(0, updates.opacity)) / 100 });
      }
      if (updates.fill !== undefined) {
        object.set({ fill: updates.fill });
      }
      if (updates.stroke !== undefined) {
        object.set({ stroke: updates.stroke });
      }
      if (updates.strokeWidth !== undefined) {
        object.set({ strokeWidth: Math.max(0, updates.strokeWidth) });
      }

      if (object instanceof IText) {
        if (updates.fontFamily !== undefined) {
          object.set({ fontFamily: updates.fontFamily });
        }
        if (updates.fontSize !== undefined) {
          object.set({ fontSize: Math.max(6, updates.fontSize) });
        }
        if (updates.fontWeight !== undefined) {
          object.set({ fontWeight: updates.fontWeight });
        }
        if (updates.fontStyle !== undefined) {
          object.set({ fontStyle: updates.fontStyle });
        }
        if (updates.textAlign !== undefined) {
          object.set({ textAlign: updates.textAlign });
        }
        if (updates.lineHeight !== undefined) {
          object.set({ lineHeight: Math.max(0.5, updates.lineHeight) });
        }
        if (updates.charSpacing !== undefined) {
          object.set({ charSpacing: updates.charSpacing });
        }
        if (updates.underline !== undefined) {
          object.set({ underline: updates.underline });
        }
      }

      object.setCoords();
      canvas.requestRenderAll();
      syncCanvasState();
      commitHistory();
    },
    [commitHistory, syncCanvasState]
  );

  const updateCanvasSettings = useCallback(
    (updates: Partial<EditorCanvasSettings>) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const width = Math.min(
        3000,
        Math.max(100, Math.round(updates.width ?? canvas.width))
      );
      const height = Math.min(
        3000,
        Math.max(100, Math.round(updates.height ?? canvas.height))
      );

      if (width !== canvas.width || height !== canvas.height) {
        canvas.setDimensions({ width, height });
      }

      if (updates.backgroundColor !== undefined) {
        canvas.backgroundColor = updates.backgroundColor;
      }

      canvas.calcOffset();
      canvas.requestRenderAll();
      syncCanvasState();
      commitHistory();
    },
    [commitHistory, syncCanvasState]
  );

  const applyTemplate = useCallback(
    (templateId: EditorTemplateId) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const unit = Math.min(width, height);
      const centerX = width / 2;
      const objects: FabricObject[] = [];
      let backgroundColor = "#f2ede3";

      if (templateId === "grand-opening") {
        backgroundColor = "#e04e12";
        objects.push(
          nameEditorObject(
            new IText("WE ARE FINALLY", {
              left: centerX,
              top: height * 0.12,
              originX: "center",
              fontFamily: "Arial",
              fontSize: Math.max(12, unit * 0.045),
              fontWeight: "700",
              fill: "#ffffff",
              opacity: 0.75,
            }),
            "Eyebrow"
          ),
          nameEditorObject(
            new IText("OPEN!", {
              left: centerX,
              top: height * 0.23,
              originX: "center",
              fontFamily: "Arial",
              fontSize: Math.max(42, unit * 0.2),
              fontWeight: "800",
              fill: "#ffffff",
            }),
            "Opening headline"
          ),
          nameEditorObject(
            new Rect({
              left: width * 0.32,
              top: height * 0.53,
              width: width * 0.36,
              height: Math.max(2, unit * 0.008),
              fill: "#ffffff",
              opacity: 0.4,
            }),
            "Divider"
          ),
          nameEditorObject(
            new IText("1-for-1 all drinks · opening week only", {
              left: centerX,
              top: height * 0.59,
              originX: "center",
              fontFamily: "Arial",
              fontSize: Math.max(11, unit * 0.035),
              fontWeight: "600",
              fill: "#ffffff",
            }),
            "Offer"
          ),
          nameEditorObject(
            new Rect({
              left: width * 0.3,
              top: height * 0.76,
              width: width * 0.4,
              height: height * 0.13,
              rx: height * 0.065,
              ry: height * 0.065,
              fill: "#0d0c0a",
            }),
            "Date button"
          ),
          nameEditorObject(
            new IText("12 JUL · 10AM", {
              left: centerX,
              top: height * 0.785,
              originX: "center",
              fontFamily: "Arial",
              fontSize: Math.max(11, unit * 0.04),
              fontWeight: "700",
              fill: "#ffffff",
            }),
            "Event date"
          )
        );
      }

      if (templateId === "flash-sale") {
        backgroundColor = "#0d0c0a";
        objects.push(
          nameEditorObject(
            new IText("48 HOURS ONLY", {
              left: centerX,
              top: height * 0.1,
              originX: "center",
              fontFamily: "Courier New",
              fontSize: Math.max(12, unit * 0.04),
              fontWeight: "700",
              fill: "#e04e12",
            }),
            "Sale eyebrow"
          ),
          nameEditorObject(
            new IText("70% OFF", {
              left: centerX,
              top: height * 0.24,
              originX: "center",
              fontFamily: "Arial",
              fontSize: Math.max(42, unit * 0.17),
              fontWeight: "800",
              fill: "#ffffff",
            }),
            "Discount"
          ),
          nameEditorObject(
            new IText("EVERYTHING IN STORE", {
              left: centerX,
              top: height * 0.48,
              originX: "center",
              fontFamily: "Arial",
              fontSize: Math.max(11, unit * 0.04),
              fontWeight: "600",
              fill: "#ffffff",
              opacity: 0.65,
            }),
            "Sale details"
          ),
          nameEditorObject(
            new Rect({
              left: width * 0.27,
              top: height * 0.72,
              width: width * 0.46,
              height: height * 0.14,
              rx: height * 0.07,
              ry: height * 0.07,
              fill: "#e04e12",
            }),
            "Sale button"
          ),
          nameEditorObject(
            new IText("DON'T MISS IT", {
              left: centerX,
              top: height * 0.75,
              originX: "center",
              fontFamily: "Arial",
              fontSize: Math.max(11, unit * 0.038),
              fontWeight: "800",
              fill: "#ffffff",
            }),
            "Call to action"
          )
        );
      }

      if (templateId === "gig-poster") {
        backgroundColor = "#182e1f";
        objects.push(
          nameEditorObject(
            new Circle({
              left: centerX - unit * 0.22,
              top: height * 0.12,
              radius: unit * 0.22,
              fill: "#e04e12",
            }),
            "Accent circle"
          ),
          nameEditorObject(
            new IText("MIDNIGHT\nARCADE", {
              left: centerX,
              top: height * 0.2,
              originX: "center",
              textAlign: "center",
              lineHeight: 0.85,
              fontFamily: "Arial",
              fontSize: Math.max(34, unit * 0.13),
              fontWeight: "800",
              fill: "#f5edd8",
            }),
            "Band name"
          ),
          nameEditorObject(
            new IText("LIVE · FRI 24 JUL · 8PM", {
              left: centerX,
              top: height * 0.72,
              originX: "center",
              fontFamily: "Courier New",
              fontSize: Math.max(11, unit * 0.035),
              fontWeight: "700",
              fill: "#c09040",
            }),
            "Event details"
          ),
          nameEditorObject(
            new IText("Tickets at midnightarcade.sg", {
              left: centerX,
              top: height * 0.82,
              originX: "center",
              fontFamily: "Arial",
              fontSize: Math.max(10, unit * 0.028),
              fill: "#f5edd8",
              opacity: 0.7,
            }),
            "Ticket information"
          )
        );
      }

      if (templateId === "minimal-card") {
        backgroundColor = "#f2ede3";
        objects.push(
          nameEditorObject(
            new IText("atelier mou", {
              left: width * 0.08,
              top: height * 0.23,
              fontFamily: "Georgia",
              fontSize: Math.max(24, unit * 0.085),
              fontWeight: "400",
              fill: "#0d0c0a",
            }),
            "Brand name"
          ),
          nameEditorObject(
            new Rect({
              left: width * 0.08,
              top: height * 0.46,
              width: width * 0.1,
              height: Math.max(2, unit * 0.006),
              fill: "#0d0c0a",
            }),
            "Brand rule"
          ),
          nameEditorObject(
            new IText("curated objects for slow living", {
              left: width * 0.08,
              top: height * 0.53,
              fontFamily: "Arial",
              fontSize: Math.max(11, unit * 0.035),
              fill: "#7a7060",
            }),
            "Tagline"
          ),
          nameEditorObject(
            new IText("mou.sg · @ateliermou", {
              left: width * 0.08,
              top: height * 0.78,
              fontFamily: "Courier New",
              fontSize: Math.max(10, unit * 0.03),
              fontWeight: "500",
              fill: "#7a7060",
            }),
            "Contact details"
          )
        );
      }

      isBatchingRef.current = true;
      try {
        canvas.discardActiveObject();
        canvas.remove(...canvas.getObjects());
        canvas.backgroundColor = backgroundColor;
        canvas.add(...objects);
      } finally {
        isBatchingRef.current = false;
      }

      canvas.requestRenderAll();
      syncCanvasState();
      commitHistory();
    },
    [commitHistory, syncCanvasState]
  );

  const selectLayer = useCallback(
    (id: string) => {
      const canvas = canvasRef.current;
      const object = canvas
        ?.getObjects()
        .find((item) => (item as EditorFabricObject).editorId === id);

      if (!canvas || !object || object.visible === false) {
        return;
      }

      canvas.setActiveObject(object);
      canvas.requestRenderAll();
      syncCanvasState();
    },
    [syncCanvasState]
  );

  const toggleLayerVisibility = useCallback(
    (id: string) => {
      const canvas = canvasRef.current;
      const object = canvas
        ?.getObjects()
        .find((item) => (item as EditorFabricObject).editorId === id);

      if (!canvas || !object) {
        return;
      }

      object.set({ visible: object.visible === false });
      if (object.visible === false && canvas.getActiveObjects().includes(object)) {
        canvas.discardActiveObject();
      }
      canvas.requestRenderAll();
      syncCanvasState();
      commitHistory();
    },
    [commitHistory, syncCanvasState]
  );

  const toggleLayerLock = useCallback(
    (id: string) => {
      const canvas = canvasRef.current;
      const object = canvas
        ?.getObjects()
        .find((item) => (item as EditorFabricObject).editorId === id);

      if (!canvas || !object) {
        return;
      }

      const locked = object.selectable === false;
      object.set({ selectable: locked, evented: locked });
      if (!locked && canvas.getActiveObjects().includes(object)) {
        canvas.discardActiveObject();
      }
      canvas.requestRenderAll();
      syncCanvasState();
      commitHistory();
    },
    [commitHistory, syncCanvasState]
  );

  const resetDocument = useCallback(async () => {
    const initialSnapshot = initialSnapshotRef.current;
    if (!initialSnapshot) {
      return;
    }

    await restoreSnapshot(initialSnapshot);
    historyRef.current = [initialSnapshot];
    historyIndexRef.current = 0;
    syncHistoryState();
  }, [restoreSnapshot, syncHistoryState]);

  const setZoom = useCallback((nextZoom: number) => {
    setZoomState(Math.min(2, Math.max(0.5, Number(nextZoom.toFixed(2)))));
  }, []);

  useEffect(() => {
    function handleKeyboardShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isFormField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        void (event.shiftKey ? redo() : undo());
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        void redo();
        return;
      }

      if (!isFormField && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        deleteSelection();
      }
    }

    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, [deleteSelection, redo, undo]);

  useEffect(() => () => canvasCleanupRef.current?.(), []);

  return {
    registerCanvas,
    selection,
    selectedLayerIds,
    layers,
    canUndo,
    canRedo,
    undo,
    redo,
    deleteSelection,
    updateSelection,
    selectLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    resetDocument,
    zoom,
    setZoom,
    canvasSettings,
    updateCanvasSettings,
    applyTemplate,
  };
}
