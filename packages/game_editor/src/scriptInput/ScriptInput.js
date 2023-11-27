export class ScriptInput {
  /**
   * private constructor user should not extends it !!
   *
   * @param {import("../index").Editor} editor - editor running this script
   * @param {object} variables - variables to edit
   * @param {HTMLElement} domElement - where ui element should be appended
   */
  constructor(editor, variables, domElement) {
    /** @type {import("../index").Editor} */
    this.editor = editor;

    /** @type {object} */
    this.variables = variables;

    /** @type {HTMLElement} */
    this.domElement = domElement;

    /** @type {HTMLElement} */
    const closeButton = document.createElement('button');
    this.domElement.appendChild(closeButton);
    closeButton.innerText = 'Fermer';

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

  get ID_EDIT_SCRIPT() {
    return this.constructor.ID_EDIT_SCRIPT;
  }

  static get ID_EDIT_SCRIPT() {
    throw new Error(
      'abstract method, you have to specify which script is controlled'
    );
  }
}
