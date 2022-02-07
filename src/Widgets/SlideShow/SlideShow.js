/** @format */

//Components
import { Window } from '../Components/GUI/js/Window';
import * as THREE from 'three';
import { Vector2 } from 'three';
import { color } from 'd3';
import { LinkedWithFilteredDocumentsFilter } from '../Links/ViewModel/CityObjectLinkFilters';

export class SlideShow extends Window {
  constructor(app) {
    super('slideShow', 'Slide Show', false);
    this.app = app;
    this.extent = app.extent;
    this.view = app.view;

    this.htmlSlideShow = null;
    this.coordinatesElement = null;
    this.quaternionElement = null;
    this.sizeElement = null;

    this.matchExtentButton = null;

    this.coordinatesVector = new THREE.Vector3();
    this.quaternionVector = new THREE.Vector4();
    this.sizeVector = new THREE.Vector2();

    this.callbacksHTMLEl = [];

    this.plane = null;

    this.initHtml();
  }

  initHtml() {
    const htmlSlideShow = document.createElement('div');
    this.htmlSlideShow = htmlSlideShow;

    this.coordinatesElement = this.createInputVector(
      ['X', 'Y', 'Z'],
      'Coordinates'
    );
    htmlSlideShow.appendChild(this.coordinatesElement.title);
    htmlSlideShow.appendChild(this.coordinatesElement.inputVector);

    this.quaternionElement = this.createInputVector(
      ['X', 'Y', 'Z', 'W'],
      'Quaternion'
    );
    htmlSlideShow.appendChild(this.quaternionElement.title);
    htmlSlideShow.appendChild(this.quaternionElement.inputVector);

    this.sizeElement = this.createInputVector(['Height', 'Width'], 'Size');
    htmlSlideShow.appendChild(this.sizeElement.title);
    htmlSlideShow.appendChild(this.sizeElement.inputVector);

    const matchExtentButton = document.createElement('button');
    matchExtentButton.id = '_button_match_extent';
    matchExtentButton.innerHTML = 'Match Extent';
    this.callbacksHTMLEl.push({
      event: 'click',
      id: matchExtentButton.id,
      cb: function () {
        const extentCenter = this.extent.center();
        this.setSize(
          new THREE.Vector2(
            Math.abs(this.extent.west - this.extent.east),
            Math.abs(this.extent.north - this.extent.south)
          )
        );
        this.setCoordinates(
          new THREE.Vector3(extentCenter.x, extentCenter.y, 200)
        );
      },
    });
    this.matchExtentButton = matchExtentButton;
    htmlSlideShow.appendChild(matchExtentButton);
  }

  windowCreated() {
    const _this = this;
    this.callbacksHTMLEl.forEach(function (element) {
      const htmlElement = document.getElementById(element.id);
      htmlElement.addEventListener(element.event, element.cb.bind(_this));
    });
  }

  createInputVector(labels, vectorName) {
    const titleVector = document.createElement('h3');
    titleVector.innerHTML = vectorName;

    const inputVector = document.createElement('div');
    inputVector.style.display = 'grid';
    for (let iInput = 0; iInput < labels.length; iInput++) {
      const labelElement = document.createElement('label');
      labelElement.innerHTML = labels[iInput];

      const componentElement = document.createElement('input');
      componentElement.id = vectorName + labelElement.innerHTML;
      componentElement.type = 'number';
      componentElement.setAttribute('value', '0');
      componentElement.step = 0.5;

      labelElement.htmlFor = componentElement.id;
      this.callbacksHTMLEl.push({
        event: 'change',
        id: componentElement.id,
        cb: function (event) {
          componentElement.setAttribute('value', event.target.value);
          this.setVectors();
        },
      });

      inputVector.appendChild(labelElement);
      inputVector.appendChild(componentElement);
    }
    return { title: titleVector, inputVector: inputVector };
  }

  setVectors() {
    this.coordinatesVector =
      this.inputVectorToVector(this.coordinatesElement.inputVector) ||
      new THREE.Vector3();

    this.quaternionVector =
      this.inputVectorToVector(this.quaternionElement.inputVector) ||
      new THREE.Vector4();

    this.sizeVector =
      this.inputVectorToVector(this.sizeElement.inputVector) ||
      new THREE.Vector2();

    console.log(this.coordinatesVector, this.quaternionVector, this.sizeVector);
    this.createPlane();
  }

  inputVectorToVector(inputVector) {
    const inputEls = inputVector.getElementsByTagName('input');
    const countEls = inputEls.length;
    switch (countEls) {
      case 2:
        return new THREE.Vector2(inputEls[0].value, inputEls[1].value);
      case 3:
        return new THREE.Vector3(
          inputEls[0].value,
          inputEls[1].value,
          inputEls[2].value
        );
      case 4:
        return new THREE.Vector4(
          inputEls[0].value,
          inputEls[1].value,
          inputEls[2].value,
          inputEls[3].value
        );
    }

    return null;
  }

  setSize(vec2) {
    const sizeInputEls =
      this.sizeElement.inputVector.getElementsByTagName('input');
    const element0 = document.getElementById(sizeInputEls[0].id);
    element0.value = vec2.x;
    element0.dispatchEvent(new Event('change'));

    const element1 = document.getElementById(sizeInputEls[1].id);
    element1.value = vec2.y;
    element1.dispatchEvent(new Event('change'));
  }

  setCoordinates(vec3) {
    const sizeInputEls =
      this.coordinatesElement.inputVector.getElementsByTagName('input');
    const element0 = document.getElementById(sizeInputEls[0].id);
    element0.value = vec3.x;
    element0.dispatchEvent(new Event('change'));

    const element1 = document.getElementById(sizeInputEls[1].id);
    element1.value = vec3.y;
    element1.dispatchEvent(new Event('change'));

    const element2 = document.getElementById(sizeInputEls[2].id);
    element2.value = vec3.z;
    element2.dispatchEvent(new Event('change'));
  }

  get innerContentHtml() {
    return this.htmlSlideShow.outerHTML;
  }

  createPlane() {
    if (this.plane) {
      this.plane.removeFromParent();
    }
    const geometry = new THREE.PlaneGeometry(
      this.sizeVector.x,
      this.sizeVector.y
    );

    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });

    this.plane = new THREE.Mesh(geometry, material);

    this.plane.position.set(
      this.coordinatesVector.x,
      this.coordinatesVector.y,
      this.coordinatesVector.z
    );

    this.plane.quaternion.set(
      this.quaternionVector.x,
      this.quaternionVector.y,
      this.quaternionVector.z,
      this.quaternionVector.w
    );

    this.plane.updateMatrixWorld();
    this.view.scene.add(this.plane);
    this.app.update3DView();
  }
}
