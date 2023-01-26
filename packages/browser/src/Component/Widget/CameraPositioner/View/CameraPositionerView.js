// Component
import { WidgetView } from '../../Component/WidgetView/WidgetView';
import { PositionerWindow } from '../../Component/GUI/js/PositionerWindow';
import { Window } from '../../Component/GUI/js/Window';

/** @class */
export class CameraPositionerView extends WidgetView {
  /**
   * Creates a new CameraPositionerView
   *
   * @param {import('itowns').PlanarView} itownsView - the itowns view object
   */
  constructor(itownsView) {
    super();

    this.positionerWindow = new PositionerWindow(itownsView);

    this.positionerWindow.addEventListener(Window.EVENT_DISABLED, () =>
      this.disable()
    );
  }

  /**
   * Append the window to the parent element
   */
  enableView() {
    this.positionerWindow.appendTo(this.parentElement);
  }

  /**
   * Dispose the window
   */
  disableView() {
    this.positionerWindow.dispose();
  }
}
