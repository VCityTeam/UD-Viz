import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { Color } from 'three';

const BLANK_MATERIAL = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  opacity: 0,
  transparent: true,
  blending: THREE.NoBlending,
  color: new Color(0, 0, 0),
});

export class Billboard {
  constructor(html, position, rotation, scale, resolution = 1) {
    this.uuid = THREE.MathUtils.generateUUID();
    this.html = html;
    this.html.style.width = resolution * scale.x + 'px';
    this.html.style.height = resolution * scale.y + 'px';

    // CSS3DOBJECT
    const newElement = new CSS3DObject(this.html);
    newElement.position.copy(position);
    newElement.rotation.setFromVector3(rotation);

    const css3DScale = scale.clone();
    css3DScale.x *= 1 / resolution;
    css3DScale.y *= 1 / resolution;
    css3DScale.z *= 1 / resolution;

    newElement.scale.copy(css3DScale);
    this.css3DObject = newElement;

    // THREE OBJECT
    // mask
    const geometry = new THREE.PlaneGeometry(scale.x, scale.y);
    const plane = new THREE.Mesh(geometry, BLANK_MATERIAL);
    plane.position.copy(position);
    plane.rotation.setFromVector3(rotation);
    plane.scale.copy(scale);
    plane.updateMatrixWorld();
    this.maskObject = plane;

    // Flag
    this.select(false);
  }

  getHtml() {
    return this.html;
  }

  select(value) {
    this.isSelected = value;
    if (value) {
      this.html.style.filter = 'grayscale(0%)';
    } else {
      this.html.style.filter = 'grayscale(100%)';
    }
  }

  lookAt(vector) {
    this.maskObject.lookAt(vector);
    this.css3DObject.lookAt(vector);
  }

  getMaskObject() {
    return this.maskObject;
  }

  getCss3DObject() {
    return this.css3DObject;
  }
}
