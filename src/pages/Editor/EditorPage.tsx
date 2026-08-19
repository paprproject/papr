import { useCallback, useState } from "react";
import EditorTopbar from "../../features/editor/components/EditorTopbar";
import EditorToolbar from "../../features/editor/components/EditorToolbar";
import EditorCanvas from "../../features/editor/components/EditorCanvas";
import EditorAssetsPanel from "../../features/editor/components/EditorAssetsPanel";
import PropertiesPanel from "../../features/editor/components/PropertiesPanel";
import LayersPanel from "../../features/editor/components/LayersPanel";
import ResizablePanel from "../../features/editor/components/ResizablePanel";
import type { EditorTool } from "../../features/editor/types/editor";
import { useEditorController } from "../../features/editor/hooks/useEditorController";

function EditorPage() {
  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const [assetsVisible, setAssetsVisible] = useState(true);
  const [inspectorVisible, setInspectorVisible] = useState(true);
  const editor = useEditorController();
  const handleToolComplete = useCallback(() => setActiveTool("select"), []);

  const activeColor = editor.selection
    ? editor.selection.supportsFill
      ? editor.selection.fill
      : editor.selection.supportsStroke
        ? editor.selection.stroke
        : null
    : editor.canvasSettings.backgroundColor;

  const colorTarget = editor.selection
    ? editor.selection.supportsFill
      ? "Fill"
      : editor.selection.supportsStroke
        ? "Stroke"
        : "Unavailable"
    : "Canvas";

  function handleApplyColor(color: string) {
    if (!editor.selection) {
      editor.updateCanvasSettings({ backgroundColor: color });
      return;
    }

    if (editor.selection.supportsFill) {
      editor.updateSelection({ fill: color });
      return;
    }

    if (editor.selection.supportsStroke) {
      editor.updateSelection({ stroke: color });
    }
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#0d0c0a]">
      <EditorTopbar
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        zoom={editor.zoom}
        onUndo={() => void editor.undo()}
        onRedo={() => void editor.redo()}
        onZoomChange={editor.setZoom}
        onReset={() => void editor.resetDocument()}
        assetsVisible={assetsVisible}
        inspectorVisible={inspectorVisible}
        onToggleAssets={() => setAssetsVisible((visible) => !visible)}
        onToggleInspector={() => setInspectorVisible((visible) => !visible)}
      />

      <div className="flex min-h-0 flex-1">
        <EditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />

        <ResizablePanel
          side="left"
          visible={assetsVisible}
          defaultWidth={180}
          minWidth={160}
          maxWidth={320}
          className="border-r border-white/8"
        >
          <EditorAssetsPanel
            activeColor={activeColor}
            colorTarget={colorTarget}
            onApplyColor={handleApplyColor}
            onApplyTemplate={editor.applyTemplate}
            onHide={() => setAssetsVisible(false)}
          />
        </ResizablePanel>

        <EditorCanvas
          activeTool={activeTool}
          onToolComplete={handleToolComplete}
          onCanvasReady={editor.registerCanvas}
          zoom={editor.zoom}
          canvasSize={editor.canvasSettings}
        />

        <ResizablePanel
          side="right"
          visible={inspectorVisible}
          defaultWidth={220}
          minWidth={200}
          maxWidth={360}
          className="border-l border-white/8"
        >
          <div className="flex min-h-0 w-full flex-col bg-[#111111] text-white">
            <PropertiesPanel
              selection={editor.selection}
              canvasSettings={editor.canvasSettings}
              onUpdate={editor.updateSelection}
              onCanvasUpdate={editor.updateCanvasSettings}
              onDelete={editor.deleteSelection}
              onHide={() => setInspectorVisible(false)}
            />
            <LayersPanel
              layers={editor.layers}
              selectedLayerIds={editor.selectedLayerIds}
              onSelect={editor.selectLayer}
              onToggleVisibility={editor.toggleLayerVisibility}
              onToggleLock={editor.toggleLayerLock}
            />
          </div>
        </ResizablePanel>
      </div>
    </div>
  );
}

export default EditorPage;
