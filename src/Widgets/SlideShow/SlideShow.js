/** @format */

//Components
import { Window } from '../Components/GUI/js/Window';

export class SlideShow extends Window {
  constructor() {
    super('slideShow', 'Slide Show', false);
    this.htmlSlideShow = null;
    this.initHtml();
  }

  initHtml() {
    const htmlSlideShow = document.createElement('div');
    this.htmlSlideShow = htmlSlideShow;

    this.createInputVector(['X', 'Y', 'Z'], 'Coordinates');
    this.createInputVector(['X', 'Y', 'Z', 'W'], 'Quaternion');
    this.createInputVector(['Height', 'Width'], 'Size');
  }

  createInputVector(labels, vectorName) {
    const titleVector = document.createElement('h3');
    titleVector.innerHTML = vectorName;

    const inputVector = document.createElement('div');
    inputVector.style.display = 'grid';
    for (let iInput = 0; iInput < labels.length; iInput++) {
      const labelElement = document.createElement('label');
      labelElement.innerHTML = labels[iInput];

      const componentElement = document.createElement('input');
      componentElement.id = vectorName + labelElement.innerHTML;
      componentElement.type = 'number';
      componentElement.setAttribute('value', '0');
      componentElement.step = 0.1;

      labelElement.htmlFor = componentElement.id;

      inputVector.appendChild(labelElement);
      inputVector.appendChild(componentElement);
    }
    this.htmlSlideShow.appendChild(titleVector);
    this.htmlSlideShow.appendChild(inputVector);
  }

  get innerContentHtml() {
    return this.htmlSlideShow.outerHTML;
  }
}
