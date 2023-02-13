import {
  Frame3DPlanar,
  Frame3DPlanarOption,
} from '../Component/Frame3D/Frame3DPlanar';
import './Mockup.css';

import THREEUtil from '../Component/THREEUtil';
import { addLogos } from '../Component/HTMLUtil';
import { Widget } from '../Component/Component';
const THREE = require('three');

const itowns = require('itowns');
/**
 * @class Simple templates with only the frame3D view and the about widget
 * @param {Frame3DPlanarOption} configFrame3D - Config to create instance of {@link Frame3DPlanar}
 * @param {object} configIcons - Contains differents paths
 * @param {string} configIcons.iconFolder - Path of the icons' folder
 * @param {string} configIcons.logosFolder - Path of the logos' folder
 * @param {string[]} configIcons.logos - Array of paths of logos' file
 * @param {string} configIcons.icon_autenfication_path - Path of authentification's icon file
 */
export class MockUp {
  constructor(extent, configFrame3D, configIcons) {
    /** @type {Frame3DPlanar} */
    this.frame3DPlanar = this.createFrame3DPlanarFromConfig(
      extent,
      document.getElementById(this.contentSectionId),
      configFrame3D
    );

    addLogos(this.frame3DPlanar.ui, configIcons);
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
   * Method to integrate an UD-Viz widget in a  {@link Frame3DPlanar}
   * @param {Widget} widget Widget object to integrate in the 3D scene
   */
  addWidget(widget) {
    widget.parentElement = this.getFrame3DPlanar().getRootWebGL(); // Set the parent HMTL to display the widget div
    widget.enable();
  }
}
