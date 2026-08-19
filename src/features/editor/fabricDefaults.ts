import { FabricObject } from "fabric";

export function initializeFabricDefaults() {
  FabricObject.ownDefaults = {
    ...FabricObject.ownDefaults,

    // Border
    borderColor: "#ff5a00",

    // Resize handles
    cornerColor: "#ff5a00",
    cornerStrokeColor: "#ffffff",
    cornerStyle: "circle",
    cornerSize: 16,

    // Makes the corners solid
    transparentCorners: false,

    // Border thickness
    borderScaleFactor: 3,

    // Extra spacing around object
    padding: 6,
  };
}