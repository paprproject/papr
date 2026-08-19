import { useRef, useState } from "react";

type ResizablePanelProps = {
  side: "left" | "right";
  visible: boolean;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  children: React.ReactNode;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function ResizablePanel({
  side,
  visible,
  defaultWidth,
  minWidth,
  maxWidth,
  children,
  className = "",
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  if (!visible) {
    return null;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startWidth: width };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }

    const pointerDelta = event.clientX - drag.startX;
    const widthDelta = side === "left" ? pointerDelta : -pointerDelta;
    setWidth(clamp(drag.startWidth + widthDelta, minWidth, maxWidth));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const widthDelta = side === "left" ? direction * 10 : direction * -10;
    setWidth((currentWidth) =>
      clamp(currentWidth + widthDelta, minWidth, maxWidth)
    );
  }

  return (
    <section
      className={`relative hidden min-h-0 shrink-0 lg:flex ${className}`}
      style={{ width }}
    >
      {children}
      <div
        role="separator"
        tabIndex={0}
        aria-label={`Resize ${side} editor panel`}
        aria-orientation="vertical"
        aria-valuemin={minWidth}
        aria-valuemax={maxWidth}
        aria-valuenow={width}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={() => {
          dragRef.current = null;
        }}
        onDoubleClick={() => setWidth(defaultWidth)}
        onKeyDown={handleKeyDown}
        className={`absolute inset-y-0 z-30 w-1.5 touch-none cursor-col-resize outline-none transition-colors hover:bg-orange-500/60 focus:bg-orange-500/60 ${
          side === "left" ? "-right-0.5" : "-left-0.5"
        }`}
      />
    </section>
  );
}

export default ResizablePanel;
