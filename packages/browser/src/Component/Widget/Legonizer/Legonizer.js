/** @format */

// Components
import { Window } from '../Components/GUI/js/Window';
// Import jQuery from 'jquery';
import './../About/About.css';

/**
 *
 *
 */
export class LegonizerWindow extends Window {
  constructor() {
    super('legonizer', 'Legonizer', false);
  }

  get innerContentHtml() {
    return `
    <div id="${this.paramLegonizerId}">
      <div class="box-section" id="${this.coordBoxSectionId}"> 
        <label for="color-layers-spoiler" class="section-title">Coordinates</Label>
      </div>
      <div class="box-section" id="${this.scaleSectionId}"> 
        <label for="elevation-layers-spoiler" class="section-title">Scales parameters</Label>
      </div>
    </div>`;
  }

  // ///// MODULE VIEW MANAGEMENT
  // enableView() {
  //   const widgetlayout = document.getElementById('_window_widget_content');
  //   widgetlayout.style.setProperty('display', 'block');
  //   widgetlayout.innerHTML = '';
  //   // Create HMTL
  //   const promises = [];
  //   if (this.config.htmlPaths && this.config.htmlPaths.length) {
  //     this.config.htmlPaths.forEach(function (path) {
  //       promises.push(
  //         new Promise((resolve, reject) => {
  //           jQuery.ajax({
  //             type: 'GET',
  //             url: path,
  //             datatype: 'html',
  //             success: (data) => {
  //               widgetlayout.innerHTML += data;
  //               resolve();
  //             },
  //             error: (e) => {
  //               console.error(e);
  //               reject();
  //             },
  //           });
  //         })
  //       );
  //     });
  //   }
  // }

  // disableView() {
  //   document
  //     .getElementById('_window_widget_content')
  //     .style.setProperty('display', 'none');
  //   document.getElementById('_window_widget_content').innerHTML = '';
  // }
}
