import { ModuleView } from "../../Utils/ModuleView/ModuleView";
import { PositionerWindow } from "../../Utils/Camera/PositionerWindow";

export class CameraPositioner extends ModuleView {
  constructor(itownsView, cameraControls) {
    super();

    this.positionerWindow = new PositionerWindow(itownsView, cameraControls);
  }

  enableView() {
    this.positionerWindow.appendTo(this.parentElement);
  }

  disableView() {
    this.positionerWindow.dispose(this.parentElement);
  }
}