import { Link } from "react-router-dom";
import {
  Minus,
  PanelLeft,
  PanelRight,
  Plus,
  Redo2,
  RotateCcw,
  Undo2,
} from "lucide-react";

type EditorTopbarProps = {
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onUndo: () => void;
  onRedo: () => void;
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
  assetsVisible: boolean;
  inspectorVisible: boolean;
  onToggleAssets: () => void;
  onToggleInspector: () => void;
};

function EditorTopbar({
  canUndo,
  canRedo,
  zoom,
  onUndo,
  onRedo,
  onZoomChange,
  onReset,
  assetsVisible,
  inspectorVisible,
  onToggleAssets,
  onToggleInspector,
}: EditorTopbarProps) {
  function handleReset() {
    if (window.confirm("Discard your changes and restore the starting design?")) {
      onReset();
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0d0c0a] px-3 text-white sm:px-5">
      <div className="flex min-w-0 items-center gap-4">
        <Link to="/" className="text-xl font-black">
          PAP<span className="text-orange-500">R</span>
        </Link>

        <span className="hidden truncate rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 xl:block">
          Business Cards · Standard
        </span>
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={onToggleAssets}
          aria-label={assetsVisible ? "Hide design library" : "Show design library"}
          aria-pressed={assetsVisible}
          title={assetsVisible ? "Hide design library" : "Show design library"}
          className={`hidden rounded-lg p-2 transition lg:block ${
            assetsVisible
              ? "bg-white/10 text-white"
              : "text-white/40 hover:bg-white/10 hover:text-white"
          }`}
        >
          <PanelLeft size={16} />
        </button>

        <span className="mx-1 hidden h-5 w-px bg-white/10 lg:block" />

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo"
          title="Undo (⌘Z)"
          className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Undo2 size={17} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo"
          title="Redo (⇧⌘Z)"
          className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Redo2 size={17} />
        </button>

        <span className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />

        <button
          type="button"
          onClick={() => onZoomChange(zoom - 0.1)}
          aria-label="Zoom out"
          className="hidden rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white sm:block"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(1)}
          className="hidden min-w-12 rounded-lg px-1 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white sm:block"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(zoom + 0.1)}
          aria-label="Zoom in"
          className="hidden rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white sm:block"
        >
          <Plus size={16} />
        </button>

        <span className="mx-1 hidden h-5 w-px bg-white/10 lg:block" />

        <button
          type="button"
          onClick={onToggleInspector}
          aria-label={inspectorVisible ? "Hide properties" : "Show properties"}
          aria-pressed={inspectorVisible}
          title={inspectorVisible ? "Hide properties" : "Show properties"}
          className={`hidden rounded-lg p-2 transition lg:block ${
            inspectorVisible
              ? "bg-white/10 text-white"
              : "text-white/40 hover:bg-white/10 hover:text-white"
          }`}
        >
          <PanelRight size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white md:flex"
        >
          <RotateCcw size={15} />
          Discard
        </button>

        <button
          type="button"
          className="rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-orange-500 sm:px-5"
        >
          <span className="hidden sm:inline">Use this design</span>
          <span className="sm:hidden">Use</span>
        </button>
      </div>
    </header>
  );
}

export default EditorTopbar;
