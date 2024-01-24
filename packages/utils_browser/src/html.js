import { MathUtils } from 'three';

/**
 * Check if an html element belong to another one recursively
 *
 * @param {HTMLElement} child - html child
 * @param {HTMLElement} parent - html parent
 * @returns {boolean} - true if child belong to parent
 */
export function checkParentChild(child, parent) {
  let currentNode = child;
  let isChild = false;
  while (currentNode.parentNode) {
    if (currentNode == parent) {
      isChild = true;
      break;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return isChild;
}

/**
 * Create a button to toggle visibility of the content in a container
 *
 * @param {string} label - label of the container
 * @returns {{parent:HTMLElement,container:HTMLElement}} - parent is the element to add container is the element to fill
 */
export function createDisplayable(label) {
  const parent = document.createElement('div');
  const displayableButton = document.createElement('button');
  parent.appendChild(displayableButton);
  const container = document.createElement('div');
  parent.appendChild(container);

  displayableButton.innerText = 'Display ' + label;
  container.hidden = true;
  displayableButton.onclick = () => {
    container.hidden = !container.hidden;
    if (container.hidden) {
      displayableButton.innerText = 'Display ' + label;
    } else {
      displayableButton.innerText = 'Hide ' + label;
    }
  };

  return { parent: parent, container: container };
}

/**
 *
 * @param {string} labelText - label text
 * @param {string} inputType - input type
 * @returns {{parent:HTMLElement,input:HTMLElement}} - parent is the element to add input is the input element
 */
export function createLabelInput(labelText, inputType) {
  const parent = document.createElement('div');
  const label = document.createElement('label');
  label.innerText = labelText;
  const input = document.createElement('input');

  const uuid = MathUtils.generateUUID();
  input.setAttribute('id', uuid);
  input.setAttribute('type', inputType);
  label.htmlFor = uuid;

  parent.appendChild(label);
  parent.appendChild(input);

  return { parent: parent, input: input, label: label };
}

/**
 *
 * @param {string} labelText - text of the label
 * @returns {{parent:HTMLElement,inputStartDate:HTMLElement,inputEndDate:HTMLElement}} - date interval object
 */
export function createDateIntervalInput(labelText) {
  const parent = document.createElement('div');

  const label = document.createElement('label');
  label.innerText = labelText;
  parent.appendChild(label);

  const createLabelInputDate = (dateLabelText) => {
    const dateLabel = document.createElement('div');
    dateLabel.innerText = dateLabelText;
    parent.appendChild(dateLabel);
    const inputDate = document.createElement('input');
    inputDate.setAttribute('type', 'date');
    parent.appendChild(inputDate);

    return inputDate;
  };

  return {
    parent: parent,
    inputStartDate: createLabelInputDate('From'),
    inputEndDate: createLabelInputDate('To'),
  };
}

/**
 * A custom HTML element that represents a vector input with three numeric
 * values (x, y, z) and allows for event handling when the values are changed.
 */
export class Vector3Input extends HTMLElement {
  /**
   * A custom element with three input fields for x, y and z values, and
   * dispatches a 'change' event when any of the input values are changed.
   *
   * @param {string} labelVector - A string that represents the label for the
   * vector input.
   * @param {number} step - A number that specifies the increment or decrement value for
   * the input fields.
   * @param {number} value - The initial value that will be set for all three input
   * fields (`x`, `y` and `z`).
   * @param {Array<string>} [labels] - An optional array that contains the labels for the
   * input fields. By default, it is set to `['x', 'y', 'z']`.
   */
  constructor(labelVector, step, value, labels = ['x', 'y', 'z']) {
    super();

    this.labelVector = document.createElement('label');
    this.labelVector.innerText = labelVector;
    this.appendChild(this.labelVector);

    this.x = createLabelInput(labels[0], 'number');
    this.y = createLabelInput(labels[1], 'number');
    this.z = createLabelInput(labels[2], 'number');

    this.x.input.step = step;
    this.y.input.step = step;
    this.z.input.step = step;

    this.x.input.value = value;
    this.y.input.value = value;
    this.z.input.value = value;

    this.appendChild(this.x.parent);
    this.appendChild(this.y.parent);
    this.appendChild(this.z.parent);

    this.x.input.addEventListener('change', () =>
      this.dispatchEvent(new Event('change'))
    );
    this.y.input.addEventListener('change', () =>
      this.dispatchEvent(new Event('change'))
    );
    this.z.input.addEventListener('change', () =>
      this.dispatchEvent(new Event('change'))
    );
  }

  /**
   * The function returns an array of input elements.
   *
   * @returns {Array<HTMLInputElement>} Containing the input elements for the x, y, and z properties.
   */
  get inputElements() {
    return [this.x.input, this.y.input, this.z.input];
  }
}
window.customElements.define('vector3-input', Vector3Input); // mandatory to extends HTMLElement

/**
 * A custom HTML element that represents a vector input with two numeric
 * values (x, y) and allows for event handling when the values are changed.
 */
export class Vector2Input extends HTMLElement {
  /**
   * A custom element with two input fields for x and y values, and
   * dispatches a 'change' event when any of the input values are changed.
   *
   * @param {string} labelVector - A string that represents the label for the
   * vector input.
   * @param {number} step - A number that specifies the increment or decrement value for
   * the input fields.
   * @param {number} value - The initial value that will be set for all two input
   * fields (`x` and `y`).
   * @param {Array<string>} [labels] - An optional array that contains the labels for the
   * input fields. By default, it is set to `['x', 'y']`.
   */
  constructor(labelVector, step, value, labels = ['x', 'y']) {
    super();

    this.labelVector = document.createElement('label');
    this.labelVector.innerText = labelVector;
    this.appendChild(this.labelVector);

    this.x = createLabelInput(labels[0], 'number');
    this.y = createLabelInput(labels[1], 'number');

    this.x.input.step = step;
    this.y.input.step = step;

    this.x.input.value = value;
    this.y.input.value = value;

    this.appendChild(this.x.parent);
    this.appendChild(this.y.parent);

    this.x.input.addEventListener('change', () =>
      this.dispatchEvent(new Event('change'))
    );
    this.y.input.addEventListener('change', () =>
      this.dispatchEvent(new Event('change'))
    );
  }

  /**
   * The function returns an array of input elements.
   *
   * @returns {Array<HTMLInputElement>} Containing the input elements for the x and y properties.
   */
  get inputElements() {
    return [this.x.input, this.y.input];
  }
}
window.customElements.define('vector2-input', Vector2Input); // mandatory to extends HTMLElement

/**
 * A custom HTML element that represents a vector input with four numeric
 * values (x, y, z, w) and allows for event handling when the values are changed.
 */
export class Vector4Input extends HTMLElement {
  /**
   * A custom element with four input fields for x, y, z and w values, and
   * dispatches a 'change' event when any of the input values are changed.
   *
   * @param {string} labelVector - A string that represents the label for the
   * vector input.
   * @param {number} step - A number that specifies the increment or decrement value for
   * the input fields.
   * @param {number} value - The initial value that will be set for all four input
   * fields (`x`, `y`, `z` and `w`).
   * @param {Array<string>} [labels] - An optional array that contains the labels for the
   * input fields. By default, it is set to `['x', 'y', 'z', 'w']`.
   */
  constructor(labelVector, step, value, labels = ['x', 'y', 'z', 'w']) {
    super();

    this.labelVector = document.createElement('label');
    this.labelVector.innerText = labelVector;
    this.appendChild(this.labelVector);

    this.x = createLabelInput(labels[0], 'number');
    this.y = createLabelInput(labels[1], 'number');
    this.z = createLabelInput(labels[2], 'number');
    this.w = createLabelInput(labels[3], 'number');

    this.x.input.step = step;
    this.y.input.step = step;
    this.z.input.step = step;
    this.w.input.step = step;

    this.x.input.value = value;
    this.y.input.value = value;
    this.z.input.value = value;
    this.w.input.value = value;

    this.appendChild(this.x.parent);
    this.appendChild(this.y.parent);
    this.appendChild(this.z.parent);
    this.appendChild(this.w.parent);

    this.x.input.addEventListener('change', () =>
      this.dispatchEvent(new Event('change'))
    );
    this.y.input.addEventListener('change', () =>
      this.dispatchEvent(new Event('change'))
    );
    this.z.input.addEventListener('change', () =>
      this.dispatchEvent(new Event('change'))
    );
    this.w.input.addEventListener('change', () =>
      this.dispatchEvent(new Event('change'))
    );
  }

  /**
   * The function returns an array of input elements.
   *
   * @returns {Array<HTMLInputElement>} Containing the input elements for the x, y, z and w properties.
   */
  get inputElements() {
    return [this.x.input, this.y.input, this.z.input, this.w.input];
  }
}
window.customElements.define('vector4-input', Vector4Input); // mandatory to extends HTMLElement
