import { ModuleView } from "../../../Utils/ModuleView/ModuleView";
import { PositionerWindow } from "../../../Utils/Camera/PositionerWindow";
import { Window } from "../../../Utils/GUI/js/Window";

export class CameraPositionerView extends ModuleView {
  constructor(itownsView, cameraControls) {
    super();

    this.positionerWindow = new PositionerWindow(itownsView, cameraControls);

    this.positionerWindow.addEventListener(Window.EVENT_DISABLED,
      () => this.disable());
  }

  enableView() {
    this.positionerWindow.appendTo(this.parentElement);
  }

  disableView() {
    this.positionerWindow.dispose();
  }
}