import * as THREE from 'three';
import * as THREEUtils from '../../Components/THREEUtils';
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
  constructor(html, transform = new THREEUtils.Transform(), resolution = 1) {
    this.uuid = THREE.MathUtils.generateUUID();
    this.html = html;
    this.html.style.width = resolution * transform.scale.x + 'px';
    this.html.style.height = resolution * transform.scale.y + 'px';

    // CSS3DOBJECT
    const newElement = new CSS3DObject(this.html);
    newElement.position.copy(transform.getPosition());
    newElement.rotation.setFromVector3(transform.getRotation());

    const css3DScale = transform.getScale().clone();
    css3DScale.x *= 1 / resolution;
    css3DScale.y *= 1 / resolution;
    css3DScale.z *= 1 / resolution;

    newElement.scale.copy(css3DScale);
    this.css3DObject = newElement;

    // THREE OBJECT
    // mask
    const geometry = new THREE.PlaneGeometry(
      transform.scale.x,
      transform.scale.y
    );
    const plane = new THREE.Mesh(geometry, BLANK_MATERIAL);
    plane.position.copy(transform.getPosition());
    plane.rotation.setFromVector3(transform.getRotation());
    plane.scale.copy(transform.getScale());
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
