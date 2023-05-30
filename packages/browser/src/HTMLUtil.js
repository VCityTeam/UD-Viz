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

  return { parent: parent, input: input };
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
