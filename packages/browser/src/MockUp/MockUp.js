import * as Widget from '../Component/Widget/Widget';
const WidgetView = Widget.Component.WidgetView;
import {
  Frame3DPlanar,
  Frame3DPlanarOption,
} from '../Component/Frame3D/Frame3DPlanar';
import './Mockup.css';

import THREEUtil from '../Component/THREEUtil';
import { addLogos } from '../Component/HTMLUtil';
const THREE = require('three');

const itowns = require('itowns');
/**
 * @class Represents the base HTML content of a demo for UD-Viz and provides methods to dynamically add widgets.
 */
export class MockUp {
  constructor(extent, config) {
    // this.addLogos();

    /** @type {Frame3DPlanar} */
    this.frame3DPlanar = this.createFrame3DPlanarFromConfig(
      extent,
      document.getElementById(this.contentSectionId),
      config['frame3D_planars'][0]
    );

    // About window
    const about = new Widget.AboutWindow(config['about']);
    about.parentElement = this.getFrame3DPlanar().getRootWebGL();
    about.enableView();

    addLogos(this.frame3DPlanar.ui, config['']);

    // //// HELP MODULE
    // new udvizBrowser.Widget.HelpWindow(configs['help']); // => help window should be add with addWidgetView
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

  // //////////////////////////////////////////////////////
  // GETTERS FOR HTML IDS AND ELEMENTS OF THE DEMO PAGE //
  // //////////////////////////////////////////////////////

  get headerElement() {
    return document.getElementById(this.headerId);
  }

  get viewerDivId() {
    return 'viewerDiv';
  }

  get contentSectionElement() {
    return document.getElementById(this.contentSectionId);
  }
}
