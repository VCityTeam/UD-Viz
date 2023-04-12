/** @format */

// Components
import { Window } from '../Component/GUI/js/Window';
import { checkParentChild, InputManager } from '../../Component';
import * as THREE from 'three';
import * as itowns from 'itowns';
// Import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { MAIN_LOOP_EVENTS } from 'itowns';
import { updateMockUpObject } from './MockUpUtils.js';
import { LegoMockupVisualizer } from './LegoMockupVisualizer';
import {
  createHeightMapFromBufferGeometry,
  generateCSVwithHeightMap,
} from 'legonizer';

/**
 *
 *
 */
/*  */
export class LegonizerWindow extends Window {
  constructor(frame3D) {
    super('legonizer', 'Legonizer', false);
    console.log('test');

    this.frame3D = frame3D;

    this.boxSelector;

    this.legoPrevisualisation;

    this.transformCtrls;

    this.itownsController = true;

    this.listeners = [];

    this.ratio = 3;

    this.inputManager = new InputManager();
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
      // Coord Elements
      const coordElement = document.createElement('div');
      coordElement.id = coordinatesString[i] + '_grid';
      coordElement.style.display = 'grid';
      coordElement.style.width = '100%';
      coordElement.style.height = 'auto';

      // Label
      const labelElement = document.createElement('h3');
      labelElement.textContent = coordinatesString[i];

      // Input pos
      const inputElement = document.createElement('input');
      inputElement.id = 'input_' + coordinatesString[i];
      inputElement.type = 'number';
      inputElement.style.width = 'inherit';
      inputElement.setAttribute('value', '0');

      // Event Listener
      inputElement.addEventListener('change', (event) => {
        const value = event.target.value;
        if (value) {
          console.log('change');
          this.boxSelector.position.set(
            parseFloat(this.inputCoordXElement.value),
            parseFloat(this.inputCoordYElement.value),
            parseFloat(this.inputCoordZElement.value)
          );
          this.boxSelector.updateMatrixWorld();
          this.transformCtrls.updateMatrixWorld();
          this.frame3D.getItownsView().notifyChange();
        }
      });

      // Input Scale
      const inputScaleElement = document.createElement('input');
      inputScaleElement.id = 'input_scale_' + coordinatesString[i];
      inputScaleElement.type = 'number';
      inputScaleElement.style.width = 'inherit';
      inputScaleElement.setAttribute('value', '0');

      coordElement.appendChild(labelElement);
      coordElement.appendChild(inputElement);
      coordElement.appendChild(inputScaleElement);

      inputVector.appendChild(coordElement);
    }

    this.coordBoxElement.appendChild(inputVector);

    // Button Select an area
    const buttonSelectionAreaElement = document.createElement('button');
    buttonSelectionAreaElement.id = 'button_selection';
    buttonSelectionAreaElement.textContent = 'Select an area';

    buttonSelectionAreaElement.onclick = () => {
      this.selectArea(!this.itownsController);
    };

    this.coordBoxElement.appendChild(buttonSelectionAreaElement);

    // Button Generate Lego Mockup
    const buttonGenerateMockupElement = document.createElement('button');
    buttonGenerateMockupElement.id = 'button_generate_Mockup';
    buttonGenerateMockupElement.textContent = 'Generate Lego Mockup';

    buttonGenerateMockupElement.onclick = () => {
      this.generateMockup();
    };

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
      inputElement.id = 'input_' + coordinatesString[i];
      inputElement.type = 'number';
      inputElement.style.width = 'inherit';
      inputElement.setAttribute('value', '0');

      // Event listener
      inputElement.addEventListener('change', (event) => {
        const value = event.target.value;
        if (value) {
          const scaleX =
            parseInt(this.inputLegoScaleXElement.value) * this.ratio * 32;

          const scaleY =
            parseInt(this.inputLegoScaleYElement.value) * this.ratio * 32;

          this.boxSelector.scale.set(scaleX, scaleY, this.boxSelector.scale.z);
          this.boxSelector.updateMatrixWorld();
          this.transformCtrls.updateMatrixWorld();
          this.frame3D.getItownsView().notifyChange();
        }
      });

      scaleElement.appendChild(labelElement);
      scaleElement.appendChild(inputElement);

      inputVector.appendChild(scaleElement);
    }

    // Label
    const labelElement = document.createElement('h3');
    labelElement.textContent = 'Ratio parameter';

    // Input pos
    const inputElement = document.createElement('input');
    inputElement.id = 'input_ratio';
    inputElement.type = 'number';
    inputElement.style.width = 'inherit';
    inputElement.setAttribute('value', '0');

    inputElement.addEventListener('change', (event) => {
      const value = event.target.value;
      if (value) {
        this.ratio = this.inputRatioElement.value;

        this.boxSelector.updateMatrixWorld();
        this.transformCtrls.updateMatrixWorld();
        this.frame3D.getItownsView().notifyChange();
      }
    });

    this.scaleBoxElement.appendChild(labelElement);
    this.scaleBoxElement.appendChild(inputElement);
    this.scaleBoxElement.appendChild(inputVector);
  }

  windowCreated() {
    if (!this.boxSelector) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const object = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({
          color: 0x00ff00,
          opacity: 0.3,
          transparent: true,
        })
      );

      object.position.x = this.frame3D.itownsView.tileLayer.extent.center().x;
      object.position.y = this.frame3D.itownsView.tileLayer.extent.center().y;
      object.position.z = 200;

      object.updateMatrixWorld();

      // Box selector
      this.boxSelector = object;
      this.frame3D.getScene().add(this.boxSelector);

      const geometryLego = new THREE.BoxGeometry(
        this.ratio,
        this.ratio,
        (this.ratio * 9.6) / 7.8 // Lego dimension
      );
      const objectLego = new THREE.Mesh(
        geometryLego,
        new THREE.MeshLambertMaterial({
          color: 0x00ff00,
        })
      );

      objectLego.position.x = object.position.x;
      objectLego.position.y = object.position.y;
      objectLego.position.z = 300;

      objectLego.updateMatrixWorld();

      this.legoPrevisualisation = objectLego;
      this.frame3D.getScene().add(this.legoPrevisualisation);

      // Transform controls
      this.transformCtrls = new TransformControls(
        this.frame3D.getCamera(),
        this.frame3D.getItownsView().mainLoop.gfxEngine.label2dRenderer.domElement
      );

      // Update view when the box selector is changed
      this.transformCtrls.addEventListener('dragging-changed', (event) => {
        console.log(event);
        if (event.value) {
          this.frame3D.getItownsView().controls.dispose();
          this.frame3D.getItownsView().controls = null;
          this.frame3D.getItownsView().notifyChange(this.frame3D.getCamera());
          this.transformCtrls.updateMatrixWorld();
        } else {
          const planarControl = new itowns.PlanarControls(
            this.frame3D.getItownsView()
          );
        }
      });

      this.frame3D.getScene().add(this.transformCtrls);
    }

    this.boxSelector.visible = true;
    // HTML content
    this.innerContentCoordinates();
    this.innerContentScale();

    // Request update every active frame
    this.frame3D
      .getItownsView()
      .addFrameRequester(MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE, () => {
        this._updateFieldsFromBoxSelector();
      });
  }

  /**
   * Updates the form fields from the box selector position.
   */
  _updateFieldsFromBoxSelector() {
    if (this.isVisible) {
      const position = this.boxSelector.position;
      this.inputCoordXElement.value = position.x;
      this.inputCoordYElement.value = position.y;
      this.inputCoordZElement.value = position.z;

      this.inputCoordScaleXElement.value = this.boxSelector.scale.x;
      this.inputCoordScaleYElement.value = this.boxSelector.scale.y;
      this.inputCoordScaleZElement.value = this.boxSelector.scale.z;

      this.inputLegoScaleXElement.value = Math.abs(
        Math.trunc(this.boxSelector.scale.x / this.ratio / 32)
      );

      this.inputLegoScaleYElement.value = Math.abs(
        Math.trunc(Math.abs(this.boxSelector.scale.y) / this.ratio / 32)
      );

      this.inputRatioElement.value = this.ratio;
    }
  }

  windowDestroyed() {
    this.boxSelector.visible = false;
    this.transformCtrls.attach(this.boxSelector);
    this.transformCtrls.visible = false;
    this.legoPrevisualisation.visible = false;
  }

  generateMockup() {
    const bufferBoxGeometry = this.boxSelector.geometry.clone();
    bufferBoxGeometry.applyMatrix4(this.boxSelector.matrixWorld);
    bufferBoxGeometry.computeBoundingBox();

    const xPlates = parseInt(this.inputLegoScaleXElement.value);
    const yPlates = parseInt(this.inputLegoScaleYElement.value);

    const legoVisu = new LegoMockupVisualizer(this.frame3D);

    const dataSelected = updateMockUpObject(
      this.frame3D.getLayerManager(),
      bufferBoxGeometry.boundingBox
    );
    const heightmap = createHeightMapFromBufferGeometry(
      dataSelected.geometry,
      32,
      xPlates,
      yPlates
    );

    legoVisu.addLegoPlateSimulation(heightmap, 0, 0);
    generateCSVwithHeightMap(heightmap, 'legoPlates_' + 0 + '_' + 0 + '.csv');
  }

  // Select Area from 3DTiles
  selectArea(value) {
    this.itownsController = value;
    const frame3D = this.frame3D;

    if (value == true) {
      this.buttonSelectionElement.textContent = 'Select an area';

      // Itowns control
      const planarControl = new itowns.PlanarControls(frame3D.getItownsView());

      // Remove pointer lock
      this.inputManager.setPointerLock(false);

      // Enable itowns rendering
      frame3D.setIsRendering(true);

      frame3D.getItownsView().notifyChange(this.frame3D.getCamera());
      this.removeListeners();

      this.transformCtrls.visible = true;
      this.transformCtrls.attach(this.boxSelector);
      this.transformCtrls.updateMatrixWorld();
    } else {
      this.buttonSelectionElement.textContent = 'Finish';

      if (this.transformCtrls) {
        this.transformCtrls.detach(this.boxSelector);
        this.transformCtrls.visible = false;
      }

      // Remove itowns controls
      frame3D.getItownsView().controls.dispose();
      frame3D.getItownsView().controls = null;

      frame3D.setIsRendering(false);

      // Add listeners
      const rootWelGL = frame3D.getRootWebGL();

      let isDragging = false;

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        opacity: 0.5,
        transparent: true,
      });
      const selectAreaObject = new THREE.Mesh(geometry, material);
      selectAreaObject.name = 'Select Area Menu Object';

      // Compute z + height of the box
      let minZ, maxZ;

      const mouseCoordToWorldCoord = (event, result) => {
        frame3D
          .getItownsView()
          .getPickingPositionFromDepth(
            new THREE.Vector2(event.offsetX, event.offsetY),
            result
          );

        // Compute minZ maxZ according where the mouse is moving TODO check with a step in all over the rect maybe
        minZ = Math.min(minZ, result.z);
        maxZ = Math.max(maxZ, result.z);
        selectAreaObject.position.z = (minZ + maxZ) * 0.5;
        selectAreaObject.scale.z = 50 + maxZ - minZ; // 50 higher to see it
        selectAreaObject.updateMatrixWorld();
        frame3D.getItownsView().notifyChange();
      };

      const worldCoordStart = new THREE.Vector3();
      const worldCoordCurrent = new THREE.Vector3();
      const center = new THREE.Vector3();

      const updateSelectAreaObject = () => {
        center.lerpVectors(worldCoordStart, worldCoordCurrent, 0.5);

        // Place on the x y plane
        selectAreaObject.position.x = center.x;
        selectAreaObject.position.y = center.y;

        // Compute scale
        selectAreaObject.scale.x = worldCoordCurrent.x - worldCoordStart.x;
        selectAreaObject.scale.y = worldCoordCurrent.y - worldCoordStart.y;
      };

      const dragStart = (event) => {
        if (checkParentChild(event.target, frame3D.ui)) return; // Ui has been clicked

        isDragging = true; // Reset
        minZ = Infinity; // Reset
        maxZ = -Infinity; // Reset

        mouseCoordToWorldCoord(event, worldCoordStart);
        mouseCoordToWorldCoord(event, worldCoordCurrent);

        updateSelectAreaObject();

        frame3D.getScene().add(selectAreaObject);
      };
      this.inputManager.addMouseInput(rootWelGL, 'mousedown', dragStart);

      const dragging = (event) => {
        if (checkParentChild(event.target, frame3D.ui) || !isDragging) return; // Ui

        mouseCoordToWorldCoord(event, worldCoordCurrent);
        updateSelectAreaObject();
      };
      this.inputManager.addMouseInput(rootWelGL, 'mousemove', dragging);

      const dragEnd = () => {
        if (!isDragging) return; // Was not dragging

        frame3D.getScene().remove(selectAreaObject);
        isDragging = false;

        if (worldCoordStart.equals(worldCoordCurrent)) return; // It is not an area

        this.boxSelector.position.x = selectAreaObject.position.x;
        this.boxSelector.position.y = selectAreaObject.position.y;
        this.boxSelector.position.z = selectAreaObject.position.z;

        // Update scales with the size of a lego plates and teh ratio chosen
        const nbPlatesX = Math.abs(
          Math.trunc(selectAreaObject.scale.x / this.ratio / 32)
        );

        const nbPlatesY = Math.abs(
          Math.trunc(selectAreaObject.scale.y / this.ratio / 32)
        );
        this.boxSelector.scale.x = nbPlatesX * this.ratio * 32;
        this.boxSelector.scale.y = nbPlatesY * this.ratio * 32;
        this.boxSelector.scale.z = Math.trunc(selectAreaObject.scale.z);

        this.legoPrevisualisation.position.x = selectAreaObject.position.x;
        this.legoPrevisualisation.position.y = selectAreaObject.position.y;
        this.legoPrevisualisation.position.z = selectAreaObject.position.z + 50;

        selectAreaObject.updateMatrixWorld();
        this.boxSelector.updateMatrixWorld();
        this.legoPrevisualisation.updateMatrixWorld();
        frame3D.getItownsView().notifyChange(this.frame3D.getCamera());
      };
      this.inputManager.addMouseInput(rootWelGL, 'mouseup', dragEnd);

      // Record for further dispose
      this.listeners.push(dragStart);
      this.listeners.push(dragging);
      this.listeners.push(dragEnd);
    }
  }

  removeListeners() {
    // Remove listeners
    const manager = this.inputManager;
    this.listeners.forEach((listener) => {
      manager.removeInputListener(listener);
    });
    this.listeners.length = 0;
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

  get inputCoordinateXId() {
    return `input_x`;
  }

  get inputCoordinateYId() {
    return `input_y`;
  }

  get inputCoordinateZId() {
    return `input_z`;
  }

  get inputRatioId() {
    return `input_ratio`;
  }

  get buttonSelectionId() {
    return `button_selection`;
  }

  get inputCoordinateScaleXId() {
    return `input_scale_x`;
  }

  get inputCoordinateScaleYId() {
    return `input_scale_y`;
  }

  get inputCoordinateScaleZId() {
    return `input_scale_z`;
  }

  get inputLegoXId() {
    return `input_x count lego plate`;
  }

  get inputLegoYId() {
    return `input_y count lego plate`;
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

  get inputCoordXElement() {
    return document.getElementById(this.inputCoordinateXId);
  }

  get inputCoordYElement() {
    return document.getElementById(this.inputCoordinateYId);
  }

  get inputCoordZElement() {
    return document.getElementById(this.inputCoordinateZId);
  }

  get inputCoordScaleXElement() {
    return document.getElementById(this.inputCoordinateScaleXId);
  }

  get inputCoordScaleYElement() {
    return document.getElementById(this.inputCoordinateScaleYId);
  }

  get inputCoordScaleZElement() {
    return document.getElementById(this.inputCoordinateScaleZId);
  }

  get inputRatioElement() {
    return document.getElementById(this.inputRatioId);
  }

  get buttonSelectionElement() {
    return document.getElementById(this.buttonSelectionId);
  }

  get inputLegoScaleXElement() {
    return document.getElementById(this.inputLegoXId);
  }

  get inputLegoScaleYElement() {
    return document.getElementById(this.inputLegoYId);
  }
}
