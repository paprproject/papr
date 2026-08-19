import { Circle, Eye, EyeOff, Image, Lock, Minus, Square, Type, Unlock } from "lucide-react";
import type { EditorLayer } from "../hooks/useEditorController";

type LayersPanelProps = {
  layers: EditorLayer[];
  selectedLayerIds: string[];
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
};

function LayerIcon({ type }: { type: string }) {
  if (type === "text") return <Type size={13} />;
  if (type === "circle") return <Circle size={13} />;
  if (type === "line") return <Minus size={13} />;
  if (type === "image") return <Image size={13} />;
  return <Square size={13} />;
}

function LayersPanel({
  layers,
  selectedLayerIds,
  onSelect,
  onToggleVisibility,
  onToggleLock,
}: LayersPanelProps) {
  return (
    <div className="flex max-h-[38%] min-h-36 flex-col border-t border-l border-white/10 bg-[#141312] p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
          Layers
        </p>
        <span className="text-[10px] text-white/30">{layers.length}</span>
      </div>

      <div className="mt-2 space-y-0.5 overflow-y-auto pr-0.5">
        {layers.map((layer) => {
          const isSelected = selectedLayerIds.includes(layer.id);

          return (
            <div
              key={layer.id}
              className={`group flex items-center gap-0.5 rounded-[5px] border px-0.5 py-0.5 transition ${
                isSelected
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-300"
                  : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(layer.id)}
                className="flex min-w-0 flex-1 items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11px]"
              >
                <span className="shrink-0"><LayerIcon type={layer.type} /></span>
                <span className="truncate">{layer.name}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleVisibility(layer.id)}
                aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
                title={layer.visible ? "Hide layer" : "Show layer"}
                className="rounded p-1 text-white/35 transition hover:bg-white/10 hover:text-white"
              >
                {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>

              <button
                type="button"
                onClick={() => onToggleLock(layer.id)}
                aria-label={layer.locked ? `Unlock ${layer.name}` : `Lock ${layer.name}`}
                title={layer.locked ? "Unlock layer" : "Lock layer"}
                className="rounded p-1 text-white/35 transition hover:bg-white/10 hover:text-white"
              >
                {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LayersPanel;
