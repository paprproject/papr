import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeftRight,
  Italic,
  PanelRightClose,
  Trash2,
  Underline,
} from "lucide-react";
import type {
  EditorCanvasSettings,
  EditorSelection,
  EditorSelectionUpdate,
} from "../hooks/useEditorController";

type PropertiesPanelProps = {
  selection: EditorSelection | null;
  canvasSettings: EditorCanvasSettings;
  onUpdate: (updates: EditorSelectionUpdate) => void;
  onCanvasUpdate: (updates: Partial<EditorCanvasSettings>) => void;
  onDelete: () => void;
  onHide: () => void;
};

type NumberInputProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onCommit: (value: number) => void;
};

const inputClassName =
  "mt-1 w-full rounded-[5px] border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] text-white outline-none transition focus:border-orange-500/70";

const fontFamilies = [
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
];

const canvasPresets = [
  { label: "Business card", width: 700, height: 400 },
  { label: "Square", width: 600, height: 600 },
  { label: "A5 portrait", width: 496, height: 702 },
  { label: "Flyer portrait", width: 600, height: 900 },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35">
      {children}
    </p>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onCommit,
}: NumberInputProps) {
  return (
    <label className="block">
      <span className="text-[11px] text-white/55">{label}</span>
      <div className="relative">
        <input
          key={value}
          type="number"
          defaultValue={value}
          min={min}
          max={max}
          step={step}
          onBlur={(event) => {
            const nextValue = Number(event.target.value);
            if (Number.isFinite(nextValue)) onCommit(nextValue);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className={`${inputClassName} ${suffix ? "pr-8" : ""}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute bottom-1.5 right-2 text-[10px] text-white/30">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function PaintControl({
  label,
  color,
  supported,
  fallback,
  onChange,
}: {
  label: string;
  color: string | null;
  supported: boolean;
  fallback: string;
  onChange: (color: string | null) => void;
}) {
  const enabled = Boolean(color);

  return (
    <div className={supported ? "" : "opacity-35"}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/55">{label}</span>
        <button
          type="button"
          disabled={!supported}
          aria-pressed={enabled}
          onClick={() => onChange(enabled ? null : fallback)}
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide transition ${
            enabled
              ? "bg-orange-500/15 text-orange-300"
              : "bg-white/5 text-white/35"
          }`}
        >
          {enabled ? "On" : "Off"}
        </button>
      </div>
      <div className="mt-1 flex items-center gap-2 rounded-[5px] border border-white/10 bg-white/5 p-1.5">
        <input
          type="color"
          value={color ?? fallback}
          disabled={!supported || !enabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-6 w-7 rounded border-0 bg-transparent disabled:cursor-not-allowed"
        />
        <span className="text-[10px] uppercase text-white/50">
          {supported ? color ?? "None" : "Not available"}
        </span>
      </div>
    </div>
  );
}

function PropertiesPanel({
  selection,
  canvasSettings,
  onUpdate,
  onCanvasUpdate,
  onDelete,
  onHide,
}: PropertiesPanelProps) {
  const currentPreset =
    canvasPresets.find(
      (preset) =>
        preset.width === canvasSettings.width &&
        preset.height === canvasSettings.height
    )?.label ?? "Custom";

  return (
    <aside className="min-h-0 flex-1 overflow-y-auto border-l border-white/10 bg-[#141312] p-3.5 text-white [scrollbar-width:thin]">
      <section>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
            Properties
          </p>
          <button
            type="button"
            onClick={onHide}
            aria-label="Hide properties panel"
            title="Hide properties panel"
            className="rounded p-1 text-white/35 transition hover:bg-white/8 hover:text-white"
          >
            <PanelRightClose size={14} />
          </button>
        </div>

        {!selection ? (
          <div className="mt-3 rounded-lg border border-dashed border-white/10 px-3 py-5 text-center text-[11px] leading-5 text-white/40">
            Select one item on the canvas or in Layers to edit it.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <p className="truncate text-xs font-bold text-white">
                {selection.name}
              </p>
              <p className="mt-0.5 text-[10px] capitalize text-white/40">
                {selection.type}
              </p>
            </div>

            <section className="space-y-2.5">
              <SectionHeading>Transform</SectionHeading>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="X"
                  value={selection.x}
                  onCommit={(x) => onUpdate({ x })}
                />
                <NumberInput
                  label="Y"
                  value={selection.y}
                  onCommit={(y) => onUpdate({ y })}
                />
              </div>
              <NumberInput
                label="Rotation"
                value={selection.angle}
                step={1}
                suffix="°"
                onCommit={(angle) => onUpdate({ angle })}
              />
            </section>

            <section className="space-y-3 border-t border-white/10 pt-3.5">
              <SectionHeading>Fill &amp; stroke</SectionHeading>
              <PaintControl
                label="Fill"
                color={selection.fill}
                supported={selection.supportsFill}
                fallback="#ea4b0c"
                onChange={(fill) => onUpdate({ fill })}
              />
              <PaintControl
                label="Stroke"
                color={selection.stroke}
                supported={selection.supportsStroke}
                fallback="#111111"
                onChange={(stroke) => onUpdate({ stroke })}
              />
              {selection.supportsStroke && selection.stroke ? (
                <NumberInput
                  label="Stroke width"
                  value={selection.strokeWidth}
                  min={0}
                  max={100}
                  step={0.5}
                  suffix="px"
                  onCommit={(strokeWidth) => onUpdate({ strokeWidth })}
                />
              ) : null}
              <label className="block">
                <span className="flex items-center justify-between text-[11px] text-white/55">
                  <span>Opacity</span>
                  <span>{selection.opacity}%</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selection.opacity}
                  onChange={(event) =>
                    onUpdate({ opacity: Number(event.target.value) })
                  }
                  className="mt-2 w-full accent-orange-500"
                />
              </label>
            </section>

            {selection.typography ? (
              <section className="space-y-3 border-t border-white/10 pt-3.5">
                <SectionHeading>Typography</SectionHeading>

                <label className="block">
                  <span className="text-[11px] text-white/55">Typeface</span>
                  <select
                    value={selection.typography.fontFamily}
                    onChange={(event) =>
                      onUpdate({ fontFamily: event.target.value })
                    }
                    className={inputClassName}
                  >
                    {fontFamilies.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Size"
                    value={selection.typography.fontSize}
                    min={6}
                    max={500}
                    suffix="px"
                    onCommit={(fontSize) => onUpdate({ fontSize })}
                  />
                  <label className="block">
                    <span className="text-[11px] text-white/55">Weight</span>
                    <select
                      value={selection.typography.fontWeight}
                      onChange={(event) =>
                        onUpdate({ fontWeight: event.target.value })
                      }
                      className={inputClassName}
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                      <option value="700">Bold</option>
                      <option value="800">Extra bold</option>
                    </select>
                  </label>
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate({
                        fontStyle:
                          selection.typography?.fontStyle === "italic"
                            ? "normal"
                            : "italic",
                      })
                    }
                    aria-label="Italic"
                    aria-pressed={selection.typography.fontStyle === "italic"}
                    className={`rounded-md p-2 ${
                      selection.typography.fontStyle === "italic"
                        ? "bg-orange-500 text-white"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Italic size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate({ underline: !selection.typography?.underline })
                    }
                    aria-label="Underline"
                    aria-pressed={selection.typography.underline}
                    className={`rounded-md p-2 ${
                      selection.typography.underline
                        ? "bg-orange-500 text-white"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Underline size={15} />
                  </button>
                  <span className="mx-1 h-5 w-px bg-white/10" />
                  {([
                    ["left", AlignLeft],
                    ["center", AlignCenter],
                    ["right", AlignRight],
                  ] as const).map(([alignment, Icon]) => (
                    <button
                      key={alignment}
                      type="button"
                      onClick={() => onUpdate({ textAlign: alignment })}
                      aria-label={`Align ${alignment}`}
                      aria-pressed={selection.typography?.textAlign === alignment}
                      className={`rounded-md p-2 ${
                        selection.typography?.textAlign === alignment
                          ? "bg-orange-500 text-white"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Line height"
                    value={selection.typography.lineHeight}
                    min={0.5}
                    max={3}
                    step={0.05}
                    onCommit={(lineHeight) => onUpdate({ lineHeight })}
                  />
                  <NumberInput
                    label="Letter space"
                    value={selection.typography.charSpacing}
                    min={-200}
                    max={1000}
                    step={10}
                    onCommit={(charSpacing) => onUpdate({ charSpacing })}
                  />
                </div>
              </section>
            ) : null}

            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-400/20 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-400/10"
            >
              <Trash2 size={16} />
              Delete layer
            </button>
          </div>
        )}
      </section>

      <section className="mt-5 space-y-3 border-t border-white/10 pt-4">
        <SectionHeading>Canvas settings</SectionHeading>

        <label className="block">
          <span className="text-[11px] text-white/55">Size preset</span>
          <select
            value={currentPreset}
            onChange={(event) => {
              const preset = canvasPresets.find(
                (item) => item.label === event.target.value
              );
              if (preset) {
                onCanvasUpdate({ width: preset.width, height: preset.height });
              }
            }}
            className={inputClassName}
          >
            {canvasPresets.map((preset) => (
              <option key={preset.label} value={preset.label}>
                {preset.label} · {preset.width}×{preset.height}
              </option>
            ))}
            <option value="Custom">Custom</option>
          </select>
        </label>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-1.5">
          <NumberInput
            label="Width"
            value={canvasSettings.width}
            min={100}
            max={3000}
            suffix="px"
            onCommit={(width) => onCanvasUpdate({ width })}
          />
          <button
            type="button"
            onClick={() =>
              onCanvasUpdate({
                width: canvasSettings.height,
                height: canvasSettings.width,
              })
            }
            aria-label="Swap canvas orientation"
            title="Swap orientation"
            className="mb-0.5 rounded-[5px] border border-white/10 p-2 text-white/45 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeftRight size={15} />
          </button>
          <NumberInput
            label="Height"
            value={canvasSettings.height}
            min={100}
            max={3000}
            suffix="px"
            onCommit={(height) => onCanvasUpdate({ height })}
          />
        </div>

        <div>
          <span className="text-[11px] text-white/55">Background</span>
          <div className="mt-1 flex items-center gap-2 rounded-[5px] border border-white/10 bg-white/5 p-1.5">
            <input
              type="color"
              value={canvasSettings.backgroundColor}
              onChange={(event) =>
                onCanvasUpdate({ backgroundColor: event.target.value })
              }
              className="h-6 w-7 rounded border-0 bg-transparent"
            />
            <span className="text-[10px] uppercase text-white/50">
              {canvasSettings.backgroundColor}
            </span>
          </div>
        </div>
      </section>
    </aside>
  );
}

export default PropertiesPanel;
