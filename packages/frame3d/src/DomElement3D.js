import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { Color } from 'three';

/**
 * Material making an "hole" in a {@link THREE.Scene} to see html css3D behind
 *
 * @type {THREE.MeshBasicMaterial}
 */
const BLANK_MATERIAL = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  opacity: 0,
  transparent: true,
  blending: THREE.NoBlending,
  color: new Color(0, 0, 0),
});

/** @class */
export class DomElement3D extends THREE.Object3D {
  /**
   * Composed of a {@link CSS3DObject} containing html and a {@link THREE.Object3D} superposing each other
   *
   * @param {HTMLElement} domElement - dom element
   */
  constructor(domElement) {
    super();

    /**
     * uuid
     *
      @type {string} */
    this.uuid = THREE.MathUtils.generateUUID();

    /**
     * html element of css3Dobject
     *
      @type {HTMLElement} */
    this.domElement = domElement;

    /**
     * css3D object
     *
      @type {CSS3DObject}  */
    this.css3DObject = new CSS3DObject(this.domElement);

    /**
     * mask superposing css3DObject
     *
      @type {THREE.Object3D} */
    this.maskObject = new THREE.Mesh(new THREE.PlaneGeometry(), BLANK_MATERIAL);
    this.add(this.maskObject);

    /**
     * selected (css style is different if true or false)
     *
      @type {boolean} */
    this.isSelected = false;
    this.select(this.isSelected);
  }

  updateMatrixWorld(...args) {
    super.updateMatrixWorld(...args);

    const worldPosition = new THREE.Vector3();
    const worldQuaternion = new THREE.Quaternion();
    const worldScale = new THREE.Vector3();

    this.maskObject.matrixWorld.decompose(
      worldPosition,
      worldQuaternion,
      worldScale
    );

    // update also css element
    this.css3DObject.position.copy(worldPosition);
    this.css3DObject.quaternion.copy(worldQuaternion);

    // TODO : understand how this is working
    this.domElement.style.width = (worldScale.x * 39) / 500 + '%'; // 41 600
    this.domElement.style.height = (worldScale.y * 50) / 500 + '%'; // 67 600
  }

  /**
   * Set if this is selected or not and update css style
   *
   * @param {boolean} value - new selected value
   */
  select(value) {
    this.isSelected = value;
    if (value) {
      this.domElement.style.filter = 'grayscale(0%)';
    } else {
      this.domElement.style.filter = 'grayscale(100%)';
    }
  }
}
