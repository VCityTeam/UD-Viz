/** @format */

// Components
import { ModuleView } from '../../Components/ModuleView/ModuleView';
import { PositionerWindow } from '../../Components/GUI/js/PositionerWindow';
import { Window } from '../../Components/GUI/js/Window';

export class CameraPositionerView extends ModuleView {
  constructor(itownsView) {
    super();

    this.positionerWindow = new PositionerWindow(itownsView);

    this.positionerWindow.addEventListener(Window.EVENT_DISABLED, () =>
      this.disable()
    );
  }

  enableView() {
    this.positionerWindow.appendTo(this.parentElement);
  }

  disableView() {
    this.positionerWindow.dispose();
  }
}
