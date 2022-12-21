// Component
import { ModuleView } from '../../Component/ModuleView/ModuleView';
import { PositionerWindow } from '../../Component/GUI/js/PositionerWindow';
import { Window } from '../../Component/GUI/js/Window';

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
