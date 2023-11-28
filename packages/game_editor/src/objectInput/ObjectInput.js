export class ObjectInput {
  /**
   * private constructor user should not override it !!
   *
   * @param {import("../index").Editor} editor - editor running this script
   * @param {object} object - object to edit
   * @param {HTMLElement} domElement - where ui element should be appended
   */
  constructor(editor, object, domElement) {
    /** @type {import("../index").Editor} */
    this.editor = editor;

    /** @type {object} */
    this.object = object;

    /** @type {HTMLElement} */
    this.domElement = domElement;

    /** @type {HTMLElement} */
    const closeButton = document.createElement('button');
    this.domElement.appendChild(closeButton);
    closeButton.innerText = 'X';

    closeButton.onclick = this.dispose.bind(this);
  }

  /**
   * Call when this is disposed
   */
  dispose() {
    while (this.domElement.firstChild) this.domElement.firstChild.remove();
  }

  /**
   * Call when this is instanciated
   */
  init() {}

  /**
   * Call every frame computed
   */
  tick() {}

  /**
   *
   * @param  {...any} args - arguments (id for scriptVariables input & gameobject3d for userData)
   * @returns {boolean} - if true this object input can edit the concern object
   */
  condition(...args) {
    return this.constructor.condition(...args);
  }

  /**
   *
   * @returns {boolean} - if true this object input can edit the concern object
   */
  static condition() {
    console.error(
      'abstract method, you have to specify which condition must be fullfilled to edit an object'
    );
    return false;
  }
}
