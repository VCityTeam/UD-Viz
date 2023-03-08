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
