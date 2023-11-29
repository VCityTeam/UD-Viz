import {
  AudioComponent,
  ColliderComponent,
  Context,
  ExternalScriptComponent,
  Object3D as GameObject3D,
  GameScriptComponent,
  RenderComponent,
} from '@ud-viz/game_shared';
import { AssetManager, RenderController } from '@ud-viz/game_browser';
import {
  Object3D,
  Box3,
  Vector3,
  Quaternion,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  CircleGeometry,
  Color,
  Raycaster,
  Vector2,
  SphereGeometry,
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  AmbientLight,
  MathUtils,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';

import './style.css';
import {
  cameraFitRectangle,
  createLabelInput,
  createLocalStorageSlider,
  RequestAnimationFrameProcess,
  Vector3Input,
} from '@ud-viz/utils_browser';
import {
  arrayPushOnce,
  objectParseNumeric,
  removeFromArray,
  throttle,
} from '@ud-viz/utils_shared';

const COLLIDER_MATERIAL = new MeshBasicMaterial({ color: 'green' });
const COLLIDER_MATERIAL_SELECTED = new MeshBasicMaterial({ color: 'red' });
const COLLIDER_POINT_MATERIAL = new MeshBasicMaterial({ color: 'yellow' });

import { ObjectInput } from './objectInput/ObjectInput';
export { ObjectInput };

import * as nativeGameScriptVariablesInput from './objectInput/scriptVariables/game/game';
import * as nativeExternalScriptVariablesInputs from './objectInput/scriptVariables/external/external';
import * as nativeUserDataInputs from './objectInput/userData/userData';
export { nativeUserDataInputs };
export { nativeExternalScriptVariablesInputs };
export { nativeGameScriptVariablesInput };
export * from './DebugCollision';

export class Editor {
  /**
   *
   * @param {import("@ud-viz/frame3d").Planar|import("@ud-viz/frame3d").Base} frame3D - frame 3d
   * @param {AssetManager} assetManager - asset manager
   * @param {object} options - options
   * @param {Array} options.externalScriptVariablesInputs - input to edit ExternalScriptComponent variables
   * @param {Array} options.gameScriptVariablesInputs - input to edit GameScriptComponent variables
   * @param {Array} options.userDataInputs - input to edit .userData
   * @param {Array} options.object3DModels - models of object3D
   * @param {Array} options.possibleExternalScriptIds - ids that can be added to a gameobject3d ExternalScriptComponent
   * @param {Array} options.possibleGameScriptIds - ids that can be added to a gameobject3d GameScriptComponent
   * @param {object} options.userData - user data
   */
  constructor(frame3D, assetManager, options = {}) {
    /** @type {import("@ud-viz/frame3d").Planar|import("@ud-viz/frame3d").Base} */
    this.frame3D = frame3D;

    /** @type {AssetManager} */
    this.assetManager = assetManager;

    /** @type {object} */
    this.userData = options.userData || {};

    // ui init
    {
      /** @type {HTMLElement} */
      this.leftPan = document.createElement('div');
      this.leftPan.setAttribute('id', 'left_pan');
      this.frame3D.domElementUI.appendChild(this.leftPan);

      const leftPanWidthInput = createLocalStorageSlider(
        'editor_left_width_range_key',
        'Taille UI ',
        this.leftPan,
        {
          min: 100,
          max: 700,
          defaultValue: 300,
        }
      );
      const updateLeftWidth = () => {
        this.leftPan.style.width = leftPanWidthInput.value + 'px';
      };
      leftPanWidthInput.onchange = updateLeftWidth;
      updateLeftWidth();

      /** @type {HTMLElement} */
      this.currentGODomelement = document.createElement('div');
      this.currentGODomelement.setAttribute('id', 'current_game_object_3d');
      this.leftPan.appendChild(this.currentGODomelement);

      /** @type {HTMLElement} */
      this.toolsDomElement = document.createElement('div');
      this.toolsDomElement.setAttribute('id', 'editor_tools');
      this.leftPan.appendChild(this.toolsDomElement);
    }

    // add object model
    {
      const selectObject3DModel = document.createElement('select');
      this.toolsDomElement.appendChild(selectObject3DModel);

      const buffer = new Map();

      // add a default one
      const defaultOption = document.createElement('option');
      defaultOption.innerText = 'Empty';
      const uuid = MathUtils.generateUUID();
      defaultOption.value = uuid;
      buffer.set(uuid, { name: 'GameObject3D' });
      selectObject3DModel.appendChild(defaultOption);

      // fill with ones pass at construction
      if (options.object3DModels) {
        options.object3DModels.forEach((model) => {
          const option = document.createElement('option');
          option.innerText = model.name;
          const uuid = MathUtils.generateUUID();
          option.value = uuid;
          buffer.set(uuid, model);
          selectObject3DModel.appendChild(option);
        });
      }

      const addObject3DModelToSelectedGameObject3D =
        document.createElement('button');
      addObject3DModelToSelectedGameObject3D.innerText = 'Add gameobject3D';
      this.toolsDomElement.appendChild(addObject3DModelToSelectedGameObject3D);

      addObject3DModelToSelectedGameObject3D.onclick = () => {
        const objectToAdd = new GameObject3D(
          JSON.parse(
            JSON.stringify(
              buffer.get(selectObject3DModel.selectedOptions[0].value)
            )
          )
        );

        // reset everything TODO: optimize
        this.currentGameObject3D.add(objectToAdd);
        this.setCurrentGameObject3DJSON(this.currentGameObject3D.toJSON());
        this.selectGameObject3D(
          this.currentGameObject3D.getFirst((o) => o.uuid == objectToAdd.uuid)
        );
      };
    }

    // remove gameobject
    {
      const deleteCurrentGameObject3D = document.createElement('button');
      deleteCurrentGameObject3D.innerText = 'Remove gameobject3D selected';
      this.toolsDomElement.appendChild(deleteCurrentGameObject3D);

      deleteCurrentGameObject3D.onclick = () => {
        if (!this.gameObjectInput.gameObject3D.parent.isGameObject3D) {
          alert('you cant delete root of your game');
          return;
        }
        // reset everything TODO: optimize
        this.gameObjectInput.gameObject3D.removeFromParent();
        this.setCurrentGameObject3DJSON(this.currentGameObject3D.toJSON());
      };
    }

    const possibleIdRenderData = [];
    for (const id in assetManager.renderData) possibleIdRenderData.push(id);
    const possibleIdSounds = [];
    for (const id in assetManager.sounds) possibleIdSounds.push(id);

    /** @type {Array<import("./objectInput/ObjectInput")>} */
    const externalScriptVariablesInputs =
      options.externalScriptVariablesInputs || [];
    for (const className in nativeExternalScriptVariablesInputs)
      externalScriptVariablesInputs.push(
        nativeExternalScriptVariablesInputs[className]
      );

    /** @type {Array<import("./objectInput/ObjectInput")>} */
    const gameScriptVariablesInputs = options.gameScriptVariablesInputs || [];
    for (const className in nativeGameScriptVariablesInput)
      gameScriptVariablesInputs.push(nativeGameScriptVariablesInput[className]);

    /** @type {Array<import("./objectInput/ObjectInput")>} */
    const userDataInputs = options.userDataInputs || [];
    for (const className in nativeUserDataInputs)
      userDataInputs.push(nativeUserDataInputs[className]);

    /** @type {GameObject3DInput} */
    this.gameObjectInput = new GameObject3DInput(
      possibleIdRenderData,
      possibleIdSounds,
      options.possibleGameScriptIds,
      options.possibleExternalScriptIds,
      gameScriptVariablesInputs,
      externalScriptVariablesInputs,
      userDataInputs
    );
    this.gameObjectInput.setAttribute('id', 'select_game_object_3d');
    this.leftPan.appendChild(this.gameObjectInput);

    // update when input transform changed
    this.gameObjectInput.addEventListener(
      GameObject3DInput.EVENT.TRANSFORM_CHANGED,
      () => {
        this.updateCollider();
        this.updateBox3();
      }
    );

    // update when component is add/remove
    {
      this.gameObjectInput.addEventListener(
        GameObject3DInput.EVENT.COMPONENT_ADD,
        (event) => {
          let newComponent = null;
          switch (event.detail.type) {
            case RenderComponent.TYPE:
              newComponent = new RenderComponent();
              this.gameObjectInput.gameObject3D.components[
                RenderComponent.TYPE
              ] = newComponent;
              newComponent.initController(
                new RenderController(
                  newComponent.model,
                  this.gameObjectInput.gameObject3D,
                  this.assetManager
                )
              );
              break;
            case AudioComponent.TYPE:
              this.gameObjectInput.gameObject3D.components[
                AudioComponent.TYPE
              ] = new AudioComponent();
              break;
            case GameScriptComponent.TYPE:
              this.gameObjectInput.gameObject3D.components[
                GameScriptComponent.TYPE
              ] = new GameScriptComponent();
              break;
            case ExternalScriptComponent.TYPE:
              this.gameObjectInput.gameObject3D.components[
                ExternalScriptComponent.TYPE
              ] = new ExternalScriptComponent();
              break;
            case ColliderComponent.TYPE:
              this.gameObjectInput.gameObject3D.components[
                ColliderComponent.TYPE
              ] = new ColliderComponent();
              break;
            default:
              throw new Error('Unknown component type');
          }

          this.selectGameObject3D(this.gameObjectInput.gameObject3D, true); // refresh
        }
      );
      this.gameObjectInput.addEventListener(
        GameObject3DInput.EVENT.COMPONENT_REMOVE,
        (event) => {
          if (event.detail.type == RenderComponent.TYPE) {
            const renderComponent =
              this.gameObjectInput.gameObject3D.getComponent(
                RenderComponent.TYPE
              );
            renderComponent.controller.dispose(); // the only one with a controller
          } else if (
            (this.currentObjectInput &&
              event.detail.type == GameScriptComponent.TYPE &&
              this.currentObjectInput.type == ObjectInput.TYPE.GAME_SCRIPT) ||
            (this.currentObjectInput &&
              event.detail.type == ExternalScriptComponent.TYPE &&
              this.currentObjectInput.type == ObjectInput.TYPE.EXTERNAL_SCRIPT)
          ) {
            // was editing the concerned component
            this.currentObjectInput.dispose();
          }

          delete this.gameObjectInput.gameObject3D.components[
            event.detail.type
          ];
          this.selectGameObject3D(this.gameObjectInput.gameObject3D, true); // refresh
        }
      );
    }

    /** @type {OrbitControls} */
    this.orbitControls = new OrbitControls(
      this.frame3D.camera,
      this.frame3D.domElementWebGL
    );

    /** @type {TransformControls} */
    this.transformControls = new TransformControls(
      this.frame3D.camera,
      this.frame3D.domElementWebGL
    );
    // transform controls
    {
      this.frame3D.scene.add(this.transformControls);

      this.transformControls.addEventListener('dragging-changed', (event) => {
        this.orbitControls.enabled = !event.value;
      });

      this.transformControls.addEventListener('change', () => {
        this.gameObjectInput.updateTransform();
      });
      this.transformControls.addEventListener('mouseUp', () => {
        if (!this.shapeContext.pointMesh) {
          // editing go transform
          this.updateCollider();
          this.updateBox3();
        } else {
          if (
            this.shapeContext.pointMesh.userData.shapeJSON.type ==
            ColliderComponent.SHAPE_TYPE.POLYGON
          ) {
            // editing point shape in model
            this.shapeContext.pointMesh.userData.shapeJSON.points[
              this.shapeContext.pointMesh.userData.index
            ] = {
              x: this.shapeContext.pointMesh.position.x,
              y: this.shapeContext.pointMesh.position.y,
              z: this.shapeContext.pointMesh.position.z,
            };
            const indexPointSelected =
              this.shapeContext.pointMesh.userData.index;
            this.updateShapeSelected();
            this.selectPointMesh(
              this.pointsParent.children[indexPointSelected]
            );
          } else {
            // circle center edited
            this.shapeContext.pointMesh.userData.shapeJSON.center = {
              x: this.shapeContext.pointMesh.position.x,
              y: this.shapeContext.pointMesh.position.y,
              z: this.shapeContext.pointMesh.position.z,
            };
            this.updateShapeSelected();
          }
        }
      });
    }

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
    this.buttonTargetGameObject3D = document.createElement('button');
    this.buttonTargetGameObject3D.innerText = 'Target';
    this.toolsDomElement.appendChild(this.buttonTargetGameObject3D);

    /** @type {GameObject3D|null} */
    this.currentGameObject3D = null;

    /** @type {Box3} */
    this.currentGameObjectMeshBox3 = new Mesh(
      new BoxGeometry(),
      new MeshBasicMaterial({ color: 'black', wireframe: true })
    );
    {
      this.currentGameObjectMeshBox3.name = 'currentGameObjectMeshBox3';
      this.frame3D.scene.add(this.currentGameObjectMeshBox3);
      this.gameObjectInput.addEventListener(
        GameObject3DInput.EVENT.TRANSFORM_CHANGED,
        () => {
          this.updateBox3();
          this.updateCollider();
        }
      );
    }

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
        const radius = this.frame3D.camera.position.distanceTo(
          this.orbitControls.target
        );
        this.frame3D.camera.position.copy(this.orbitControls.target);
        buffer.get(selectCameraPOV.selectedOptions[0].value)(radius);
        this.frame3D.camera.updateMatrixWorld();
        this.orbitControls.update();
      };

      addOption('+X', (radius) => {
        this.frame3D.camera.position.x += radius;
      });
      addOption('-X', (radius) => {
        this.frame3D.camera.position.x -= radius;
      });
      addOption('+Y', (radius) => {
        this.frame3D.camera.position.y += radius;
      });
      addOption('-Y', (radius) => {
        this.frame3D.camera.position.y -= radius;
      });
      addOption('+Z', (radius) => {
        this.frame3D.camera.position.z += radius;
      });
      addOption('-Z', (radius) => {
        this.frame3D.camera.position.z -= radius;
      });
    }

    // collider object3d
    /** @type {Object3D} */
    this.colliderParent = new Object3D();
    this.colliderParent.name = 'colliderParent';
    this.frame3D.scene.add(this.colliderParent);

    this.gameObjectInput.addEventListener(
      GameObject3DInput.EVENT.SHAPE_ADDED,
      (event) => {
        this.updateCollider();
        this.selectShape(event.detail.shapeIndexCreated);
      }
    );

    /** @type {object} */
    this.shapeContext = {
      mesh: null,
      deleteButton: null,
      radiusUI: null,
      pointMesh: null,
    };
    this.pointsParent = new Object3D();
    {
      this.frame3D.scene.add(this.pointsParent);

      const raycaster = new Raycaster();
      window.addEventListener('keydown', (event) => {
        if (event.key == 'Escape') this.selectShape(-1);
        else if (event.key == 'Delete' && this.shapeContext.pointMesh) {
          // can only remove point of polygon
          if (
            this.shapeContext.pointMesh.userData.shapeJSON.type !=
            ColliderComponent.SHAPE_TYPE.POLYGON
          )
            return;

          if (
            this.shapeContext.pointMesh.userData.shapeJSON.points.length < 5
          ) {
            alert('a polygon must have at least 4 points');
          } else {
            // delete this point
            this.shapeContext.pointMesh.userData.shapeJSON.points.splice(
              this.shapeContext.pointMesh.userData.index,
              1
            );
            this.updateShapeSelected();
          }
        }
      });
      this.frame3D.domElementWebGL.addEventListener('click', (event) => {
        const mouse = new Vector2(
          (event.clientX / this.frame3D.domElementWebGL.clientWidth) * 2 - 1,
          -(event.clientY / this.frame3D.domElementWebGL.clientHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, this.frame3D.camera);

        if (!this.shapeContext.mesh) {
          // look for intersect with shape mesh
          const intersects = raycaster.intersectObject(
            this.colliderParent,
            true
          );
          if (intersects.length) {
            const index = this.colliderParent.children.indexOf(
              intersects[0].object
            );
            this.selectShape(index);
          }
        } else {
          if (event.ctrlKey) {
            // add a point
            const intersects = raycaster.intersectObject(
              this.gameObjectInput.gameObject3D,
              true
            );
            if (intersects.length) {
              const point = intersects[0].point;
              const index = this.colliderParent.children.indexOf(
                this.shapeContext.mesh
              );
              const colliderComp =
                this.gameObjectInput.gameObject3D.getComponent(
                  ColliderComponent.TYPE
                );
              // in gameobject referential
              const invMatrixWorld = this.pointsParent.matrixWorld
                .clone()
                .invert();
              point.applyMatrix4(invMatrixWorld);

              colliderComp.model.shapesJSON[index].points.push({
                x: point.x,
                y: point.y,
                z: point.z,
              });
              this.updateShapeSelected();
            }
          } else {
            // look for intersect with points shape
            const intersects = raycaster.intersectObject(
              this.pointsParent,
              true
            );
            if (intersects.length) {
              this.selectPointMesh(intersects[0].object);
            }
          }
        }
      });
    }

    // object input
    {
      /** @type {import("./objectInput/ObjectInput")|null} */
      this.currentObjectInput = null;

      // object input creation
      this.gameObjectInput.addEventListener(
        GameObject3DInput.EVENT.OBJECT_INPUT_CREATION,
        (event) => {
          if (this.currentObjectInput) this.currentObjectInput.dispose(); // only one script input at once

          let domElement, object;
          switch (event.detail.typeObjectInput) {
            case ObjectInput.TYPE.USER_DATA:
              domElement = this.gameObjectInput.userDataInputDomElement;
              object = this.gameObjectInput.gameObject3D.userData;
              break;
            case ObjectInput.TYPE.GAME_SCRIPT:
              domElement = this.gameObjectInput.gameScriptInputDomElement;
              object = this.gameObjectInput.gameObject3D.getComponent(
                GameScriptComponent.TYPE
              ).model.variables;
              break;
            case ObjectInput.TYPE.EXTERNAL_SCRIPT:
              domElement = this.gameObjectInput.externalScriptInputDomElement;
              object = this.gameObjectInput.gameObject3D.getComponent(
                ExternalScriptComponent.TYPE
              ).model.variables;
              break;
            default:
              throw new Error('Unknown object input type');
          }

          this.currentObjectInput = new event.detail.ClassObjectInput(
            event.detail.typeObjectInput,
            this,
            object,
            domElement
          );
          this.currentObjectInput.init();
        }
      );

      this.gameObjectInput.addEventListener(
        GameObject3DInput.EVENT.SCRIPT_DELETED,
        (event) => {
          if (
            this.currentObjectInput && // one current object input
            this.currentObjectInput.condition(event.detail.id) // its a script variables object input + one that's the one editing the deleted script
          )
            this.currentObjectInput.dispose(); // dispose it
        }
      );
    }

    /** @type {RequestAnimationFrameProcess} */
    this.process = new RequestAnimationFrameProcess(30);

    // scale point mesh to have constant size on screen
    this.scaleShapePoints = () => {
      this.pointsParent.traverse((point) => {
        if (point.geometry) {
          const scale =
            this.frame3D.camera.position.distanceTo(
              point.position.clone().add(this.pointsParent.position)
            ) / 60;
          point.scale.set(scale, scale, scale);
        }
      });
    };

    const scaleShapePointsThrottle = throttle(
      this.scaleShapePoints.bind(this),
      100
    );

    this.process.start((dt) => {
      scaleShapePointsThrottle();
      this.transformControls.updateMatrixWorld();
      this.frame3D.render();
      if (this.currentObjectInput) this.currentObjectInput.tick(dt);
    });

    {
      // select game object 3d move
      this.selectParentGameObject3DMove = document.createElement('select');

      // move button
      const moveButton = document.createElement('button');
      moveButton.innerText = 'Move selected gameobject3D to';
      this.toolsDomElement.appendChild(moveButton);
      this.toolsDomElement.appendChild(this.selectParentGameObject3DMove);

      moveButton.onclick = () => {
        const selectedGameObject3DUUID = this.gameObjectInput.gameObject3D.uuid;
        this.gameObjectInput.gameObject3D.removeFromParent();
        const parent = this.currentGameObject3D.getFirst(
          (o) =>
            o.uuid == this.selectParentGameObject3DMove.selectedOptions[0].value
        );
        parent.add(this.gameObjectInput.gameObject3D);
        this.setCurrentGameObject3DJSON(this.currentGameObject3D.toJSON());
        this.selectGameObject3D(
          this.currentGameObject3D.getFirst(
            (o) => o.uuid == selectedGameObject3DUUID
          )
        );
      };
    }
  }

  initGameObject3D(gameObject3D) {
    gameObject3D.traverse((child) => {
      if (!child.isGameObject3D) return;
      child.matrixAutoUpdate = true; // disable .static optimization

      const renderComp = child.getComponent(RenderComponent.TYPE);
      if (renderComp) {
        renderComp.initController(
          new RenderController(renderComp.getModel(), child, this.assetManager)
        );
      }
    });
  }

  /**
   *
   * @param {object} gameObject3DJSON - json of the gameobject to set
   */
  setCurrentGameObject3DJSON(gameObject3DJSON) {
    const gameObject3D = new GameObject3D(objectParseNumeric(gameObject3DJSON));

    console.log('editor open ', gameObject3D);
    if (this.currentGameObject3D) {
      this.currentGameObject3D.removeFromParent();
    }

    this.currentGameObject3D = gameObject3D;

    // init render gameobject3d7
    this.initGameObject3D(this.currentGameObject3D);

    this.frame3D.scene.add(this.currentGameObject3D);

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

    this.selectGameObject3D(this.currentGameObject3D);
  }

  /**
   * Move camera to focus current game object 3d
   */
  focusCurrentGameObject3D() {
    // move camera to fit the scene
    const bb = Editor.computeBox3GameObject3D(this.currentGameObject3D);
    const center = new Vector3();
    bb.getCenter(center);
    cameraFitRectangle(this.frame3D.camera, bb.min, bb.max, bb.max.z);
    this.setOrbitControlsTargetTo(this.currentGameObject3D);
  }

  /**
   *
   * @param {Object3D} obj - object 3d to target
   */
  setOrbitControlsTargetTo(obj) {
    const bb = Editor.computeBox3GameObject3D(obj);
    const center = new Vector3();
    bb.getCenter(center);
    this.orbitControls.target.copy(center);
    this.orbitControls.update();
  }

  /**
   *
   * @param {GameObject3D} go - game object 3d to select for edition
   * @param {boolean} force - force even if the selected gameobject3d is the same
   */
  selectGameObject3D(go, force = false) {
    if (go == this.gameObjectInput.gameObject3D && !force) return;

    if (this.currentObjectInput) this.currentObjectInput.dispose();

    // game input dom element
    this.gameObjectInput.setGameObject3D(go);
    // bind
    this.buttonTargetGameObject3D.onclick = this.setOrbitControlsTargetTo.bind(
      this,
      go
    );
    this.transformControls.attach(go);
    this.updateBox3();
    this.updateCollider();
    this.updateSelectGameObjectMoveParent();
  }

  updateSelectGameObjectMoveParent() {
    while (this.selectParentGameObject3DMove.firstChild)
      this.selectParentGameObject3DMove.firstChild.remove();

    // root gameobject3D cant me move
    if (!this.gameObjectInput.gameObject3D.parent.isGameObject3D) return;

    this.currentGameObject3D.traverse((child) => {
      if (
        !child.isGameObject3D ||
        child == this.gameObjectInput.gameObject3D ||
        child == this.gameObjectInput.gameObject3D.parent
      )
        return; // cant move to itself or to the current one

      const option = document.createElement('option');
      option.innerText = child.name;
      option.value = child.uuid;
      this.selectParentGameObject3DMove.appendChild(option);
    });
  }

  /**
   * Update collider shapes in the 3D scene
   */
  updateCollider() {
    for (let i = this.colliderParent.children.length - 1; i >= 0; i--) {
      this.colliderParent.children[i].removeFromParent();
    }
    this.selectShape(-1);

    /** @type {GameObject3D} */
    const go = this.gameObjectInput.gameObject3D;

    const colliderComp = go.getComponent(ColliderComponent.TYPE);
    if (colliderComp) {
      const worldPosition = new Vector3();
      const worldQuaternion = new Quaternion();
      const worldScale = new Vector3();

      go.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);

      this.colliderParent.position.copy(worldPosition);
      this.colliderParent.quaternion.copy(worldQuaternion);
      this.colliderParent.scale.copy(worldScale);

      colliderComp.model.shapesJSON.forEach((shape) => {
        let geometry = null;

        switch (shape.type) {
          case ColliderComponent.SHAPE_TYPE.CIRCLE:
            geometry = new CircleGeometry(shape.radius, 32);
            geometry.translate(shape.center.x, shape.center.y, shape.center.z);
            break;
          case ColliderComponent.SHAPE_TYPE.POLYGON:
            geometry = new ConvexGeometry(
              shape.points.map((el) => new Vector3(el.x, el.y, el.z))
            );
            break;
          default:
            throw new Error('unknown shape type');
        }
        this.colliderParent.add(new Mesh(geometry, COLLIDER_MATERIAL));
      });
    }
  }

  /**
   *
   * @param {number} shapeIndex - index of the shape to select
   */
  selectShape(shapeIndex) {
    // reset state
    if (this.shapeContext.mesh) {
      this.shapeContext.mesh.material = COLLIDER_MATERIAL;
      this.shapeContext.mesh = null;
    }
    if (this.shapeContext.deleteButton) {
      this.shapeContext.deleteButton.remove();
      this.shapeContext.deleteButton = null;
    }
    if (this.shapeContext.radiusUI) {
      this.shapeContext.radiusUI.parent.remove();
      this.shapeContext.radiusUI = null;
    }
    this.shapeContext.pointMesh = null;

    for (let i = this.pointsParent.children.length - 1; i >= 0; i--) {
      this.pointsParent.children[i].removeFromParent();
    }

    // assign new index
    this.shapeContext.mesh = this.colliderParent.children[shapeIndex];

    // set new stateContext state
    if (this.shapeContext.mesh) {
      this.setOrbitControlsTargetTo(this.shapeContext.mesh);
      this.shapeContext.mesh.material = COLLIDER_MATERIAL_SELECTED;

      const colliderComp = this.gameObjectInput.gameObject3D.getComponent(
        ColliderComponent.TYPE
      );

      this.shapeContext.deleteButton = document.createElement('button');
      this.shapeContext.deleteButton.innerText = 'delete shape';
      this.shapeContext.deleteButton.onclick = () => {
        colliderComp.model.shapesJSON.splice(shapeIndex, 1);
        this.updateCollider();
      };

      if (
        colliderComp.model.shapesJSON[shapeIndex].type ==
        ColliderComponent.SHAPE_TYPE.CIRCLE
      ) {
        // add ui to set radius
        this.shapeContext.radiusUI = createLabelInput('Radius ', 'number');
        this.gameObjectInput.detailsCollider.appendChild(
          this.shapeContext.radiusUI.parent
        );

        // init
        this.shapeContext.radiusUI.input.value =
          colliderComp.model.shapesJSON[shapeIndex].radius;

        this.shapeContext.radiusUI.input.onchange = () => {
          const newRadius = this.shapeContext.radiusUI.input.valueAsNumber;
          if (newRadius < 0.01) {
            alert('radius must superior at 0.01');
          } else {
            colliderComp.model.shapesJSON[shapeIndex].radius = newRadius;
            this.updateShapeSelected();
          }
        };
      }

      this.gameObjectInput.detailsCollider.appendChild(
        this.shapeContext.deleteButton
      );

      this.updateShapeSelected(false); // no need to rebuild shape geometry
    } else {
      this.transformControls.attach(this.gameObjectInput.gameObject3D);
    }
  }

  /**
   *
   * @param {Mesh} mesh - point mesh to select with transform controls
   */
  selectPointMesh(mesh) {
    this.shapeContext.pointMesh = mesh;
    this.transformControls.attach(this.shapeContext.pointMesh);
  }

  /**
   * Update shape selected (when a property of the shape has changed)
   *
   * @param {boolean} rebuildShapeGeometry - shape selected needs to rebuild its geometry
   */
  updateShapeSelected(rebuildShapeGeometry = true) {
    // remove all old point meshes
    for (let i = this.pointsParent.children.length - 1; i >= 0; i--) {
      this.pointsParent.children[i].removeFromParent();
    }

    // reset transform controls
    this.transformControls.detach();

    // unreference this.shapeContext.pointMesh
    this.shapeContext.pointMesh = null;

    // transform pointParent in referential of the current gameobject3D
    const worldPosition = new Vector3();
    const worldQuaternion = new Quaternion();
    const worldScale = new Vector3();
    this.gameObjectInput.gameObject3D.matrixWorld.decompose(
      worldPosition,
      worldQuaternion,
      worldScale
    );

    this.pointsParent.position.copy(worldPosition);
    this.pointsParent.quaternion.copy(worldQuaternion);
    this.pointsParent.scale.copy(worldScale);

    // retrieve shapeJSON
    const colliderComp = this.gameObjectInput.gameObject3D.getComponent(
      ColliderComponent.TYPE
    );
    const index = this.colliderParent.children.indexOf(this.shapeContext.mesh);
    const shapeJSON = colliderComp.model.shapesJSON[index];

    // rebuild shape + point mesh
    if (shapeJSON.type == ColliderComponent.SHAPE_TYPE.POLYGON) {
      if (rebuildShapeGeometry) {
        this.shapeContext.mesh.geometry = new ConvexGeometry(
          shapeJSON.points.map((el) => new Vector3(el.x, el.y, el.z))
        );
        console.trace('shape rebuilded with ', shapeJSON);
      }

      shapeJSON.points.forEach((point, index) => {
        const pointMesh = new Mesh(
          new SphereGeometry(0.6),
          COLLIDER_POINT_MATERIAL
        );
        pointMesh.position.set(point.x, point.y, point.z);
        pointMesh.userData.index = index;
        pointMesh.userData.shapeJSON = shapeJSON; // userdata used at the end of transform controls
        this.pointsParent.add(pointMesh);
      });
    } else if (shapeJSON.type == ColliderComponent.SHAPE_TYPE.CIRCLE) {
      if (rebuildShapeGeometry) {
        this.shapeContext.mesh.geometry = new CircleGeometry(
          shapeJSON.radius,
          32
        );
        this.shapeContext.mesh.geometry.translate(
          shapeJSON.center.x,
          shapeJSON.center.y,
          shapeJSON.center.z
        );
        console.trace('shape rebuilded with ', shapeJSON);
      }
      const pointMesh = new Mesh(
        new SphereGeometry(0.6),
        COLLIDER_POINT_MATERIAL
      );
      pointMesh.position.set(
        shapeJSON.center.x,
        shapeJSON.center.y,
        shapeJSON.center.z
      );
      pointMesh.userData.shapeJSON = shapeJSON; // userdata used at the end of transform controls
      this.pointsParent.add(pointMesh);
      this.selectPointMesh(pointMesh);
    }

    if (rebuildShapeGeometry) this.scaleShapePoints();
  }

  /**
   * Update box3 wrapping selected game object 3d
   */
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

  /**
   *
   * @param {Object3D} obj - object 3d to compute box3
   * @returns {Box3} - box 3 of the object 3d
   */
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
}

class GameObject3DInput extends HTMLElement {
  /**
   *
   * @param {Array<string>} idRenderDatas - possible id render datas to set in RenderComponent
   * @param {Array<string>} idSounds - possible id sound to set in AudioComponent
   * @param {Array<string>} idGameScripts - possible id game script to set in GameScriptComponent
   * @param {Array<string>} idExternalScripts - possible id external script to set in ExternalScriptComponent
   * @param {Array<string>} gameScriptVariablesInputs - object inputs to edit .variables of GameScriptComponent
   * @param {Array<string>} externalScriptVariablesInputs - object inputs to edit .variables of ExternalScriptComponent
   * @param {Array<string>} userDataInputs - object inputs to edit .userData
   */
  constructor(
    idRenderDatas,
    idSounds,
    idGameScripts,
    idExternalScripts,
    gameScriptVariablesInputs,
    externalScriptVariablesInputs,
    userDataInputs
  ) {
    super();

    /** @type {Array} */
    this.idRenderDatas = idRenderDatas;

    /** @type {Array} */
    this.idSounds = idSounds;

    /** @type {Array} */
    this.idGameScripts = idGameScripts || [];

    /** @type {Array} */
    this.idExternalScripts = idExternalScripts || [];

    /** @type {Array} */
    this.gameScriptVariablesInputs = gameScriptVariablesInputs || [];

    /** @type {Array} */
    this.externalScriptVariablesInputs = externalScriptVariablesInputs || [];

    /** @type {Array} */
    this.userDataInputs = userDataInputs || [];

    /** @type {GameObject3D|null} */
    this.gameObject3D = null;

    // Name
    this.nameLabelInput = createLabelInput('Name: ', 'text');
    this.appendChild(this.nameLabelInput.parent);

    this.nameLabelInput.input.onchange = () => {
      this.gameObject3D.name = this.nameLabelInput.input.value;
      this.dispatchEvent(new CustomEvent(GameObject3DInput.EVENT.NAME_CHANGED));
    };

    // Static
    this.static = createLabelInput('Static: ', 'checkbox');
    this.appendChild(this.static.parent);

    this.static.input.onchange = () => {
      this.gameObject3D.static = this.static.input.checked;
    };

    // Visible
    this.visible = createLabelInput('Visible: ', 'checkbox');
    this.appendChild(this.visible.parent);

    this.visible.input.onchange = () => {
      this.gameObject3D.visible = this.visible.input.checked;
    };

    // transform
    const detailsTransform = document.createElement('details');
    this.appendChild(detailsTransform);
    const summaryTransform = document.createElement('summary');
    summaryTransform.innerText = 'Transform';
    detailsTransform.appendChild(summaryTransform);

    this.position = new Vector3Input('Position', 0.1);
    detailsTransform.appendChild(this.position);

    this.rotation = new Vector3Input('Rotation', 0.01);
    detailsTransform.appendChild(this.rotation);

    this.scale = new Vector3Input('Scale', 0.1);
    detailsTransform.appendChild(this.scale);

    this.position.addEventListener('change', () => {
      this.gameObject3D.position.set(
        this.position.x.input.valueAsNumber,
        this.position.y.input.valueAsNumber,
        this.position.z.input.valueAsNumber
      );
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    });
    this.rotation.addEventListener('change', () => {
      this.gameObject3D.rotation.set(
        this.rotation.x.input.valueAsNumber,
        this.rotation.y.input.valueAsNumber,
        this.rotation.z.input.valueAsNumber
      );
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    });
    this.scale.addEventListener('change', () => {
      this.gameObject3D.scale.set(
        this.scale.x.input.valueAsNumber,
        this.scale.y.input.valueAsNumber,
        this.scale.z.input.valueAsNumber
      );
      this.dispatchEvent(
        new CustomEvent(GameObject3DInput.EVENT.TRANSFORM_CHANGED)
      );
    });

    // userdata
    this.detailsUserData = document.createElement('details');
    this.appendChild(this.detailsUserData);
    this.userDataInputDomElement = null;

    // collider
    this.detailsCollider = document.createElement('details');
    this.appendChild(this.detailsCollider);

    // render
    this.detailsRender = document.createElement('details');
    this.appendChild(this.detailsRender);

    // audio
    this.detailsAudio = document.createElement('details');
    this.appendChild(this.detailsAudio);

    // game script
    this.detailsGameScript = document.createElement('details');
    this.appendChild(this.detailsGameScript);
    /** @type {HTMLElement} */
    this.gameScriptInputDomElement = null;

    // external script
    this.detailsExternalScript = document.createElement('details');
    this.appendChild(this.detailsExternalScript);
    this.externalScriptInputDomElement = null;

    // no gameobject3d set at the construction
    this.hidden = true;
  }

  /**
   *
   * @param {GameObject3D} go - go to select in the game object 3d input
   */
  setGameObject3D(go) {
    if (!go) {
      this.hidden = true;
      return;
    }
    this.hidden = false;

    this.gameObject3D = go;

    this.nameLabelInput.input.value = go.name;

    this.static.input.checked = go.static;

    this.visible.input.checked = go.visible;

    // transform
    this.updateTransform();

    // userdata
    this.updateUserData();

    // collider
    this.updateCollider();

    // render
    this.updateRender();

    // audio
    this.updateAudio();

    // game script
    this.updateGameScript();

    // external script
    this.updateExternalScript();
  }

  /**
   * Update userData edition of the current game object 3d
   */
  updateUserData() {
    let CurrentClassObjectInput = null;
    for (let index = 0; index < this.userDataInputs.length; index++) {
      const ClassObjectInput = this.userDataInputs[index];
      // userdata inputs take an gameobject3D as condition
      if (ClassObjectInput.condition(this.gameObject3D)) {
        CurrentClassObjectInput = ClassObjectInput;
        break;
      }
    }

    if (CurrentClassObjectInput) {
      this.detailsUserData.hidden = false;

      while (this.detailsUserData.firstChild)
        this.detailsUserData.firstChild.remove();

      const summary = document.createElement('summary');
      summary.innerText = 'userData';
      this.detailsUserData.appendChild(summary);

      const editButton = document.createElement('button');
      editButton.innerText = 'Edit';
      this.detailsUserData.appendChild(editButton);

      this.userDataInputDomElement = document.createElement('div');
      this.detailsUserData.appendChild(this.userDataInputDomElement);

      editButton.onclick = () => {
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.OBJECT_INPUT_CREATION, {
            detail: {
              ClassObjectInput: CurrentClassObjectInput,
              typeObjectInput: ObjectInput.TYPE.USER_DATA,
            },
          })
        );
      };
    } else {
      this.detailsUserData.hidden = true;
    }
  }

  /**
   * Update GameScript component edition of the current game object 3d
   */
  updateGameScript() {
    this.updateScriptComponent(GameScriptComponent.TYPE);
  }

  /**
   * Update ExternalScript component edition of the current game object 3d
   */
  updateExternalScript() {
    this.updateScriptComponent(ExternalScriptComponent.TYPE);
  }

  /**
   * Update Script component edition of the current game object 3d
   *
   * @param {string} scriptComponentType - can ExternalScriptComponent.TYPE or GameScriptComponent.TYPE
   */
  updateScriptComponent(scriptComponentType) {
    const scriptComponent = this.gameObject3D.getComponent(scriptComponentType);
    const detailsParent =
      scriptComponentType == GameScriptComponent.TYPE
        ? this.detailsGameScript
        : this.detailsExternalScript;
    const summaryText =
      scriptComponentType == GameScriptComponent.TYPE
        ? 'GameScript'
        : 'ExternalScript';
    const idScripts =
      scriptComponentType == GameScriptComponent.TYPE
        ? this.idGameScripts
        : this.idExternalScripts;
    const objectInputs =
      scriptComponentType == GameScriptComponent.TYPE
        ? this.gameScriptVariablesInputs
        : this.externalScriptVariablesInputs;

    while (detailsParent.firstChild) detailsParent.firstChild.remove();
    // rebuild domelement
    const summaryAudio = document.createElement('summary');
    summaryAudio.innerText = summaryText;
    detailsParent.appendChild(summaryAudio);

    if (scriptComponent) {
      // delete component button
      const deleteComponentButton = document.createElement('button');
      deleteComponentButton.innerText = 'Delete component';
      detailsParent.appendChild(deleteComponentButton);

      deleteComponentButton.onclick = () => {
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.COMPONENT_REMOVE, {
            detail: { type: scriptComponentType },
          })
        );
      };

      const listScript = document.createElement('ul');
      detailsParent.appendChild(listScript);

      const divObjectInput = document.createElement('div');
      detailsParent.appendChild(divObjectInput);

      if (scriptComponentType == GameScriptComponent.TYPE) {
        this.gameScriptInputDomElement = divObjectInput;
      } else if (scriptComponentType == ExternalScriptComponent.TYPE) {
        this.externalScriptInputDomElement = divObjectInput;
      }

      const updateList = () => {
        while (listScript.firstChild) listScript.firstChild.remove();

        scriptComponent.model.scriptParams.forEach((param, index) => {
          const li = document.createElement('li');
          li.innerText = param.id;
          listScript.appendChild(li);

          for (let index = 0; index < objectInputs.length; index++) {
            const ClassObjectInput = objectInputs[index];
            // scriptvariablesinput take an id in their condition
            if (ClassObjectInput.condition(param.id)) {
              const editButton = document.createElement('button');
              editButton.innerText = 'Edit';
              li.appendChild(editButton);
              editButton.onclick = () => {
                this.dispatchEvent(
                  new CustomEvent(
                    GameObject3DInput.EVENT.OBJECT_INPUT_CREATION,
                    {
                      detail: {
                        ClassObjectInput: ClassObjectInput,
                        typeObjectInput:
                          scriptComponentType == GameScriptComponent.TYPE
                            ? ObjectInput.TYPE.GAME_SCRIPT
                            : ObjectInput.TYPE.EXTERNAL_SCRIPT,
                      },
                    }
                  )
                );
              };

              break;
            }
          }

          const deleteButton = document.createElement('button');
          deleteButton.innerText = 'delete';
          li.appendChild(deleteButton);

          deleteButton.onclick = () => {
            scriptComponent.model.scriptParams.splice(index, 1);
            this.dispatchEvent(
              new CustomEvent(GameObject3DInput.EVENT.SCRIPT_DELETED, {
                detail: { id: param.id },
              })
            );
            updateList();
          };

          const priority = createLabelInput('Priorité: ', 'number');
          li.appendChild(priority.parent);
          priority.input.value = !isNaN(param.priority) ? param.priority : 0;
          priority.input.onchange = () => {
            const newPriority = Math.round(priority.input.value);
            if (isNaN(newPriority)) return;
            priority.input.value = newPriority; // the rounded one
            param.priority = newPriority;
          };
        });
      };
      updateList();

      // scripts that can be added
      const selectIdScript = document.createElement('select');
      detailsParent.appendChild(selectIdScript);

      idScripts.forEach((id) => {
        const option = document.createElement('option');
        option.innerText = id;
        option.value = id;
        selectIdScript.appendChild(option);
      });

      const addScriptButton = document.createElement('button');
      addScriptButton.innerText = 'Add ' + summaryText;
      detailsParent.appendChild(addScriptButton);

      addScriptButton.onclick = () => {
        const idToAdd = selectIdScript.selectedOptions[0].value;
        const alreadyThere =
          scriptComponent.model.scriptParams.filter(
            (param) => param.id == idToAdd
          ).length != 0;
        if (!alreadyThere) {
          scriptComponent.model.scriptParams.push({ id: idToAdd, priority: 0 });
          updateList();
        }
      };
    } else {
      const addComponentButton = document.createElement('button');
      addComponentButton.innerText = 'Add component';
      detailsParent.appendChild(addComponentButton);
      addComponentButton.onclick = () => {
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.COMPONENT_ADD, {
            detail: { type: scriptComponentType },
          })
        );
      };
    }
  }

  /**
   * Update Audio component edition of the current game object 3d
   */
  updateAudio() {
    const audioComp = this.gameObject3D.getComponent(AudioComponent.TYPE);
    while (this.detailsAudio.firstChild) this.detailsAudio.firstChild.remove();

    // rebuild domelement
    const summaryAudio = document.createElement('summary');
    summaryAudio.innerText = 'Audio';
    this.detailsAudio.appendChild(summaryAudio);
    if (audioComp) {
      // delete component button
      const deleteComponentButton = document.createElement('button');
      deleteComponentButton.innerText = 'Delete component';
      this.detailsAudio.appendChild(deleteComponentButton);

      deleteComponentButton.onclick = () => {
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.COMPONENT_REMOVE, {
            detail: { type: AudioComponent.TYPE },
          })
        );
      };

      // sounds
      const listIdSounds = document.createElement('ul');
      this.detailsAudio.appendChild(listIdSounds);

      const updateList = () => {
        while (listIdSounds.firstChild) listIdSounds.firstChild.remove();

        audioComp.model.soundsJSON.forEach((idSound) => {
          const li = document.createElement('li');
          li.innerText = idSound;
          listIdSounds.appendChild(li);

          const deleteButton = document.createElement('button');
          deleteButton.innerText = 'delete';
          li.appendChild(deleteButton);

          deleteButton.onclick = () => {
            removeFromArray(audioComp.model.soundsJSON, idSound);
            updateList();
          };
        });
      };
      updateList();

      // sounds
      const selectIdSound = document.createElement('select');
      this.detailsAudio.appendChild(selectIdSound);
      this.idSounds.forEach((idSound) => {
        const option = document.createElement('option');
        option.value = idSound;
        option.innerText = idSound;
        selectIdSound.appendChild(option);
      });

      const addIdSound = document.createElement('button');
      this.detailsAudio.appendChild(addIdSound);
      addIdSound.innerText = 'Add sound';
      addIdSound.onclick = () => {
        if (
          arrayPushOnce(
            audioComp.model.soundsJSON,
            selectIdSound.selectedOptions[0].value
          )
        ) {
          // has been added
          updateList();
        }
      };

      // conf audio

      // loop
      const loop = createLabelInput('Loop: ', 'checkbox');
      this.detailsAudio.appendChild(loop.parent);
      loop.input.checked = audioComp.model.conf.loop;
      loop.input.onchange = () => {
        audioComp.model.conf.loop = loop.input.checked;
      };

      // autoplay
      const autoplay = createLabelInput('Autoplay: ', 'checkbox');
      this.detailsAudio.appendChild(autoplay.parent);
      autoplay.input.checked = audioComp.model.conf.autoplay;
      autoplay.input.onchange = () => {
        audioComp.model.conf.autoplay = autoplay.input.checked;
      };

      // spatialized
      const spatialized = createLabelInput('Spatialized: ', 'checkbox');
      this.detailsAudio.appendChild(spatialized.parent);
      spatialized.input.checked = audioComp.model.conf.spatialized;
      spatialized.input.onchange = () => {
        audioComp.model.conf.spatialized = spatialized.input.checked;
      };

      // volume
      const volume = createLabelInput('Volume: ', 'range');
      this.detailsAudio.appendChild(volume.parent);
      volume.input.min = 0;
      volume.input.max = 1;
      volume.input.step = 'any';
      volume.input.value = isNaN(audioComp.model.conf.volume)
        ? 1
        : audioComp.model.conf.volume;
      volume.input.onchange = () => {
        audioComp.model.conf.volume = volume.input.valueAsNumber;
      };
    } else {
      const addComponentButton = document.createElement('button');
      addComponentButton.innerText = 'Add component';
      this.detailsAudio.appendChild(addComponentButton);
      addComponentButton.onclick = () => {
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.COMPONENT_ADD, {
            detail: { type: AudioComponent.TYPE },
          })
        );
      };
    }
  }

  /**
   * Update Render component edition of the current game object 3d
   */
  updateRender() {
    const renderComp = this.gameObject3D.getComponent(RenderComponent.TYPE);
    while (this.detailsRender.firstChild)
      this.detailsRender.firstChild.remove();

    // rebuild domelement
    const summaryRender = document.createElement('summary');
    summaryRender.innerText = 'Render';
    this.detailsRender.appendChild(summaryRender);
    if (renderComp) {
      // delete component button
      const deleteComponentButton = document.createElement('button');
      deleteComponentButton.innerText = 'Delete component';
      this.detailsRender.appendChild(deleteComponentButton);

      deleteComponentButton.onclick = () => {
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.COMPONENT_REMOVE, {
            detail: { type: RenderComponent.TYPE },
          })
        );
      };

      // color
      const color = createLabelInput('Couleur: ', 'color');
      this.detailsRender.appendChild(color.parent);
      color.input.value =
        '#' + new Color().fromArray(renderComp.model.color).getHexString();

      // opacity
      const opacity = createLabelInput('Opacité ', 'range');
      opacity.input.min = 0;
      opacity.input.max = 1;
      opacity.input.step = 'any';
      this.detailsRender.appendChild(opacity.parent);
      opacity.input.value = renderComp.model.color[3];

      const updateColor = () => {
        renderComp.controller.setColor([
          ...new Color(color.input.value).toArray(),
          opacity.input.valueAsNumber,
        ]);
      };

      opacity.input.onchange = updateColor;

      color.input.onchange = updateColor;

      // id model
      const selectIdRenderData = document.createElement('select');
      this.detailsRender.appendChild(selectIdRenderData);
      this.idRenderDatas.forEach((id) => {
        const option = document.createElement('option');
        option.innerText = id;
        option.value = id;
        selectIdRenderData.appendChild(option);
        if (renderComp.model.idRenderData == id) {
          selectIdRenderData.value = id;
        }
      });

      selectIdRenderData.onchange = () => {
        renderComp.controller.setIdRenderData(
          selectIdRenderData.selectedOptions[0].value
        );
      };
    } else {
      const addComponentButton = document.createElement('button');
      addComponentButton.innerText = 'Add component';
      this.detailsRender.appendChild(addComponentButton);
      addComponentButton.onclick = () => {
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.COMPONENT_ADD, {
            detail: { type: RenderComponent.TYPE },
          })
        );
      };
    }
  }

  /**
   * Update Collider component edition of the current game object 3d
   */
  updateCollider() {
    const colliderComp = this.gameObject3D.getComponent(ColliderComponent.TYPE);
    while (this.detailsCollider.firstChild)
      this.detailsCollider.firstChild.remove();

    // rebuild domelement
    const summaryCollider = document.createElement('summary');
    summaryCollider.innerText = 'Collider';
    this.detailsCollider.appendChild(summaryCollider);
    if (colliderComp) {
      // delete component button
      const deleteComponentButton = document.createElement('button');
      deleteComponentButton.innerText = 'Delete component';
      this.detailsCollider.appendChild(deleteComponentButton);

      deleteComponentButton.onclick = () => {
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.COMPONENT_REMOVE, {
            detail: { type: ColliderComponent.TYPE },
          })
        );
      };

      // edit body attr
      const bodyCheckbox = createLabelInput('body', 'checkbox');
      bodyCheckbox.input.checked = colliderComp.model.body;
      bodyCheckbox.input.onchange = () =>
        (colliderComp.model.body = bodyCheckbox.input.checked);
      this.detailsCollider.appendChild(bodyCheckbox.parent);

      // add a polygon
      const addPolygonButton = document.createElement('button');
      addPolygonButton.innerText = 'Add Polygon';
      this.detailsCollider.appendChild(addPolygonButton);

      addPolygonButton.onclick = () => {
        // add a square
        colliderComp.model.shapesJSON.push({
          type: ColliderComponent.SHAPE_TYPE.POLYGON,
          points: [
            { x: -5, y: -5, z: 0 },
            { x: 5, y: -5, z: 0 },
            { x: 5, y: 5, z: 0 },
            { x: -5, y: 5, z: 0 },
          ],
        });
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.SHAPE_ADDED, {
            detail: {
              shapeIndexCreated: colliderComp.model.shapesJSON.length - 1,
            },
          })
        );
      };

      // add a circle
      const addCircleButton = document.createElement('button');
      addCircleButton.innerText = 'Add Circle';
      this.detailsCollider.appendChild(addCircleButton);

      addCircleButton.onclick = () => {
        // add a circle
        colliderComp.model.shapesJSON.push({
          type: ColliderComponent.SHAPE_TYPE.CIRCLE,
          radius: 2.5,
          center: { x: 0, y: 0, z: 0 },
        });
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.SHAPE_ADDED, {
            detail: {
              shapeIndexCreated: colliderComp.model.shapesJSON.length - 1,
            },
          })
        );
      };

      const visualization2DImage = document.createElement('img');
      this.detailsCollider.appendChild(visualization2DImage);

      // visualize collision in 2d
      const visualizeCollision2DButton = document.createElement('button');
      visualizeCollision2DButton.innerText = 'Update visualize 2D collision';
      this.detailsCollider.appendChild(visualizeCollision2DButton);
      const drawVisualization2D = () => {
        const scene = new Scene();
        scene.add(new AmbientLight('white', 0.6));

        // move gameobject to another scene
        const oldParent = this.gameObject3D.parent;
        this.gameObject3D.removeFromParent();

        scene.add(this.gameObject3D);
        this.gameObject3D.updateMatrixWorld();

        // compute bb with collider points
        const bb = new Box3();

        const colliderComp = this.gameObject3D.getComponent(
          ColliderComponent.TYPE
        );
        colliderComp.model.shapesJSON.forEach((shape) => {
          if (shape.type == ColliderComponent.SHAPE_TYPE.POLYGON) {
            shape.points.forEach((point) => {
              bb.expandByPoint(
                new Vector3(point.x, point.y, point.z).applyMatrix4(
                  this.gameObject3D.matrixWorld
                )
              );
            });
          } else {
            bb.expandByPoint(
              new Vector3(
                shape.center.x + shape.radius,
                shape.center.y + shape.radius,
                shape.center.z
              )
                .multiply(this.gameObject3D.scale)
                .add(this.gameObject3D.position)
            );
            bb.expandByPoint(
              new Vector3(
                shape.center.x - shape.radius,
                shape.center.y - shape.radius,
                shape.center.z
              )
                .multiply(this.gameObject3D.scale)
                .add(this.gameObject3D.position)
            );
          }
        });

        const maxDim = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y);
        const halfSize = maxDim * 0.5;
        const camera = new OrthographicCamera(
          -halfSize,
          halfSize,
          halfSize,
          -halfSize,
          0.001,
          10000
        );
        bb.getCenter(camera.position);
        camera.position.z = 1000;
        camera.updateProjectionMatrix();
        const renderer = new WebGLRenderer({
          canvas: document.createElement('canvas'),
          antialias: true,
          alpha: true,
        });

        const size = 512;

        renderer.setSize(size, size);
        renderer.setClearColor(0xffffff, 0);
        renderer.render(scene, camera);

        // compute offset to translate collisions after
        const offset = bb
          .getCenter(new Vector3())
          .sub(this.gameObject3D.position);

        this.gameObject3D.removeFromParent();
        oldParent.add(this.gameObject3D);

        // draw image
        const image = new Image();
        image.src = renderer.domElement.toDataURL();

        image.onload = async () => {
          // render collisions
          const json = this.gameObject3D.toJSON();
          delete json.children; // remove children (they should be removed also in rendering above ?)
          delete json.components.GameScript; // remove GameScript only Collider is needed
          const context = new Context({}, new GameObject3D(json));
          await context.load();

          const canvas2D = document.createElement('canvas');
          canvas2D.width = renderer.domElement.width;
          canvas2D.height = renderer.domElement.height;
          const ctx = canvas2D.getContext('2d');

          ctx.drawImage(image, 0, 0);

          ctx.save();
          ctx.translate(
            (0.5 - offset.x / maxDim) * renderer.domElement.width,
            (0.5 + offset.y / maxDim) * renderer.domElement.height
          );
          ctx.scale(
            (this.gameObject3D.scale.x * renderer.domElement.width) / maxDim,
            (this.gameObject3D.scale.y * -renderer.domElement.height) / maxDim
          );
          context.collisions.draw(ctx);
          ctx.fillStyle = 'green';
          ctx.fill();
          ctx.restore();

          visualization2DImage.src = canvas2D.toDataURL();
        };
      };
      visualizeCollision2DButton.onclick = drawVisualization2D;
      drawVisualization2D();
    } else {
      const addComponentButton = document.createElement('button');
      addComponentButton.innerText = 'Add component';
      this.detailsCollider.appendChild(addComponentButton);
      addComponentButton.onclick = () => {
        this.dispatchEvent(
          new CustomEvent(GameObject3DInput.EVENT.COMPONENT_ADD, {
            detail: { type: ColliderComponent.TYPE },
          })
        );
      };
    }
  }

  /**
   * Update Transform component edition of the current game object 3d
   */
  updateTransform() {
    this.position.x.input.value = this.gameObject3D.position.x;
    this.position.y.input.value = this.gameObject3D.position.y;
    this.position.z.input.value = this.gameObject3D.position.z;
    this.rotation.x.input.value = this.gameObject3D.rotation.x;
    this.rotation.y.input.value = this.gameObject3D.rotation.y;
    this.rotation.z.input.value = this.gameObject3D.rotation.z;
    this.scale.x.input.value = this.gameObject3D.scale.x;
    this.scale.y.input.value = this.gameObject3D.scale.y;
    this.scale.z.input.value = this.gameObject3D.scale.z;
  }

  /**
   *
   * @returns {object} - EVENT enum of the game object 3d input
   */
  static get EVENT() {
    return {
      NAME_CHANGED: 'name_changed',
      TRANSFORM_CHANGED: 'transform_changed',
      SHAPE_ADDED: 'polygon_added',
      OBJECT_INPUT_CREATION: 'object_input_creation',
      SCRIPT_DELETED: 'script_deleted',
      COMPONENT_ADD: 'component_add',
      COMPONENT_REMOVE: 'component_remove',
    };
  }
}
window.customElements.define('game-object-3d-input', GameObject3DInput); // mandatory to extends HTMLElement
