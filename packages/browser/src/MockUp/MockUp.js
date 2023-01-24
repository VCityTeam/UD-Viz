import * as Widget from '../Component/Widget/Widget';
const WidgetView = Widget.Component.WidgetView;
import {
  Frame3DPlanar,
  Frame3DPlanarOption,
} from '../Component/Frame3D/Frame3DPlanar';
import './Mockup.css';

import THREEUtil from '../Component/THREEUtil';
const THREE = require('three');

const itowns = require('itowns');
/**
 * @class Represents the base HTML content of a demo for UD-Viz and provides methods to dynamically add widgets.
 */
export class MockUp {
  constructor(extent, configFrame3DPlanar) {
    // allwidget state

    // this.addLogos();

    /** @type {Frame3DPlanar} */
    this.frame3DPlanar = this.createFrame3DPlanarFromConfig(
      extent,
      document.getElementById(this.contentSectionId),
      configFrame3DPlanar
    );
  }

  /**
   * It creates a 3D planar frame from a configuration object
   *
   * @param {itowns.Extent} extent - Geographical bounding rectangle. {@link http://www.itowns-project.org/itowns/docs/#api/Geographic/Extent Extent}
   * @param {HTMLDivElement} parentDiv - the HTML element in which the 3D frame will be created.
   * @param {Frame3DPlanarOption} configFrame3DPlanar - the configuration object for the frame3DPlanar
   * @returns {Frame3DPlanar} A new Frame3DPlanar object.
   */
  createFrame3DPlanarFromConfig(extent, parentDiv, configFrame3DPlanar) {
    let hasItownsControls = true;
    if (configFrame3DPlanar['hasItownsControls'] != undefined) {
      hasItownsControls = configFrame3DPlanar['hasItownsControls'];
    }

    const frame3DPlanar = new Frame3DPlanar(extent, {
      htmlParent: parentDiv,
      hasItownsControls: hasItownsControls,
      coordinates: configFrame3DPlanar['coordinates'],
      maxSubdivisionLevel: configFrame3DPlanar['maxSubdivisionLevel'],
      heading: configFrame3DPlanar['heading'],
      tilt: configFrame3DPlanar['tilt'],
      range: configFrame3DPlanar['range'],
    });

    THREEUtil.addLights(frame3DPlanar.getScene());
    THREEUtil.initRenderer(
      frame3DPlanar.getRenderer(),
      new THREE.Color(0x6699cc)
    );

    return frame3DPlanar;
  }

  /**
   *
   * @returns {Frame3DPlanar} return `this.frame3DPlanar`
   */
  getFrame3DPlanar() {
    return this.frame3DPlanar;
  }

  /**
   * @returns {string} Returns the basic html content of the demo
   */
  get html() {
    return /* html*/ `       
            <div id="_MockUp_stuct_main_panel">
                <nav>
                    <div class="title-ud-viz Text-Style">
                      UD-VIZ
                    </div>
                    <hr>
                    <ul id="${this.menuId}">
                    </ul>
                </nav>
                <section id="${this.contentSectionId}">
                </section>
            </div>
        `;
  }

  /**
   * It creates a div element, adds an id to it, appends it to the main div, and then adds all the logos to it
   */
  addLogos() {
    // Path file for all the logo images
    const logos = this.configAllWidget.logos;

    // Path to the logos folder
    const imageFolder = this.configAllWidget.imageFolder;

    // Create div to integrate all logos images
    const logoDiv = document.createElement('div');
    logoDiv.id = 'logo-div';
    document.getElementById(this.mainDivId).append(logoDiv);

    for (let i = 0; i < logos.length; i++) {
      const img = document.createElement('img');
      img.src = imageFolder.concat('/'.concat(logos[i]));
      img.classList.add('logos');
      logoDiv.appendChild(img);
    }
  }

  // //////////////////////////////////////////////////////
  // GETTERS FOR HTML IDS AND ELEMENTS OF THE DEMO PAGE //
  // //////////////////////////////////////////////////////

  get mainDivId() {
    return '_MockUp';
  }

  get headerId() {
    return '_MockUp_header';
  }

  get headerElement() {
    return document.getElementById(this.headerId);
  }

  get viewerDivId() {
    return 'viewerDiv';
  }

  get viewerDivElement() {
    return document.getElementById(this.viewerDivId);
  }

  get menuId() {
    return '_MockUp_menu';
  }

  get menuElement() {
    return document.getElementById(this.menuId);
  }

  get authenticationUserNameElement() {
    return document.getElementById(this.authenticationUserNameId);
  }

  get contentSectionId() {
    return 'contentSection';
  }

  get contentSectionElement() {
    return document.getElementById(this.contentSectionId);
  }
}
