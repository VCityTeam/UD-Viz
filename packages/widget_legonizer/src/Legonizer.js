import {
  Vector2Input,
  Vector3Input,
  Vector4Input,
  createLabelInput,
  checkParentChild,
} from '@ud-viz/utils_browser';
import { PlanarView, MAIN_LOOP_EVENTS } from 'itowns';
import { Planar } from '@ud-viz/frame3d';
import {
  BoxGeometry,
  Mesh,
  MeshLambertMaterial,
  Vector2,
  Vector3,
  Vector4,
  MeshBasicMaterial,
} from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { InputManager } from '@ud-viz/game_browser';
import { updateMockUpObject } from './MockUpUtils';
import { LegoMockupVisualizer } from './LegoMockupVisualizer';

export class Legonizer {
  /**
   *
   * @param {Planar} planar
   */
  constructor(planar) {
    /** @type {HTMLElement} */
    this.domElement = null;
    /** @type {Vector3Input} */
    this.positionVec3Input = null;
    /** @type {Vector3Input} */
    this.rotationVec3Input = null;
    /** @type {Vector3Input} */
    this.scaleVec3Input = null;
    /** @type {Vector2Input} */
    this.countLegoVec2Input = null;
    /** @type {{parent:HTMLDivElement,input:HTMLInputElement,label:HTMLLabelElement}} */
    this.ratioParameterLabelInput = null;
    /** @type {HTMLButtonElement} */
    this.buttonSelectionAreaElement = null;

    /** @type {Planar} */
    this.planar = planar;
    /** @type {PlanarView} */
    this.view = planar.itownsView;

    /** @type {Mesh<BoxGeometry, MeshLambertMaterial, Object3DEventMap>} */
    this.boxSelector = null;
    /** @type {Mesh<BoxGeometry, MeshLambertMaterial, Object3DEventMap>} */
    this.legoPrevisualisation = null;
    /** @type {TransformControls} */
    this.transformCtrls = null;

    /** @type {number} */
    this.ratio = 3;

    this.inputManager = new InputManager();

    this.initDomElement();
    this.initScene();
    this.view.addFrameRequester(MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE, () => {
      this._updateFieldsFromBoxSelector();
    });
  }

  initDomElement() {
    const legonizerDomElement = document.createElement('div');
    legonizerDomElement.appendChild(this.createCoordinatesDomEl());
    legonizerDomElement.appendChild(this.createScaleDomEl());
    // Button Generate Lego Mockup
    const buttonGenerateMockupElement = document.createElement('button');
    buttonGenerateMockupElement.id = 'button_generate_Mockup';
    buttonGenerateMockupElement.textContent = 'Generate Lego Mockup';
    buttonGenerateMockupElement.onclick = () => {
      this.generateMockup();
    };
    legonizerDomElement.appendChild(buttonGenerateMockupElement);

    this.domElement = legonizerDomElement;
    return legonizerDomElement;
  }

  initScene() {
    this.createBoxSelector();
    this.createLegoPrevisualisation();

    // Transform controls
    this.transformCtrls = new TransformControls(
      this.view.camera.camera3D,
      this.view.mainLoop.gfxEngine.label2dRenderer.domElement
    );

    // Update view when the box selector is changed
    this.transformCtrls.addEventListener('dragging-changed', (event) => {
      this.view.controls.enabled = !event.value;
    });
    this.transformCtrls.addEventListener('change', () => {
      this.transformCtrls.updateMatrixWorld();
      this.view.notifyChange();
    });
    this.view.scene.add(this.transformCtrls);
    this.view.scene.add(this.boxSelector);
    this.view.scene.add(this.legoPrevisualisation);
  }

  createCoordinatesDomEl() {
    // Coordinates Box DOM
    const coordinatesDomElement = document.createElement('div');
    coordinatesDomElement.id = 'widget_legonizer_vector_container';

    const coordinatesTitle = document.createElement('h3');
    coordinatesTitle.innerText = 'Coordinates';
    coordinatesDomElement.appendChild(coordinatesTitle);

    this.positionVec3Input = new Vector3Input('Position', 1, 0);
    this.positionVec3Input.inputElements.forEach((input) => {
      input.addEventListener('change', (event) => {
        const value = event.target.value;
        if (value) {
          this.boxSelector.position.set(
            parseFloat(this.positionVec3Input.x.input.value),
            parseFloat(this.positionVec3Input.y.input.value),
            parseFloat(this.positionVec3Input.z.input.value)
          );
          this.boxSelector.updateMatrixWorld();
          this.transformCtrls.updateMatrixWorld();
          this.view.notifyChange();
        }
      });
    });
    coordinatesDomElement.appendChild(this.positionVec3Input);

    this.rotationVec3Input = new Vector3Input('Rotation', 1, 0);
    this.rotationVec3Input.inputElements.forEach((input) => {
      input.addEventListener('change', (event) => {
        const value = event.target.value;
        if (value) {
          this.boxSelector.rotation.set(
            parseFloat(this.rotationVec3Input.x.input.value),
            parseFloat(this.rotationVec3Input.y.input.value),
            parseFloat(this.rotationVec3Input.z.input.value)
          );
          this.boxSelector.updateMatrixWorld();
          this.transformCtrls.updateMatrixWorld();
          this.view.notifyChange();
        }
      });
    });
    coordinatesDomElement.appendChild(this.rotationVec3Input);

    this.scaleVec3Input = new Vector3Input('Scale', 1, 0);
    this.scaleVec3Input.inputElements.forEach((input) => {
      input.addEventListener('change', (event) => {
        const value = event.target.value;
        if (value) {
          this.boxSelector.scale.set(
            parseFloat(this.scaleVec3Input.x.input.value),
            parseFloat(this.scaleVec3Input.y.input.value),
            parseFloat(this.scaleVec3Input.z.input.value)
          );
          this.boxSelector.updateMatrixWorld();
          this.transformCtrls.updateMatrixWorld();
          this.view.notifyChange();
        }
      });
    });
    coordinatesDomElement.appendChild(this.scaleVec3Input);

    // Button Select an area
    this.buttonSelectionAreaElement = document.createElement('button');
    this.buttonSelectionAreaElement.id = 'button_selection';
    this.buttonSelectionAreaElement.textContent = 'Select an area';
    this.buttonSelectionAreaElement.onclick = () => {
      this.selectArea();
    };

    coordinatesDomElement.appendChild(this.buttonSelectionAreaElement);

    return coordinatesDomElement;
  }

  createScaleDomEl() {
    // Scale Box DOM
    const scalesSectionDomElement = document.createElement('div');
    scalesSectionDomElement.id = 'widget_legonizer_vector_container';

    const scaleTitle = document.createElement('h3');
    scaleTitle.innerText = 'Scales Parameters';
    scalesSectionDomElement.appendChild(scaleTitle);

    this.ratioParameterLabelInput = createLabelInput('Ratio', 'number');
    this.ratioParameterLabelInput.input.value = 0;
    this.ratioParameterLabelInput.input.addEventListener('change', (event) => {
      const value = event.target.value;
      if (value) {
        this.ratio = this.inputRatioElement.value;
        this.boxSelector.updateMatrixWorld();
        this.transformCtrls.updateMatrixWorld();
        this.view.notifyChange();
      }
    });

    scalesSectionDomElement.appendChild(this.ratioParameterLabelInput.parent);

    this.countLegoVec2Input = new Vector2Input('Count Lego', 1, 0);

    scalesSectionDomElement.appendChild(this.countLegoVec2Input);
    return scalesSectionDomElement;
  }

  createBoxSelector() {
    const geometry = new BoxGeometry(1, 1, 1);
    const boxSelector = new Mesh(
      geometry,
      new MeshLambertMaterial({
        color: 0x00ff00,
        opacity: 0.3,
        transparent: true,
      })
    );

    boxSelector.position.x = this.view.tileLayer.extent.center().x;
    boxSelector.position.y = this.view.tileLayer.extent.center().y;
    boxSelector.position.z = 200;

    boxSelector.updateMatrixWorld();
    this.boxSelector = boxSelector;
    return boxSelector;
  }

  createLegoPrevisualisation() {
    const geometryLego = new BoxGeometry(
      this.ratio,
      this.ratio,
      (this.ratio * 9.6) / 7.8 // Lego dimension
    );
    const objectLego = new Mesh(
      geometryLego,
      new MeshLambertMaterial({
        color: 0x00ff00,
      })
    );

    objectLego.position.x = this.boxSelector.position.x;
    objectLego.position.y = this.boxSelector.position.y;
    objectLego.position.z = 300;

    objectLego.updateMatrixWorld();

    this.legoPrevisualisation = objectLego;

    return objectLego;
  }

  /**
   * Updates the form fields from the box selector position.
   */
  _updateFieldsFromBoxSelector() {
    /**
     * Sets the values of input fields in a vector input
     *
     * @param {Vector2Input | Vector3Input | Vector4Input} vecInput - Contains input fields for each component of a vector.
     * @param {Vector2 | Vector3| Vector4} vector - A vector from three.
     */
    const setVecInputFromVector = (vecInput, vector) => {
      vecInput.x.input.value = vector.x;
      vecInput.y.input.value = vector.y;
      if (vecInput.z) vecInput.z.input.value = vector.z;
      if (vecInput.w) vecInput.w.input.value = vector.w;
    };

    setVecInputFromVector(this.positionVec3Input, this.boxSelector.position);
    setVecInputFromVector(this.rotationVec3Input, this.boxSelector.rotation);
    setVecInputFromVector(this.scaleVec3Input, this.boxSelector.scale);
    setVecInputFromVector(
      this.countLegoVec2Input,
      new Vector2(
        Math.trunc(this.boxSelector.scale.x / this.ratio / 32),
        Math.trunc(this.boxSelector.scale.y / this.ratio / 32)
      )
    );

    this.ratioParameterLabelInput.input.value = this.ratio;
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

    const xPlates = parseInt(this.countLegoVec2Input.x.input.value);
    const yPlates = parseInt(this.countLegoVec2Input.y.input.value);

    const legoVisu = new LegoMockupVisualizer(this.planar);

    const dataSelected = updateMockUpObject(
      this.view.getLayers().filter((el) => el.isC3DTilesLayer),
      bufferBoxGeometry.boundingBox,
      this.boxSelector.quaternion
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
  selectArea() {
    this.view.controls.enabled = !this.view.controls.enabled;

    if (this.view.controls.enabled) {
      this.buttonSelectionAreaElement.textContent = 'Select an area';
      this.inputManager.setPointerLock(false);

      this.inputManager.dispose();

      this.transformCtrls.visible = true;
      this.transformCtrls.attach(this.boxSelector);
      this.transformCtrls.updateMatrixWorld();
    } else {
      this.buttonSelectionAreaElement.textContent = 'Finish';

      this.transformCtrls.detach(this.boxSelector);
      this.transformCtrls.visible = false;

      const rootWelGL = this.view.domElement;

      let isDragging = false;

      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({
        color: 0x0000ff,
        opacity: 0.5,
        transparent: true,
        alphaTest: 0.5,
      });
      const selectAreaObject = new Mesh(geometry, material);

      selectAreaObject.name = 'Select Area Menu Object';

      // Compute z + height of the box
      let minZ, maxZ;

      const mouseCoordToWorldCoord = (event, result) => {
        this.view.getPickingPositionFromDepth(
          new Vector2(event.offsetX, event.offsetY),
          result
        );

        // Compute minZ maxZ according where the mouse is moving TODO check with a step in all over the rect maybe
        minZ = Math.min(minZ, result.z);
        maxZ = Math.max(maxZ, result.z);
        selectAreaObject.position.z = (minZ + maxZ) * 0.5;
        selectAreaObject.scale.z = 50 + maxZ - minZ; // 50 higher to see it
        selectAreaObject.updateMatrixWorld();
        this.view.notifyChange();
      };

      const worldCoordStart = new Vector3();
      const worldCoordCurrent = new Vector3();
      const center = new Vector3();

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
        if (checkParentChild(event.target, this.planar.domElementUI)) return; // Ui has been clicked

        isDragging = true; // Reset
        minZ = Infinity; // Reset
        maxZ = -Infinity; // Reset

        mouseCoordToWorldCoord(event, worldCoordStart);
        mouseCoordToWorldCoord(event, worldCoordCurrent);

        updateSelectAreaObject();

        this.view.scene.add(selectAreaObject);
      };
      this.inputManager.addMouseInput(rootWelGL, 'mousedown', dragStart);

      const dragging = (event) => {
        if (
          checkParentChild(event.target, this.planar.domElementUI) ||
          !isDragging
        )
          return; // Ui

        mouseCoordToWorldCoord(event, worldCoordCurrent);
        updateSelectAreaObject();
      };
      this.inputManager.addMouseInput(rootWelGL, 'mousemove', dragging);

      const dragEnd = () => {
        if (!isDragging) return; // Was not dragging

        this.view.scene.remove(selectAreaObject);
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
        this.view.notifyChange(this.view.camera.camera3D);
      };
      this.inputManager.addMouseInput(rootWelGL, 'mouseup', dragEnd);
    }
  }
}
