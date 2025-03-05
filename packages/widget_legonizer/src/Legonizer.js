import {
  Vector2Input,
  Vector3Input,
  Vector4Input,
  createLabelInput,
  checkParentChild,
} from '@ud-viz/utils_browser';
import { PlanarView, MAIN_LOOP_EVENTS } from 'itowns';
import {
  BoxGeometry,
  Mesh,
  MeshLambertMaterial,
  Object3DEventMap,
  Vector2,
  Vector3,
  Vector4,
  MeshBasicMaterial,
} from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { InputManager } from '@ud-viz/game_browser';
import { createMockUpObject } from './MockUpUtils';
import { LegoMockupVisualizer } from './LegoMockupVisualizer';
import {
  createHeightMapFromBufferGeometry,
  generateCSVwithHeightMap,
} from 'legonizer';

/**
 * Provides functionality for generating a Lego mockup based on user-defined coordinates and scales.
 */
export class Legonizer {
  /**
   * Init properties and sets up the DOM elements and scene for a planar view.
   *
   * @param {PlanarView} view Represents the 3D view or scene. Objects will be displayed and manipulated.
   * @param {{parentDomElement:HTMLElement,domMockUpVisualizer:HTMLElement,inputManager:InputManager}} [options] Optionals parameter. Represents the user interface element. If no `parentDomElement` parameter is provided, the
   * `domElement` of widget is used. If no `domMockUpVisualizer` a default one is created. `inputManager` can set or one will be created
   */
  constructor(view, options = {}) {
    /** @type {HTMLElement} */
    this.domElement = null;
    /** @type {HTMLElement} */
    this.domMockUpVisualizer = options.domMockUpVisualizer || null;
    /** @type {HTMLElement} */
    this.parentDomElement = options.parentDomElement || this.domElement;
    /** @type {Vector3Input} */
    this.positionVec3Input = null;
    /** @type {Vector3Input} */
    this.rotationVec3Input = null;
    /** @type {Vector3Input} */
    this.scaleVec3Input = null;
    /** @type {Vector2Input} */
    this.countLegoVec2Input = null;
    /** @type {{parent:HTMLDivElement,input:HTMLInputElement,label:HTMLLabelElement}} */
    this.scaleParameterLabelInput = null;
    /** @type {{parent:HTMLDivElement,input:HTMLInputElement,label:HTMLLabelElement}} */
    this.legoHeightParameterLabelInput = null;
    /** @type {HTMLButtonElement} */
    this.buttonSelectionAreaElement = null;
    /** @type {HTMLButtonElement} */
    this.buttonGenerateCSVElement = null;
    /** @type {LegoMockupVisualizer} */
    this.legoMockupVisualizer = null;

    /** @type {PlanarView} */
    this.view = view;

    /** @type {Mesh<BoxGeometry, MeshLambertMaterial, Object3DEventMap>} */
    this.boxSelector = null;
    /** @type {Mesh<BoxGeometry, MeshLambertMaterial, Object3DEventMap>} */
    this.legoPrevisualisation = null;
    /** @type {TransformControls} */
    this.transformCtrls = null;

    /** @type {number} */
    this.scale = 3;

    /** @type {number} */
    this.legoHeight = 10;

    /** @type {any[]} */
    this.heightmap = null;

    this.inputManager = options.inputManager || new InputManager();

    this.initDomElement();
    this.initScene();
    this.view.addFrameRequester(MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE, () => {
      this._updateFieldsFromBoxSelector();
    });
  }

  /**
   * Creates, set `domElement` and returns a DOM element.
   *
   * @returns {HTMLDivElement} `legonizerDomElement` the newly `<div>` element.
   */
  initDomElement() {
    const legonizerDomElement = document.createElement('div');
    legonizerDomElement.appendChild(this.createCoordinatesDomEl());
    legonizerDomElement.appendChild(this.createScaleDomEl());
    // Button Generate Lego Mockup
    const buttonGenerateMockupElement = document.createElement('button');
    buttonGenerateMockupElement.textContent = 'Generate Lego Mockup';
    buttonGenerateMockupElement.onclick = () => {
      this.generateMockup();
    };
    legonizerDomElement.appendChild(buttonGenerateMockupElement);

    this.domElement = legonizerDomElement;

    // button Generate CSV Mockup.
    this.buttonGenerateCSVElement = document.createElement('button');
    this.buttonGenerateCSVElement.textContent = 'Generate CSV Mockup';
    this.buttonGenerateCSVElement.onclick = () => {
      // Generate a CSV file with the heightmap.
      generateCSVwithHeightMap(
        this.heightmap,
        'legoPlates_' +
          this.countLegoVec2Input.x.input.step +
          '_' +
          this.countLegoVec2Input.y.input.step +
          '.csv'
      );
    };
    legonizerDomElement.appendChild(this.buttonGenerateCSVElement);
    this.buttonGenerateCSVElement.disabled = true;

    if (!this.domMockUpVisualizer) {
      const domMockUpVisualizer = document.createElement('div');
      domMockUpVisualizer.style.position = 'relative';
      domMockUpVisualizer.style.width = '100%';
      domMockUpVisualizer.style.aspectRatio = '16/9';
      domMockUpVisualizer.style.cursor = 'pointer';
      this.domMockUpVisualizer = domMockUpVisualizer;
    }
    this.domElement.appendChild(this.domMockUpVisualizer);
    return legonizerDomElement;
  }

  /**
   * Init the scene by creating a box selector, a Lego previsualization, and adding
   * transform controls to the scene.
   */
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

  /**
   * Creates the DOMElement related to the coordinates.
   *
   * @returns {HTMLDivElement} DOM element that contains a set of input fields for position, rotation, and scale, as well as a button for selecting an area.
   */
  createCoordinatesDomEl() {
    // Coordinates Box DOM
    const coordinatesDomElement = document.createElement('div');

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
    this.buttonSelectionAreaElement.textContent = 'Select an area';
    this.buttonSelectionAreaElement.onclick = () => {
      this.selectArea();
    };

    coordinatesDomElement.appendChild(this.buttonSelectionAreaElement);

    return coordinatesDomElement;
  }

  /**
   * Creates the DOMElement related to the scale.
   *
   * @returns {HTMLDivElement} DOM element of Scale Section. **Children:**
   *- **ratio**: This input number controls the accuracy of the heightmap.
   *- **countLego**: This vec2Input parameter specifies the number of plates to be used in the mockup.
   */
  createScaleDomEl() {
    // Scale Box DOM
    const scalesSectionDomElement = document.createElement('div');

    const scaleTitle = document.createElement('h3');
    scaleTitle.innerText = 'Scales Parameters';
    scalesSectionDomElement.appendChild(scaleTitle);

    this.scaleParameterLabelInput = createLabelInput('Scale', 'number');
    this.scaleParameterLabelInput.input.value = 0;
    this.scaleParameterLabelInput.input.addEventListener('change', (event) => {
      const value = event.target.value;
      if (value) {
        this.scale = this.scaleParameterLabelInput.input.value;
        this.boxSelector.updateMatrixWorld();
        this.transformCtrls.updateMatrixWorld();
        this.view.notifyChange();
      }
    });

    scalesSectionDomElement.appendChild(this.scaleParameterLabelInput.parent);

    this.legoHeightParameterLabelInput = createLabelInput(
      'Lego Max height',
      'number'
    );
    this.legoHeightParameterLabelInput.input.value = 10;
    this.legoHeightParameterLabelInput.input.addEventListener(
      'change',
      (event) => {
        const value = event.target.value;
        if (value) {
          this.legoHeight = this.legoHeightParameterLabelInput.input.value;
        }
      }
    );

    scalesSectionDomElement.appendChild(
      this.legoHeightParameterLabelInput.parent
    );

    this.countLegoVec2Input = new Vector2Input('Count Lego', 1, 0);

    this.countLegoVec2Input.x.input.addEventListener('change', (event) => {
      const xValue = event.target.value;
      this.boxSelector.scale.x = xValue * this.scale * 32;
      this.boxSelector.updateMatrixWorld();
      this.transformCtrls.updateMatrixWorld();
      this.view.notifyChange();
    });

    this.countLegoVec2Input.y.input.addEventListener('change', (event) => {
      const yValue = event.target.value;
      this.boxSelector.scale.y = yValue * this.scale * 32;
      this.boxSelector.updateMatrixWorld();
      this.transformCtrls.updateMatrixWorld();
      this.view.notifyChange();
    });

    scalesSectionDomElement.appendChild(this.countLegoVec2Input);
    return scalesSectionDomElement;
  }

  /**
   * Creates a box selector mesh to be used for selecting tiles.
   *
   * @returns {Mesh} The box selector mesh.
   */
  createBoxSelector() {
    // create a unit cube geometry.
    const geometry = new BoxGeometry(1, 1, 1);

    const boxSelector = new Mesh(
      geometry,
      new MeshLambertMaterial({
        color: 0x00ff00,
        opacity: 0.3,
        transparent: true,
      })
    );

    // position the box selector at the center of the tile layer.
    boxSelector.position.x = this.view.tileLayer.extent.center().x;
    boxSelector.position.y = this.view.tileLayer.extent.center().y;
    boxSelector.position.z = 200;

    boxSelector.updateMatrixWorld();

    this.boxSelector = boxSelector;
    return boxSelector;
  }

  /**
   * Creates a Lego previsualization mesh to be used for visualizing the selected area.
   *
   * @returns {Mesh} The Lego previsualization mesh.
   */
  createLegoPrevisualisation() {
    // calculate the dimensions of the Lego previsualization based on the ratio.
    const geometryLego = new BoxGeometry(
      this.scale,
      this.scale,
      (this.scale * 9.6) / 7.8 // Lego dimension
    );

    const objectLego = new Mesh(
      geometryLego,
      new MeshLambertMaterial({
        color: 0x00ff00,
      })
    );

    // position the Lego previsualization at the same position as the box selector.
    objectLego.position.x = this.boxSelector.position.x;
    objectLego.position.y = this.boxSelector.position.y;
    objectLego.position.z = 300;

    objectLego.updateMatrixWorld();

    this.legoPrevisualisation = objectLego;
    return objectLego;
  }

  /**
   * Updates the form fields from the box selector position.
   *
   * @private
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
        Math.trunc(this.boxSelector.scale.x / this.scale / 32),
        Math.trunc(this.boxSelector.scale.y / this.scale / 32)
      )
    );

    this.scaleParameterLabelInput.input.value = this.scale;
  }

  /**
   * Generates a mockup of the selected area using the specified number of Lego plates.
   */
  generateMockup() {
    const bufferBoxGeometry = this.boxSelector.geometry.clone();
    bufferBoxGeometry.applyMatrix4(this.boxSelector.matrixWorld);

    bufferBoxGeometry.computeBoundingBox();

    // Get the number of plates in the x and y directions.
    const xPlates = parseInt(this.countLegoVec2Input.x.input.value);
    const yPlates = parseInt(this.countLegoVec2Input.y.input.value);

    // Get the C3DTiles layers from the view.
    const layers = this.view.getLayers().filter((el) => el.isC3DTilesLayer);

    const mockUpObject = createMockUpObject(
      layers,
      bufferBoxGeometry.boundingBox
    );

    if (!mockUpObject || !mockUpObject.geometry) return;

    // Create a heightmap from the buffer geometry.
    const heightmap = createHeightMapFromBufferGeometry(
      mockUpObject.geometry,
      bufferBoxGeometry.boundingBox,
      xPlates,
      yPlates,
      this.legoHeight
    );

    // Create a Lego mockup visualizer and add the Lego plate simulation.
    if (this.legoMockupVisualizer) {
      this.legoMockupVisualizer.dispose();
      this.buttonGenerateCSVElement.disabled = true;
    }

    this.legoMockupVisualizer = new LegoMockupVisualizer(
      this.domMockUpVisualizer
    );
    this.legoMockupVisualizer.addLegoPlateSimulation(heightmap);
    this.legoMockupVisualizer.generateCadastre(heightmap);

    this.heightmap = heightmap;
    this.buttonGenerateCSVElement.disabled = false;
  }

  /**
   * Toggle the selection area for a Lego model. When is enabled, you can drag the mouse to define a rectangular area in the 3D view.
   */
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
        if (checkParentChild(event.target, this.parentDomElement)) return; // Ui has been clicked

        isDragging = true; // Reset
        minZ = Infinity; // Reset
        maxZ = -Infinity; // Reset

        mouseCoordToWorldCoord(event, worldCoordStart);
        mouseCoordToWorldCoord(event, worldCoordCurrent);

        updateSelectAreaObject();

        this.view.scene.add(selectAreaObject);
      };
      this.inputManager.addMouseInput(
        this.view.domElement,
        'mousedown',
        dragStart
      );

      const dragging = (event) => {
        if (
          checkParentChild(event.target, this.parentDomElement) ||
          !isDragging
        )
          return; // Ui

        mouseCoordToWorldCoord(event, worldCoordCurrent);
        updateSelectAreaObject();
      };
      this.inputManager.addMouseInput(
        this.view.domElement,
        'mousemove',
        dragging
      );

      const dragEnd = () => {
        if (!isDragging) return; // Was not dragging

        this.view.scene.remove(selectAreaObject);
        isDragging = false;

        if (worldCoordStart.equals(worldCoordCurrent)) return; // It is not an area

        this.boxSelector.position.x = selectAreaObject.position.x;
        this.boxSelector.position.y = selectAreaObject.position.y;
        this.boxSelector.position.z = selectAreaObject.position.z;

        // Update scales with the size of a lego plates and the ratio chosen
        const nbPlatesX = Math.abs(
          Math.trunc(selectAreaObject.scale.x / this.scale / 32)
        );

        const nbPlatesY = Math.abs(
          Math.trunc(selectAreaObject.scale.y / this.scale / 32)
        );
        this.boxSelector.scale.x = nbPlatesX * this.scale * 32;
        this.boxSelector.scale.y = nbPlatesY * this.scale * 32;
        this.boxSelector.scale.z = Math.trunc(selectAreaObject.scale.z);
        this.legoPrevisualisation.position.x = selectAreaObject.position.x;
        this.legoPrevisualisation.position.y = selectAreaObject.position.y;
        this.legoPrevisualisation.position.z = selectAreaObject.position.z + 50;
        selectAreaObject.updateMatrixWorld();
        this.boxSelector.updateMatrixWorld();
        this.legoPrevisualisation.updateMatrixWorld();
        this.view.notifyChange(this.view.camera.camera3D);
      };
      this.inputManager.addMouseInput(this.view.domElement, 'mouseup', dragEnd);
    }
  }
}
