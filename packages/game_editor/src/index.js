import { Object3D as GameObject3D, RenderComponent } from '@ud-viz/game_shared';
import { AssetManager, RenderController } from '@ud-viz/game_browser';
import {
  Object3D,
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  AmbientLight,
  Box3,
  Vector3,
  MathUtils,
  Quaternion,
  Line,
  LineBasicMaterial,
  BufferGeometry,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

import './style.css';
import {
  cameraFitRectangle,
  createLabelInput,
  RequestAnimationFrameProcess,
} from '@ud-viz/utils_browser/src';

Object3D.DEFAULT_UP.set(0, 0, 1);

export class Editor {
  constructor(gameScripts, externalScripts, assetManager) {
    this.gameScripts = gameScripts;
    this.externalScripts = externalScripts;

    /** @type {AssetManager} */
    this.assetManager = assetManager;

    /** @type {HTMLElement} */
    this.domElement = document.createElement('div');

    /** @type {HTMLElement} */
    this.domElementUI = document.createElement('div');
    this.domElementUI.classList.add('editor_full_screen');
    this.domElement.appendChild(this.domElementUI);

    /** @type {HTMLElement} */
    this.leftPan = document.createElement('div');
    this.leftPan.setAttribute('id', 'left_pan');
    this.domElementUI.appendChild(this.leftPan);

    /** @type {HTMLElement} */
    this.currentGODomelement = document.createElement('div');
    this.currentGODomelement.setAttribute('id', 'current_game_object_3d');
    this.leftPan.appendChild(this.currentGODomelement);

    /** @type {HTMLElement} */
    this.toolsDomElement = document.createElement('div');
    this.toolsDomElement.setAttribute('id', 'editor_tools');
    this.leftPan.appendChild(this.toolsDomElement);

    /** @type {GameObject3DInput} */
    this.gameObjectInput = new GameObject3DInput();
    this.gameObjectInput.setAttribute('id', 'select_game_object_3d');
    this.leftPan.appendChild(this.gameObjectInput);

    const canvasContainer = document.createElement('div');
    const canvas = document.createElement('canvas');
    canvasContainer.appendChild(canvas);
    canvasContainer.classList.add('editor_full_screen');
    canvas.classList.add('editor_full_screen');
    this.domElement.appendChild(canvasContainer);

    /** @type {WebGLRenderer} */
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
    });
    this.resizeListener = () => {
      this.camera.aspect =
        canvasContainer.clientWidth / canvasContainer.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(
        canvasContainer.clientWidth,
        canvasContainer.clientHeight
      );
    };
    window.addEventListener('resize', this.resizeListener);

    /** @type {Scene} */
    this.scene = new Scene();

    // draw referential line
    {
      const maxSize = 100000;
      const lineX = new Line(
        new BufferGeometry().setFromPoints([
          new Vector3(-maxSize, 0, 0),
          new Vector3(maxSize, 0, 0),
        ]),
        new LineBasicMaterial({ color: 'red', linewidth: 1 })
      );
      this.scene.add(lineX);
      const lineY = new Line(
        new BufferGeometry().setFromPoints([
          new Vector3(0, -maxSize, 0),
          new Vector3(0, maxSize, 0),
        ]),
        new LineBasicMaterial({ color: 'green', linewidth: 1 })
      );
      this.scene.add(lineY);
      const lineZ = new Line(
        new BufferGeometry().setFromPoints([
          new Vector3(0, 0, -maxSize),
          new Vector3(0, 0, maxSize),
        ]),
        new LineBasicMaterial({ color: 'blue', linewidth: 1 })
      );
      this.scene.add(lineZ);
    }

    /** @type {PerspectiveCamera} */
    this.camera = new PerspectiveCamera(60, 1, 1, 1000); // Default params

    this.scene.add(new AmbientLight('white', 0.6));
    this.scene.add(this.camera);

    /** @type {OrbitControls} */
    this.orbitControls = new OrbitControls(this.camera, canvasContainer);

    /** @type {TransformControls} */
    this.transformControls = new TransformControls(
      this.camera,
      canvasContainer
    );
    this.scene.add(this.transformControls);

    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.orbitControls.enabled = !event.value;
    });

    this.transformControls.addEventListener('change', (event) => {
      this.gameObjectInput.updateTransform();
    });
    this.transformControls.addEventListener('mouseUp', () => this.updateBox3());

    // gizmo mode ui
    {
      const addButtonMode = (mode) => {
        const buttonMode = document.createElement('button');
        buttonMode.innerText = mode;
        this.toolsDomElement.appendChild(buttonMode);

        buttonMode.onclick = () => {
          this.transformControls.setMode(mode);
        };
      };
      addButtonMode('translate');
      addButtonMode('rotate');
      addButtonMode('scale');
    }

    /** @type {HTMLElement} */
    this.buttonFocusGameObject3D = document.createElement('button');
    this.buttonFocusGameObject3D.innerText = 'Focus GameObject3D';
    this.toolsDomElement.appendChild(this.buttonFocusGameObject3D);

    /** @type {RequestAnimationFrameProcess} */
    this.process = new RequestAnimationFrameProcess(30);
    this.process.start(() => {
      this.renderer.render(this.scene, this.camera);
    });

    /** @type {GameObject3D|null} */
    this.currentGameObject3D = null;

    /** @type {Box3} */
    this.currentGameObjectMeshBox3 = new Mesh(
      new BoxGeometry(),
      new MeshBasicMaterial({ color: 'black', wireframe: true })
    );
    this.scene.add(this.currentGameObjectMeshBox3);
    this.gameObjectInput.addEventListener(
      GameObject3DInput.EVENT.TRANSFORM_CHANGED,
      () => this.updateBox3()
    );

    // camera move
    {
      const selectCameraPOV = document.createElement('select');
      this.toolsDomElement.appendChild(selectCameraPOV);

      const buffer = new Map();
      const addOption = (label, callback) => {
        const option = document.createElement('option');
        option.innerText = label;
        option.value = label;
        buffer.set(label, callback);
        selectCameraPOV.appendChild(option);
      };

      selectCameraPOV.oninput = () => {
        const radius = this.camera.position.distanceTo(
          this.orbitControls.target
        );
        buffer.get(selectCameraPOV.selectedOptions[0].value)(radius);
        this.camera.updateMatrixWorld();
        this.orbitControls.update();
      };

      addOption('+X', (radius) => {
        this.camera.position.y = this.orbitControls.target.y;
        this.camera.position.z = this.orbitControls.target.z;
        this.camera.position.x = radius;
      });

      addOption('-X', (radius) => {
        this.camera.position.y = this.orbitControls.target.y;
        this.camera.position.z = this.orbitControls.target.z;
        this.camera.position.x = -radius;
      });

      addOption('+Y', (radius) => {
        this.camera.position.x = this.orbitControls.target.x;
        this.camera.position.z = this.orbitControls.target.z;
        this.camera.position.y = radius;
      });

      addOption('-Y', (radius) => {
        this.camera.position.x = this.orbitControls.target.x;
        this.camera.position.z = this.orbitControls.target.z;
        this.camera.position.y = -radius;
      });

      addOption('+Z', (radius) => {
        this.camera.position.x = this.orbitControls.target.x;
        this.camera.position.y = this.orbitControls.target.y;
        this.camera.position.z = radius;
      });

      addOption('-Z', (radius) => {
        this.camera.position.x = this.orbitControls.target.x;
        this.camera.position.y = this.orbitControls.target.y;
        this.camera.position.z = -radius;
      });
    }
  }

  dispose() {
    this.process.stop();
    window.removeEventListener('resize', this.resizeListener);
  }

  /**
   *
   * @param {object} gameObject3D - a game object
   */
  setCurrentGameObject3D(gameObject3D) {
    console.log('editor open ', gameObject3D);
    if (this.currentGameObject3D) {
      this.currentGameObject3D.removeFromParent();
    }

    this.currentGameObject3D = gameObject3D;

    // init render gameobject3d
    this.currentGameObject3D.traverse((child) => {
      if (!child.isGameObject3D) return;
      child.matrixAutoUpdate = true; // disable .static optimization

      const renderComp = child.getComponent(RenderComponent.TYPE);
      if (renderComp) {
        renderComp.initController(
          new RenderController(renderComp.getModel(), child, this.assetManager)
        );
      }
    });

    this.scene.add(this.currentGameObject3D);
    this.selectGameObject3D(this.currentGameObject3D);

    const createGameObject3DUI = (go, indent = 0) => {
      if (!go.isGameObject3D) return null;

      let result = null;

      const hasChildrenGameObject =
        go.children.filter((el) => el.isGameObject3D).length != 0;
      const _this = this;

      if (hasChildrenGameObject) {
        result = document.createElement('details');
        const summary = document.createElement('summary');
        summary.classList.add('editor_clickable');
        summary.innerText = go.name;
        this.gameObjectInput.addEventListener(
          GameObject3DInput.EVENT.NAME_CHANGED,
          () => {
            summary.innerText = go.name;
          }
        );

        result.style.marginLeft = 10 * indent + 'px';
        result.appendChild(summary);

        summary.onclick = function (event) {
          if (this == event.target) {
            _this.selectGameObject3D(go);
          }
        };

        indent++;
        go.children.forEach((child) => {
          const childResult = createGameObject3DUI(child, indent);
          if (!childResult) return;
          result.appendChild(childResult);
        });
      } else {
        result = document.createElement('div');
        result.classList.add('editor_clickable');
        result.innerText = go.name;
        this.gameObjectInput.addEventListener(
          GameObject3DInput.EVENT.NAME_CHANGED,
          () => {
            result.innerText = go.name;
          }
        );

        result.style.marginLeft = 20 * indent + 'px';
        result.onclick = function (event) {
          if (this == event.target) {
            _this.selectGameObject3D(go);
          }
        };
      }

      return result;
    };

    while (this.currentGODomelement.firstChild) {
      this.currentGODomelement.firstChild.remove();
    }
    this.currentGODomelement.appendChild(
      createGameObject3DUI(this.currentGameObject3D)
    );

    // move camera to fit the scene
    const bb = Editor.computeBox3GameObject3D(this.currentGameObject3D);
    const center = new Vector3();
    bb.getCenter(center);
    cameraFitRectangle(this.camera, bb.min, bb.max);

    this.setOrbitControlsTargetTo(this.currentGameObject3D);
  }

  /**
   *
   * @param {Object3D} obj
   */
  setOrbitControlsTargetTo(obj) {
    const bb = Editor.computeBox3GameObject3D(obj);
    const center = new Vector3();
    bb.getCenter(center);
    this.orbitControls.target.copy(center);
    this.orbitControls.update();
  }

  static computeBox3GameObject3D(obj) {
    const bb = new Box3().setFromObject(obj);

    // avoid bug if no renderdata on this gameobject
    const checkIfCoordInfinite = function (value) {
      return value === Infinity || value === -Infinity;
    };
    const checkIfVectorHasCoordInfinite = function (vector) {
      return (
        checkIfCoordInfinite(vector.x) ||
        checkIfCoordInfinite(vector.y) ||
        checkIfCoordInfinite(vector.z)
      );
    };

    if (
      checkIfVectorHasCoordInfinite(bb.min) ||
      checkIfVectorHasCoordInfinite(bb.max)
    ) {
      // cube 1,1,1
      bb.min.set(-0.5, -0.5, -0.5);
      bb.max.set(0.5, 0.5, 0.5);

      bb.applyMatrix4(obj.matrixWorld);
    }
    return bb;
  }

  selectGameObject3D(go) {
    console.log('select ', go);
    this.gameObjectInput.setGameObject3D(go);
    this.buttonFocusGameObject3D.onclick = this.setOrbitControlsTargetTo.bind(
      this,
      go
    );
    this.transformControls.attach(go);
    this.updateBox3();
  }

  updateBox3() {
    this.gameObjectInput.gameObject3D.updateMatrixWorld();
    const worldQuaternion = new Quaternion();
    this.gameObjectInput.gameObject3D.matrixWorld.decompose(
      new Vector3(),
      worldQuaternion,
      new Vector3()
    );

    const inverseWorldQuaternion = worldQuaternion.clone().invert();

    // cancel quaternion
    this.gameObjectInput.gameObject3D.quaternion.multiply(
      inverseWorldQuaternion
    );

    const bbScale = Editor.computeBox3GameObject3D(
      this.gameObjectInput.gameObject3D
    );
    this.currentGameObjectMeshBox3.scale.copy(
      bbScale.max.clone().sub(bbScale.min)
    );

    // restore quaternion
    this.gameObjectInput.gameObject3D.quaternion.multiply(worldQuaternion);

    const bbPosition = Editor.computeBox3GameObject3D(
      this.gameObjectInput.gameObject3D
    );
    bbPosition.getCenter(this.currentGameObjectMeshBox3.position);

    this.currentGameObjectMeshBox3.quaternion.copy(worldQuaternion);
    this.currentGameObjectMeshBox3.updateMatrixWorld();
  }
}

class GameObject3DInput extends HTMLElement {
  constructor() {
    super();

    // Name
    this.name = createLabelInput('Name: ', 'text');
    this.appendChild(this.name.parent);

    this.name.input.onchange = () => {
      this.gameObject3D.name = this.name.input.value;
      this.dispatchEvent(new CustomEvent(GameObject3DInput.EVENT.NAME_CHANGED));
    };

    this.static = createLabelInput('Static: ', 'checkbox');
    this.appendChild(this.static.parent);

    // Position
    this.positionLabel = document.createElement('label');
    this.positionLabel.innerText = 'Position';
    this.appendChild(this.positionLabel);

    this.positionX = createLabelInput('X: ', 'number');
    this.positionY = createLabelInput('Y: ', 'number');
    this.positionZ = createLabelInput('Z: ', 'number');

    this.positionX.input.step = 0.1;
    this.positionY.input.step = 0.1;
    this.positionZ.input.step = 0.1;

    this.appendChild(this.positionX.parent);
    this.appendChild(this.positionY.parent);
    this.appendChild(this.positionZ.parent);

    this.positionX.input.onchange = () => {
      this.gameObject3D.position.x = this.positionX.input.valueAsNumber;
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    };
    this.positionY.input.onchange = () => {
      this.gameObject3D.position.y = this.positionY.input.valueAsNumber;
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    };
    this.positionZ.input.onchange = () => {
      this.gameObject3D.position.z = this.positionZ.input.valueAsNumber;
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    };

    // Rotation
    this.rotationLabel = document.createElement('label');
    this.rotationLabel.innerText = 'Rotation';
    this.appendChild(this.rotationLabel);

    this.rotationX = createLabelInput('X: ', 'number');
    this.rotationY = createLabelInput('Y: ', 'number');
    this.rotationZ = createLabelInput('Z: ', 'number');

    this.rotationX.input.step = 0.01;
    this.rotationY.input.step = 0.01;
    this.rotationZ.input.step = 0.01;

    this.appendChild(this.rotationX.parent);
    this.appendChild(this.rotationY.parent);
    this.appendChild(this.rotationZ.parent);

    this.rotationX.input.onchange = () => {
      this.gameObject3D.rotation.x = this.rotationX.input.valueAsNumber;
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    };
    this.rotationY.input.onchange = () => {
      this.gameObject3D.rotation.y = this.rotationY.input.valueAsNumber;
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    };
    this.rotationZ.input.onchange = () => {
      this.gameObject3D.rotation.z = this.rotationZ.input.valueAsNumber;
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    };

    //Scale
    this.scaleLabel = document.createElement('label');
    this.scaleLabel.innerText = 'Scale';
    this.appendChild(this.scaleLabel);

    this.scaleX = createLabelInput('X: ', 'number');
    this.scaleY = createLabelInput('Y: ', 'number');
    this.scaleZ = createLabelInput('Z: ', 'number');

    this.scaleX.input.step = 0.1;
    this.scaleY.input.step = 0.1;
    this.scaleZ.input.step = 0.1;

    this.appendChild(this.scaleX.parent);
    this.appendChild(this.scaleY.parent);
    this.appendChild(this.scaleZ.parent);

    this.scaleX.input.onchange = () => {
      this.gameObject3D.scale.x = this.scaleX.input.valueAsNumber;
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    };
    this.scaleY.input.onchange = () => {
      this.gameObject3D.scale.y = this.scaleY.input.valueAsNumber;
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    };
    this.scaleZ.input.onchange = () => {
      this.gameObject3D.scale.z = this.scaleZ.input.valueAsNumber;
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    };

    /** @type {GameObject3D|null} */
    this.gameObject3D = null;
  }

  /**
   *
   * @param {GameObject3D} go
   */
  setGameObject3D(go) {
    this.name.input.value = go.name;

    this.static.input.checked = go.static;

    this.gameObject3D = go;

    this.updateTransform();
  }

  updateTransform() {
    this.positionX.input.value = this.gameObject3D.position.x;
    this.positionY.input.value = this.gameObject3D.position.y;
    this.positionZ.input.value = this.gameObject3D.position.z;

    this.rotationX.input.value = this.gameObject3D.rotation.x;
    this.rotationY.input.value = this.gameObject3D.rotation.y;
    this.rotationZ.input.value = this.gameObject3D.rotation.z;

    this.scaleX.input.value = this.gameObject3D.scale.x;
    this.scaleY.input.value = this.gameObject3D.scale.y;
    this.scaleZ.input.value = this.gameObject3D.scale.z;
  }

  static get EVENT() {
    return {
      TRANSFORM_CHANGED: 'transform_changed',
      NAME_CHANGED: 'name_changed',
    };
  }
}
window.customElements.define('transform-input', GameObject3DInput); // mandatory to extends HTMLElement
