/** @format */

// Components
import { Window } from '../Components/GUI/js/Window';
import * as THREE from 'three';
import './../About/About.css';

/**
 *
 *
 */
export class LegonizerWindow extends Window {
  constructor(view3D) {
    super('legonizer', 'Legonizer', false);

    this.view3D = view3D;
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

  innerContentCoordinates() {
    const inputVector = document.createElement('div');
    inputVector.id = 'Coordinates' + '_inputVector';
    inputVector.style.display = 'inline-flex';

    const coordinatesString = ['x', 'y', 'z'];

    for (let i = 0; i < 3; i++) {
      // //coord Elements
      const coordElement = document.createElement('div');
      coordElement.id = coordinatesString[i] + '_grid';
      coordElement.style.display = 'grid';
      coordElement.style.width = '30%';
      coordElement.style.height = 'auto';

      // Label
      const labelElement = document.createElement('h3');
      labelElement.textContent = coordinatesString[i];

      // Input
      const inputElement = document.createElement('input');
      inputElement.id = 'input' + coordinatesString[i];
      inputElement.type = 'number';
      inputElement.style.width = 'inherit';
      inputElement.setAttribute('value', '0');

      coordElement.appendChild(labelElement);
      coordElement.appendChild(inputElement);

      inputVector.appendChild(coordElement);
    }

    this.coordBoxElement.appendChild(inputVector);

    // Button Select an area
    const buttonSelectionAreaElement = document.createElement('button');
    buttonSelectionAreaElement.id = 'button_selection';
    buttonSelectionAreaElement.textContent = 'Select an area';

    this.coordBoxElement.appendChild(buttonSelectionAreaElement);

    // Button Generate Lego Mockup
    const buttonGenerateMockupElement = document.createElement('button');
    buttonGenerateMockupElement.id = 'button_generate_Mockup';
    buttonGenerateMockupElement.textContent = 'Generate Lego Mockup';

    buttonGenerateMockupElement.addEventListener('click', this.generateMockup);

    this.parametersElement.appendChild(buttonGenerateMockupElement);
  }

  innerContentScale() {
    const inputVector = document.createElement('div');
    inputVector.id = 'lego' + '_inputVector';
    inputVector.style.display = 'inline-flex';

    const coordinatesString = ['x count lego plate', 'y count lego plate'];

    for (let i = 0; i < 2; i++) {
      // //coord Elements
      const scaleElement = document.createElement('div');
      scaleElement.id = coordinatesString[i] + '_grid';
      scaleElement.style.display = 'grid';
      scaleElement.style.width = '50%';
      scaleElement.style.height = 'auto';

      // Label
      const labelElement = document.createElement('h3');
      labelElement.textContent = coordinatesString[i];

      // Input
      const inputElement = document.createElement('input');
      inputElement.id = 'input' + coordinatesString[i];
      inputElement.type = 'number';
      inputElement.style.width = 'inherit';
      inputElement.setAttribute('value', '0');

      scaleElement.appendChild(labelElement);
      scaleElement.appendChild(inputElement);

      inputVector.appendChild(scaleElement);
    }

    this.scaleBoxElement.appendChild(inputVector);
  }

  windowCreated() {
    this.innerContentCoordinates();
    this.innerContentScale();
    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const object = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    );

    object.position.x = this.view3D.extent.center().x;
    object.position.y = this.view3D.extent.center().y;
    object.position.z = this.view3D.extent.center().z;

    this.view3D.getItownsView().scene.add(object);
  }

  generateMockup() {
    // Create THREE js window with heightmap mesh
    const mockupWindow = new Window('MockupWindow', 'Mockup Window', true);
    // MockupWindow.innerContentHtml = `<div id="lego_mockup_window">`;
    const mockupElement = mockupWindow.header;
    console.log(mockupElement);
    mockupElement.style.left = 'unset';
    mockupElement.style.right = '10px';
    mockupElement.style.top = '10px';
    mockupElement.style.height = 'auto';
    mockupElement.style.width = '30%';
    mockupElement.style.borderRadius = '15px';
  }

  // //// GETTERS
  // /ID

  get coordBoxSectionId() {
    return `box_section_coordinates`;
  }

  get scaleSectionId() {
    return `box_section_scale`;
  }

  get paramLegonizerId() {
    return `div_parameters`;
  }

  get coordBoxElement() {
    return document.getElementById(this.coordBoxSectionId);
  }

  get parametersElement() {
    return document.getElementById(this.paramLegonizerId);
  }

  get scaleBoxElement() {
    return document.getElementById(this.scaleSectionId);
  }
}
