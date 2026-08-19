import { useEffect, useRef } from "react";
import {
  Canvas,
  Circle,
  FabricImage,
  IText,
  Line,
  Rect,
} from "fabric";

import type { EditorTool } from "../types/editor";
import type { EditorCanvasSettings } from "../hooks/useEditorController";
import { initializeFabricDefaults } from "../fabricDefaults";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

type EditorCanvasProps = {
  activeTool: EditorTool;
  onToolComplete: () => void;
  onCanvasReady: (canvas: Canvas | null) => void;
  zoom: number;
  canvasSize: Pick<EditorCanvasSettings, "width" | "height">;
};

function EditorCanvas({
  activeTool,
  onToolComplete,
  onCanvasReady,
  zoom,
  canvasSize,
}: EditorCanvasProps) {
  const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!htmlCanvasRef.current || fabricCanvasRef.current) {
      return;
    }

    initializeFabricDefaults();

    const canvas = new Canvas(htmlCanvasRef.current, {
      width: 700,
      height: 400,
      backgroundColor: "#f5f1ea",
      preserveObjectStacking: true,
      selection: true,
      selectionColor: "rgba(255, 90, 0, 0.12)",
      selectionBorderColor: "#ff5a00",
      selectionLineWidth: 3,
    });

    fabricCanvasRef.current = canvas;

    const orangePanel = new Rect({
      left: 0,
      top: 0,
      width: 700,
      height: 135,
      fill: "#ea4b0c",
      selectable: true,
      evented: true,
    });

    const headline = new IText("YOUR HEADLINE\nHERE", {
      left: 45,
      top: 30,
      fontSize: 38,
      fontFamily: "Arial",
      fontWeight: "bold",
      fill: "#ffffff",
      lineHeight: 1.05,
    });

    const bodyText = new IText(
      "Add your key message here. Keep it clear and direct.",
      {
        left: 48,
        top: 175,
        fontSize: 18,
        fontFamily: "Arial",
        fill: "#3a3530",
      }
    );

    const button = new Rect({
      left: 48,
      top: 310,
      width: 190,
      height: 52,
      rx: 26,
      ry: 26,
      fill: "#ea4b0c",
    });

    const buttonText = new IText("Get in touch →", {
      left: 77,
      top: 325,
      fontSize: 17,
      fontFamily: "Arial",
      fontWeight: "bold",
      fill: "#ffffff",
    });

    Object.assign(orangePanel, { editorName: "Orange panel" });
    Object.assign(headline, { editorName: "Headline" });
    Object.assign(bodyText, { editorName: "Body copy" });
    Object.assign(button, { editorName: "Button" });
    Object.assign(buttonText, { editorName: "Button label" });

    canvas.add(
      orangePanel,
      headline,
      bodyText,
      button,
      buttonText
    );

    canvas.setActiveObject(headline);
    canvas.renderAll();
    onCanvasReady(canvas);

    return () => {
      onCanvasReady(null);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [onCanvasReady]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;

    if (!canvas || activeTool === "select") {
      return;
    }

    if (activeTool === "text") {
      const text = new IText("Edit this text", {
        left: 120,
        top: 150,
        fontSize: 28,
        fontFamily: "Arial",
        fill: "#111111",
      });

      Object.assign(text, { editorName: "Text" });

      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
      canvas.requestRenderAll();
      onToolComplete();
      return;
    }

    if (activeTool === "rectangle") {
      const rectangle = new Rect({
        left: 150,
        top: 150,
        width: 180,
        height: 100,
        rx: 10,
        ry: 10,
        fill: "#ea4b0c",
      });

      Object.assign(rectangle, { editorName: "Rectangle" });

      canvas.add(rectangle);
      canvas.setActiveObject(rectangle);
      canvas.requestRenderAll();
      onToolComplete();
      return;
    }

    if (activeTool === "circle") {
      const circle = new Circle({
        left: 180,
        top: 130,
        radius: 60,
        fill: "#163b25",
      });

      Object.assign(circle, { editorName: "Circle" });

      canvas.add(circle);
      canvas.setActiveObject(circle);
      canvas.requestRenderAll();
      onToolComplete();
      return;
    }

    if (activeTool === "line") {
      const line = new Line([140, 190, 360, 190], {
        stroke: "#111111",
        strokeWidth: 4,
      });

      Object.assign(line, { editorName: "Line" });

      canvas.add(line);
      canvas.setActiveObject(line);
      canvas.requestRenderAll();
      onToolComplete();
      return;
    }

    if (activeTool === "image") {
      imageInputRef.current?.click();
    }
  }, [activeTool, onToolComplete]);

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const canvas = fabricCanvasRef.current;
    const file = event.target.files?.[0];

    if (!canvas || !file) {
      onToolComplete();
      return;
    }

    try {
      const imageUrl = await readFileAsDataUrl(file);
      const image = await FabricImage.fromURL(imageUrl);

      image.set({
        left: 150,
        top: 100,
      });

      image.scaleToWidth(250);
      Object.assign(image, {
        editorName: file.name.replace(/\.[^.]+$/, "") || "Image",
      });

      canvas.add(image);
      canvas.setActiveObject(image);
      canvas.requestRenderAll();
    } catch (error) {
      console.error("Failed to add image:", error);
      alert("We could not add that image.");
    } finally {
      event.target.value = "";
      onToolComplete();
    }
  }

  return (
    <main className="flex min-w-0 flex-1 overflow-auto bg-[#171717]">
      <div className="m-auto p-8 sm:p-10">
        <div
          className="shrink-0"
          style={{
            width: canvasSize.width * zoom,
            height: canvasSize.height * zoom,
          }}
        >
          <div
            className="origin-top-left shadow-2xl"
            style={{ transform: `scale(${zoom})` }}
          >
            <canvas ref={htmlCanvasRef} />
          </div>
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleImageUpload}
        className="hidden"
      />
    </main>
  );
}

export default EditorCanvas;
