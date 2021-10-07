import * as THREE from 'three';
import THREEUtils from '../../Game/Shared/Components/THREEUtils';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

const BLANK_MATERIAL = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  opacity: 0,
  blending: THREE.NoBlending,
});

export class Billboard {
  constructor(html, transform = new THREEUtils.Transform()) {
    this.uuid = THREE.MathUtils.generateUUID();

    this.html = html;
    this.html.style.width = transform.scale.x + 'px';
    this.html.style.height = transform.scale.y + 'px';

    //CSS3DOBJECT
    const newElement = new CSS3DObject(this.html);
    newElement.position.copy(transform.getPosition());
    newElement.rotation.setFromVector3(transform.getRotation());
    newElement.scale.copy(transform.getScale());
    this.css3DObject = newElement;

    //THREE OBJECT
    //mask
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

    //flag
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

  getMaskObject() {
    return this.maskObject;
  }

  getCss3DObject() {
    return this.css3DObject;
  }
}
