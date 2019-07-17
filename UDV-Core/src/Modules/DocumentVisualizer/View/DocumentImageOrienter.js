import { AbstractDocumentWindow } from "../../Documents/View/AbstractDocumentWindow";

import './DocumentImageOrienter.css';

export class DocumentImageOrienter extends AbstractDocumentWindow {
  constructor() {
    super('Image Orienter');
    this.defaultStyle = false;
    this.windowDisplayWhenVisible = 'block';
  }

  get html() {
    return /*html*/`
      <img/>
      <div>
        <button>Close</button>
        <button>Orient Document</button>
        <label for="docOpaSlider2">Opacity</label>
        <input id="docOpaSlider2" type="range" min="0" max="100" value="75"
        step="1">
        <output for="docOpaSlider2">50</output>
      </div>
    `;
  }

  windowCreated() {
    this.hide();
    this.window.style.position = 'absolute';
  }

  startTravel() {
    this.view.requestWindowDisplay(this);

    console.log('hello');
    console.log(this);
  }

  /////////////
  ///// GETTERS
}