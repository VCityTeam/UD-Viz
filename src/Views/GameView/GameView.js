/** @format */

import * as udviz from '../../index';
import * as THREE from 'three';
import * as proj4 from 'proj4';
import * as itowns from 'itowns';

import LocalScript from '../../Game/GameObject/Components/LocalScript';
import { View3D } from '../View3D/View3D';
import { Audio, Render } from '../../Game/Game';

import { computeNearFarCamera } from '../../Components/Camera/CameraUtils';

const udvGame = require('../../Game/Game');
import * as THREEUtils from '../../Components/THREEUtils';

/**
 * Main view of an ud-viz game application
 * This object works with a state computer (./src/Game/Components/interpolator)
 */
export class GameView extends View3D {
  constructor(params) {
    // Call parent class
    super(params);

    // Remove resize listener of parent
    window.removeEventListener('resize', this.resizeListener);
    this.resizeListener = this.onResize.bind(this);
    // Add its own
    window.addEventListener('resize', this.resizeListener);

    // Custom modules pass the localscript context
    this.localScriptModules = params.localScriptModules || {};

    // Assets
    this.assetsManager = params.assetsManager;

    // Object passing states to the view its could work with a local worldcomputer or a distant server via websocket communication
    this.interpolator = params.interpolator;

    // Object3D
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'GameView_Object3D';

    // Sky color
    this.skyColor = null;

    // The last state processed
    this.lastState = null;

    // Stop update of gameobject
    this.updateGameObject = true;
    if (params.updateGameObject != undefined)
      this.updateGameObject = params.updateGameObject;

    // Context pass to the localScript GameObject
    this.localContext = new LocalContext(this);

    // Current GameObject UUID in the last state
    this.currentUUID = {};

    // TODO move requesters in View3D
    // Array of callbacks call during the tick
    this.tickRequesters = [];
    this.resizeRequesters = [];
    this.onNewGORequesters = [];

    // UserData
    this.userData = params.userData || {};

    // Itowns rendering or not
    this.itownsRendering = false;
  }

  onResize() {
    super.onResize();

    const ctx = this.localContext;
    this.resizeRequesters.forEach(function (cb) {
      cb(ctx);
    });

    // Notify localscript
    if (this.lastState) {
      this.lastState.getGameObject().traverse(function (g) {
        const scriptComponent = g.getComponent(LocalScript.TYPE);
        if (scriptComponent) {
          scriptComponent.execute(LocalScript.EVENT.ON_RESIZE, [ctx]);
        }
      });
    }
  }

  getUserData(key) {
    return this.userData[key];
  }

  writeUserData(key, value) {
    this.userData[key] = value;
  }

  getLocalContext() {
    return this.localContext;
  }

  getLocalScriptModules() {
    return this.localScriptModules;
  }

  /**
   *
   * @param {boolean} value true go are updated false no
   */
  setUpdateGameObject(value) {
    this.updateGameObject = value;
    this.interpolator.setPause(value);
  }

  /**
   *
   * @returns {THREE.Color} color of the renderer clear color
   */
  getSkyColor() {
    return this.skyColor;
  }

  /**
   * Register the function into tickRequesters
   *
   * @param {Function} cb a function that will be call every tick
   */
  addTickRequester(cb) {
    this.tickRequesters.push(cb);
  }

  // Allow user to plug a cb when resize method is called
  addResizeRequester(cb) {
    this.resizeRequesters.push(cb);
  }

  addOnNewGORequester(cb) {
    this.onNewGORequesters.push(cb);
  }

  /**
   * Initialize this view
   *
   * @param {WorldState} state first state of this view
   */
  start(state = this.interpolator.computeCurrentState()) {
    if (!state) throw new Error('no state');

    return new Promise((resolve) => {
      // Build itowns view
      const o = state.getOrigin();
      const r = this.config.game.radiusExtent;
      if (o) {
        const [x, y] = proj4.default(this.projection).forward([o.lng, o.lat]);
        // Define geographic extent: CRS, min/max X, min/max Y
        const extent = new itowns.Extent(
          this.projection,
          x - r,
          x + r,
          y - r,
          y + r
        );
        this.initItownsView(extent);

        // TODO disable itowns rendering
        this.itownsView.render = function () {
          // Empty
        };
      } else {
        THREE.Object3D.DefaultUp.set(0, 0, 1);

        // No origin means no itowns view fill attr
        this.scene = new THREE.Scene();
        const canvas = document.createElement('canvas');
        this.rootWebGL.appendChild(canvas);
        this.renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: true,
          logarithmicDepthBuffer: true,
          alpha: true,
        });
        this.camera = new THREE.PerspectiveCamera(60, 1, 1, 1000); // Default params
        this.scene.add(this.camera);

        // Fill custom extent
        this.extent = {
          north: r,
          west: -r,
          south: -r,
          east: r,
          center: function () {
            return new THREE.Vector2();
          },
        };
      }

      // Start listening
      this.inputManager.startListening(this.rootWebGL);

      // Init scene
      this.initScene(state);

      // Start to tick
      const fps = this.config.game.fps;

      let now;
      let then = Date.now();
      let delta;
      const _this = this;
      const tick = function () {
        if (_this.disposed) return; // Stop requesting frame if disposed

        requestAnimationFrame(tick);

        now = Date.now();
        delta = now - then;

        if (delta > 1000 / fps) {
          // Update time stuffs
          then = now - (delta % 1000) / fps;

          // Set dt
          _this.localContext.setDt(delta);

          // Call tick requester
          _this.tickRequesters.forEach(function (cb) {
            cb(_this.localContext);
          });

          // Update Gameview
          _this.update(_this.interpolator.computeCurrentStates());
          // Render
          if (_this.isRendering && !_this.itownsRendering) {
            // This notably charge missing iTowns tiles according to current view.
            const iV = _this.itownsView;
            if (iV) iV.notifyChange(_this.getCamera());

            // Adjust camera params
            computeNearFarCamera(_this.getCamera(), _this.extent, 400);
            _this.render();
          }
        }
      };
      resolve();
      tick();

      // Differed a resize event
      setTimeout(this.resizeListener, 10);
    });
  }

  isItownsRendering() {
    return this.itownsRendering;
  }

  setItownsRendering(value) {
    this.itownsRendering = value;

    if (value) {
      // Creating controls like this put it in this.itownsView.controls
      this.planarControl = new itowns.PlanarControls(this.itownsView, {
        handleCollision: false,
        focusOnMouseOver: false,
        focusOnMouseClick: false,
        zoomFactor: 0.9,
      });

      // Dynamic near far computation
      this.itownsView.addFrameRequester(
        itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER,
        this.itownsRequesterBeforeRender
      );

      // Enable itowns rendering
      this.itownsView.render = null;
    } else {
      this.itownsView.controls.dispose();
      this.itownsView.controls = null;

      this.itownsView.removeFrameRequester(
        itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER,
        this.itownsRequesterBeforeRender
      );

      // Disable itowns rendering
      this.itownsView.render = function () {
        // Empty
      };
    }
  }

  /**
   *
   * @returns {THREE.Object3D} return the object3D of the gameview
   */
  getObject3D() {
    return this.object3D;
  }

  /**
   * Initialize the scene of the itwons view
   *
   * @param {WorldState} state
   */
  initScene(state) {
    let x = 0;
    let y = 0;
    let z = 0;

    const o = state.getOrigin();
    if (o) {
      [x, y] = proj4.default(this.projection).forward([o.lng, o.lat]);
      z = o.alt;
    }

    // Add the object3D of the Game
    // TODO this object should be in World ?
    this.object3D.position.x = x;
    this.object3D.position.y = y;
    this.object3D.position.z = z;
    this.scene.add(this.object3D);

    if (!this.config.game) {
      console.error('miss game field in your config');
    }

    // Init sky color based on config file
    this.skyColor = new THREE.Color(
      this.config.game.sky.color.r,
      this.config.game.sky.color.g,
      this.config.game.sky.color.b
    );

    // Init renderer
    const renderer = this.getRenderer();
    THREEUtils.initRenderer(renderer, this.skyColor);

    // Add lights
    const { directionalLight } = THREEUtils.addLights(this.scene);

    // Configure shadows based on a config files
    directionalLight.shadow.mapSize = new THREE.Vector2(
      this.config.game.shadowMapSize,
      this.config.game.shadowMapSize
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0005;
    this.directionalLight = directionalLight;

    if (this.config.game.sky.paths) {
      THREEUtils.addCubeTexture(this.config.game.sky.paths, this.getScene());
    }
  }

  /**
   * Dispose this view
   *
   * @param keepAssets
   */
  dispose(keepAssets = false) {
    super.dispose();
    this.interpolator.stop();

    // Notify localscript dispose
    if (this.lastState) {
      const ctx = this.localContext;

      this.lastState.getGameObject().traverse(function (g) {
        const scriptComponent = g.getComponent(LocalScript.TYPE);
        if (scriptComponent) {
          scriptComponent.execute(LocalScript.EVENT.DISPOSE, [ctx]);
        }
        const audioComponent = g.getComponent(Audio.TYPE);
        if (audioComponent) audioComponent.dispose();
      });
    }

    if (!keepAssets) this.assetsManager.dispose();
  }

  /**
   * Update GameObject with the new state
   * Initialize assets of the new GameObject
   * Call LocalScript of the GameObject
   * Replace Shadow light if needed
   * Call a render pass
   *
   * @param {WorldState} state the new state used to update this view
   * @param states
   */
  update(states) {
    const _this = this;
    const newGO = [];
    const ctx = this.localContext;

    const state = states[states.length - 1];

    // Update lastState with the new one
    if (this.lastState) {
      const lastGO = this.lastState.getGameObject();

      if (this.updateGameObject) {
        // Update lastGO

        lastGO.traverse(function (g) {
          const uuid = g.getUUID();
          const current = state.getGameObject().find(uuid);
          if (current) {
            const bufferedGO = [];
            states.forEach(function (s) {
              const bGO = s.getGameObject().find(uuid);
              if (bGO) bufferedGO.push(bGO);
            });

            // Update local components
            g.updateFromGO(current, bufferedGO, ctx);
          } else {
            // Do not exist remove it
            g.removeFromParent();

            // Remove object3D
            g.getObject3D().parent.remove(g.getObject3D());

            // Localscript notification
            const scriptComponent = g.getComponent(LocalScript.TYPE);
            if (scriptComponent) {
              scriptComponent.execute(LocalScript.EVENT.ON_REMOVE, [ctx]);
            }

            delete _this.currentUUID[g.getUUID()];
          }
        });

        state.getGameObject().traverse(function (g) {
          const uuid = g.getUUID();
          const old = lastGO.find(uuid);
          if (!old) {
            // New one add it
            const parent = lastGO.find(g.getParentUUID());
            parent.addChild(g);
          }

          if (!_this.currentUUID[g.getUUID()]) {
            newGO.push(g);
          }
        });
      }

      state.setGameObject(lastGO); // Set it
    } else {
      state.getGameObject().traverse(function (g) {
        newGO.push(g);
      });
    }

    // Bufferize
    this.lastState = state;

    // Init assets new GO
    newGO.forEach(function (g) {
      g.initAssetsComponents(_this.assetsManager, {
        udviz: udviz,
        Game: udvGame,
      });
    });

    const go = state.getGameObject();

    // Localscript event INIT + ON_NEW_GAMEOBJECT
    newGO.forEach(function (g) {
      // Console.log('New GO => ', g.name);
      _this.currentUUID[g.getUUID()] = true;

      // Init newGO localscript
      const scriptComponent = g.getComponent(LocalScript.TYPE);
      if (scriptComponent) {
        scriptComponent.execute(LocalScript.EVENT.INIT, [ctx]);
      }

      // Notify other go that a new go has been added
      go.traverse(function (child) {
        const scriptComponent = child.getComponent(LocalScript.TYPE);
        if (scriptComponent) {
          scriptComponent.execute(LocalScript.EVENT.ON_NEW_GAMEOBJECT, [
            ctx,
            g,
          ]);
        }
      });
    });

    // RENDERING

    // rebuild object
    this.object3D.children.length = 0;
    this.object3D.add(go.computeObject3D());
    // Update matrix
    this.scene.updateMatrixWorld();

    // Update shadow
    if (newGO.length) {
      THREEUtils.bindLightTransform(
        10,
        this.config.game.sky.sun_position.phi,
        this.config.game.sky.sun_position.theta,
        this.object3D,
        this.directionalLight
      );
      this.onNewGORequesters.forEach(function (cb) {
        cb(ctx, newGO);
      });
    }

    if (this.updateGameObject) {
      go.traverse(function (child) {
        // Tick local script
        const scriptComponent = child.getComponent(LocalScript.TYPE);
        if (scriptComponent) {
          scriptComponent.execute(LocalScript.EVENT.TICK, [ctx]);
        }

        // Tick audio component
        const audioComp = child.getComponent(Audio.TYPE);
        const camera = _this.getCamera();
        // Position in world referential
        const cameraMatWorldInverse = camera.matrixWorldInverse;
        if (audioComp)
          audioComp.tick(cameraMatWorldInverse, _this.getObject3D().position);

        // Render component
        const renderComp = child.getComponent(Render.TYPE);
        if (renderComp) renderComp.tick(ctx);
      });
    }
  }

  // Allow user to set a custom render pass
  setRender(f) {
    this.render = f;
  }

  render() {
    // Render
    this.renderer.clearColor();
    this.renderer.render(this.scene, this.getCamera());
  }

  /**
   * Force this gameview to update with a specific state
   *
   * @param {WorldState} state
   */
  forceUpdate(state) {
    let states = [];
    if (!state) {
      const computer = this.interpolator.getLocalComputer();
      if (computer) {
        states = [computer.computeCurrentState()];
      } else {
        throw new Error('no local computer');
      }
    } else states = [state];

    const old = this.updateGameObject;
    this.updateGameObject = true;
    this.update(states);
    this.updateGameObject = old;
  }

  /**
   * @returns {AssetsManager}
   */
  getAssetsManager() {
    return this.assetsManager;
  }

  /**
   * @returns {WorldState}
   */
  getLastState() {
    return this.lastState;
  }

  getInterpolator() {
    return this.interpolator;
  }

  setInterpolator(i) {
    this.interpolator = i;
  }
}

/**
 * Context pass to the GameObject LocalScript to work (TODO this class is relevant ? all attributes could be in gameview class)
 */
class LocalContext {
  constructor(gameView) {
    this.dt = 0;
    this.gameView = gameView;
    this.webSocketService = null;
  }

  /**
   *
   * @param {number} dt delta time of the current frame
   */
  setDt(dt) {
    this.dt = dt;
  }

  /**
   *
   * @returns {number}
   */
  getDt() {
    return this.dt;
  }

  setWebSocketService(w) {
    this.webSocketService = w;
  }

  getWebSocketService() {
    return this.webSocketService;
  }

  getRootGameObject() {
    return this.gameView.getLastState().getGameObject().computeRoot();
  }

  /**
   *
   * @returns {GameView}
   */
  getGameView() {
    return this.gameView;
  }
}
