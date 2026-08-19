import { PanelLeftClose } from "lucide-react";
import type { EditorTemplateId } from "../hooks/useEditorController";

const brandColors = [
  "#e04e12",
  "#0d0c0a",
  "#f2ede3",
  "#182e1f",
  "#c09040",
  "#d9d3c5",
  "#7a7060",
  "#fde8dc",
  "#e8f0ea",
  "#f5edd8",
  "#ffffff",
  "#b33c0c",
];

const templates: Array<{
  id: EditorTemplateId;
  name: string;
  background: string;
  accent: string;
  preview: "opening" | "sale" | "gig" | "minimal";
}> = [
  {
    id: "grand-opening",
    name: "Grand opening",
    background: "#e04e12",
    accent: "#ffffff",
    preview: "opening",
  },
  {
    id: "flash-sale",
    name: "Flash sale",
    background: "#0d0c0a",
    accent: "#e04e12",
    preview: "sale",
  },
  {
    id: "gig-poster",
    name: "Gig poster",
    background: "#182e1f",
    accent: "#e04e12",
    preview: "gig",
  },
  {
    id: "minimal-card",
    name: "Minimal card",
    background: "#f2ede3",
    accent: "#0d0c0a",
    preview: "minimal",
  },
];

type EditorAssetsPanelProps = {
  activeColor: string | null;
  colorTarget: string;
  onApplyColor: (color: string) => void;
  onApplyTemplate: (templateId: EditorTemplateId) => void;
  onHide: () => void;
};

function TemplatePreview({
  preview,
  accent,
}: {
  preview: "opening" | "sale" | "gig" | "minimal";
  accent: string;
}) {
  if (preview === "opening") {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white">
        <span className="text-[5px] font-bold tracking-wide opacity-70">
          WE ARE FINALLY
        </span>
        <span className="text-[17px] font-black leading-none">OPEN!</span>
        <span className="mt-2 rounded-full bg-black px-2 py-0.5 text-[5px] font-bold">
          12 JUL · 10AM
        </span>
      </div>
    );
  }

  if (preview === "sale") {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white">
        <span className="text-[5px] font-bold tracking-widest" style={{ color: accent }}>
          48 HOURS ONLY
        </span>
        <span className="text-[15px] font-black">70% OFF</span>
        <span className="mt-2 rounded-full px-2 py-0.5 text-[5px] font-bold" style={{ background: accent }}>
          SHOP NOW
        </span>
      </div>
    );
  }

  if (preview === "gig") {
    return (
      <div className="relative flex h-full items-center justify-center overflow-hidden">
        <span
          className="absolute h-10 w-10 rounded-full"
          style={{ background: accent }}
        />
        <span className="relative text-center text-[11px] font-black leading-[0.85] text-[#f5edd8]">
          MIDNIGHT<br />ARCADE
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center px-3 text-[#0d0c0a]">
      <span className="font-serif text-[10px]">atelier mou</span>
      <span className="mt-1 h-px w-4 bg-black" />
      <span className="mt-1 text-[4px] text-black/50">
        curated objects for slow living
      </span>
    </div>
  );
}

function EditorAssetsPanel({
  activeColor,
  colorTarget,
  onApplyColor,
  onApplyTemplate,
  onHide,
}: EditorAssetsPanelProps) {
  return (
    <aside className="flex min-h-0 w-full flex-col overflow-y-auto bg-[#141312] text-white">
      <div className="flex items-center justify-between border-b border-white/8 px-3 py-2.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
          Design library
        </span>
        <button
          type="button"
          onClick={onHide}
          aria-label="Hide design library"
          title="Hide design library"
          className="rounded p-1 text-white/35 transition hover:bg-white/8 hover:text-white"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>

      <section className="border-b border-white/8 p-3">
        <div className="flex items-center justify-between">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/30">
            Brand colors
          </p>
          <span className="text-[9px] text-white/25">{colorTarget}</span>
        </div>
        <div className="mt-2 grid grid-cols-6 gap-1">
          {brandColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onApplyColor(color)}
              aria-label={`Apply ${color}`}
              title={color}
              className={`aspect-square rounded-[3px] border-2 transition hover:scale-110 ${
                activeColor?.toLowerCase() === color.toLowerCase()
                  ? "border-white"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <p className="mt-2 text-[9px] leading-4 text-white/25">
          Select a layer to recolor it. With nothing selected, colors change the canvas.
        </p>
      </section>

      <section className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/30">
            Templates
          </p>
          <span className="text-[9px] text-white/25">Undo anytime</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onApplyTemplate(template.id)}
              title={`Apply ${template.name}`}
              className="group relative aspect-[0.8] overflow-hidden rounded-[7px] border border-white/8 transition hover:scale-[1.03] hover:border-orange-500"
              style={{ backgroundColor: template.background }}
            >
              <TemplatePreview
                preview={template.preview}
                accent={template.accent}
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-1 text-center text-[8px] font-semibold text-white">
                {template.name}
              </span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default EditorAssetsPanel;
