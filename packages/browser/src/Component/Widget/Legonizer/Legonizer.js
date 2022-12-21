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

    // Button Selecte an area
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

  windowCreated() {
    this.innerContentCoordinates();
  }

  generateMockup() {
    // Create THREE js window with heightmap mesh
    const mockupWindow = new Window('MockupWindow', 'Mockup Window', true);
    // mockupWindow.innerContentHtml = `<div id="lego_mockup_window">`;
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

  get paramLegonizerId() {
    return `div_parameters`;
  }

  get coordBoxElement() {
    return document.getElementById(this.coordBoxSectionId);
  }

  get parametersElement() {
    return document.getElementById(this.paramLegonizerId);
  }
}
