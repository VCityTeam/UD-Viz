import { Window } from "../../../Utils/GUI/js/Window";


export class LayersControlWindow extends Window {

  constructor() {
    super('layers_control', 'Layers Control', false);


  }
  // WINDOW INHERITANCE
  /**
   * HTML string representing the inner content of the window.
   *
   * @abstract
   */
  get innerContentHtml() {
      return null;
  };

  /**
   * Method called when the window is created. During and after the call,
   * all HTML properties are not null.
   *
   * @abstract
   */
  windowCreated() {

  };

  /**
   * Method called when the window is destroyed.
   *
   * @abstract
   */
  windowDestroyed() {

  };
}
