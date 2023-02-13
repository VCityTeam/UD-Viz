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
 * Method to creates a div element, adds an id to it, appends it to the main div, and then adds all the logos to it
 *
 * @param {HTMLElement} htmlElement parent div to set logos
 * @param {object} configLogos File path where all the logos are located
 */
export function addLogos(htmlElement, configLogos) {
  // Path file for all the logo images
  const logos = configLogos.logos;

  // Path to the logos folder
  const imageFolder = configLogos.imageFolder;

  // Create div to integrate all logos images
  const logoDiv = document.createElement('div');
  logoDiv.className = 'logo-div';
  htmlElement.append(logoDiv);

  for (let i = 0; i < logos.length; i++) {
    const img = document.createElement('img');
    img.src = imageFolder.concat('/'.concat(logos[i]));
    img.classList.add('logos');
    logoDiv.appendChild(img);
  }
}
