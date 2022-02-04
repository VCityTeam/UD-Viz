/** @format */

//Components
import { Window } from '../Components/GUI/js/Window';

export class SlideShow extends Window {
  constructor(parentHtml) {
    super('slideShow', 'Slide Show', false);

    this.parentHtml = parentHtml;
    this.htmlSlideShow = null;
    this.initHtml();
  }

  initHtml() {
    const htmlSlideShow = document.createElement('div');

    this.htmlSlideShow = htmlSlideShow;
  }

  get innerContentHtml() {
    return this.htmlSlideShow;
  }
}
