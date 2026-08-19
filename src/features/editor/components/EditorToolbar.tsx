import type { EditorTool } from "../types/editor";
import {
  Circle,
  Image as ImageIcon,
  Minus,
  MousePointer2,
  Square,
  Type as TypeIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type EditorToolbarProps = {
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
};

const tools: Array<{
  id: EditorTool;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "text", label: "Text", icon: TypeIcon },
  { id: "rectangle", label: "Rect", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "line", label: "Line", icon: Minus },
  { id: "image", label: "Image", icon: ImageIcon },
];

function EditorToolbar({
  activeTool,
  onToolChange,
}: EditorToolbarProps) {
  return (
    <aside className="flex w-14 shrink-0 flex-col items-center gap-[3px] border-r border-white/10 bg-[#0d0c0a] py-2 text-white">
      {tools.map((tool, index) => {
        const Icon = tool.icon;

        return (
          <div key={tool.id}>
            {(index === 1 || index === 5) && (
              <div className="mx-auto my-[3px] h-px w-7 bg-white/10" />
            )}
            <button
              type="button"
              onClick={() => onToolChange(tool.id)}
              aria-pressed={activeTool === tool.id}
              title={tool.label}
              className={`flex h-10 w-10 flex-col items-center justify-center gap-0.5 rounded-[7px] text-[8px] font-semibold uppercase tracking-[0.03em] transition ${
                activeTool === tool.id
                  ? "bg-orange-600 text-white"
                  : "text-white/45 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{tool.label}</span>
            </button>
          </div>
        );
      })}
    </aside>
  );
}

export default EditorToolbar;
