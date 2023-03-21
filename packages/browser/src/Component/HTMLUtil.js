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
 *
 * @param {HTMLElement} element - element to look into recursively
 * @param {string} childID - id of the child to look for
 * @returns {HTMLElement|null} - child with the id given or null if not
 */
export function findChildByID(element, childID) {
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    if (child.id == childID) {
      return child;
    }
    // check recursively
    const findInChild = findChildByID(child, childID);
    if (findInChild) return findInChild;
  }

  return null;
}

/**
 *
 * @param {HTMLElement} element - element to remove children from
 */
export function clearChildren(element) {
  while (element.firstChild) {
    element.firstChild.remove();
  }
}

/**
 * Create a button to toggle visibility of the content in a container
 *
 * @param {string} label - label of the container
 * @returns {{parent:HTMLElement,container:HTMLElement}} - parent is the element to add container is the element to fill
 */
export function createDisplayableContainer(label) {
  const parent = document.createElement('div');
  const displayableButton = document.createElement('div');
  parent.appendChild(displayableButton);
  const container = document.createElement('div');
  parent.appendChild(container);

  let hidden = true; // true by default
  displayableButton.innerText = 'Display ' + label;
  container.hidden = true;
  displayableButton.onclick = () => {
    hidden = !hidden;
    container.hidden = hidden;
    if (hidden) {
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
  const container = document.createElement('div');
  const label = document.createElement('label');
  label.innerText = labelText;
  const input = document.createElement('input');

  const uuid = MathUtils.generateUUID();
  input.setAttribute('id', uuid);
  input.setAttribute('type', inputType);
  label.htmlFor = uuid;

  container.appendChild(label);
  container.appendChild(input);

  return { container: container, input: input };
}

/**
 *
 * @param {string} labelText
 * @returns {{parent:HTMLElement,inputStartDate:HTMLElement,inputEndDate:HTMLElement}}
 */
export function createDateIntervalInput(labelText) {
  const parent = document.createElement('div');

  const label = document.createElement('label');
  label.innerText = labelText;
  parent.appendChild(label);

  // start date interval
  const startFromSpan = document.createElement('span');
  startFromSpan.innerText = 'From';
  parent.appendChild(startFromSpan);
  const inputStartDate = document.createElement('input');
  inputStartDate.setAttribute('type', 'date');
  parent.appendChild(inputStartDate);

  // end date interval
  const endFromSpan = document.createElement('span');
  endFromSpan.innerText = 'To';
  parent.appendChild(endFromSpan);
  const inputEndDate = document.createElement('input');
  inputEndDate.setAttribute('type', 'date');
  parent.appendChild(inputEndDate);

  return {
    parent: parent,
    inputStartDate: inputStartDate,
    inputEndDate: inputEndDate,
  };
}
