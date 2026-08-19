export type EditorTool =
  | "select"
  | "text"
  | "rectangle"
  | "circle"
  | "line"
  | "image";

export type EditorElementType =
  | "text"
  | "rectangle"
  | "circle"
  | "line"
  | "image";

export type EditorElement = {
  id: string;
  type: EditorElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type EditorDocument = {
  id?: string;
  name: string;
  productId?: string;
  canvasWidth: number;
  canvasHeight: number;
  elements: EditorElement[];
};