/** @format */

import * as udviz from '../../index';
import * as THREE from 'three';
import * as proj4 from 'proj4';
import * as itowns from 'itowns';

import LocalScript from '../../Game/Shared/GameObject/Components/LocalScript';
import { View3D } from '../View3D/View3D';

const udvShared = require('../../Game/Shared/Shared');
const THREEUtils = udvShared.Components.THREEUtils;

/**
 * Main view of an ud-viz game application
 * This object works with a state computer (./src/Game/Components/StateComputer)
 */
export class GameView extends View3D {
  constructor(params) {
    //call parent class
    super(params);

    //assets
    this.assetsManager = params.assetsManager;

    //state computer
    this.stateComputer = params.stateComputer;

    //object3D
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'GameView_Object3D';

    //sky color
    this.skyColor = null;

    //the last state processed
    this.lastState = null;

    //TODO place these attributes in a userData object
    this.firstGameView = params.firstGameView || false; //first gameview of the application
    this.avatarUUID = null; //uuid of the avatar

    //context pass to the localScript GameObject
    this.localContext = new LocalContext(this);

    //Current GameObject UUID in the last state
    this.currentUUID = {};

    //TODO move in View3D
    //Array of callbacks call during the tick
    this.tickRequesters = [];
  }

  /**
   *
   * @returns {THREE.Color} color of the renderer clear color
   */
  getSkyColor() {
    return this.skyColor;
  }

  /**
   * register the function into tickRequesters
   * @param {Function} cb a function that will be call every tick
   */
  addTickRequester(cb) {
    this.tickRequesters.push(cb);
  }

  /**
   * Initialize this view
   *
   * @param {WorldState} state first state of this view
   * @param {uuid} avatarUUID uuid of the avatar GameObject
   */
  onFirstState(state, avatarUUID) {
    //ref it
    this.avatarUUID = avatarUUID;

    //build itowns view
    const o = state.getOrigin();
    const [x, y] = proj4.default('EPSG:3946').forward([o.lng, o.lat]);
    const r = this.config.itowns.radiusExtent;
    // Define geographic extent: CRS, min/max X, min/max Y
    const extent = new itowns.Extent('EPSG:3946', x - r, x + r, y - r, y + r);
    this.initItownsView(extent);

    this.initScene(state);

    //start to tick
    const _this = this;
    const fps = this.config.game.fps;

    let now;
    let then = Date.now();
    let delta;
    const tick = function () {
      if (_this.disposed) return; //stop requesting frame if disposed

      requestAnimationFrame(tick);

      now = Date.now();
      delta = now - then;

      if (delta > 1000 / fps) {
        // update time stuffs
        then = now - (delta % 1000) / fps;

        //set dt
        _this.localContext.setDt(delta);

        //call tick requester
        _this.tickRequesters.forEach(function (cb) {
          cb(_this.localContext);
        });

        //update Gameview
        _this.update(_this.stateComputer.computeCurrentState());
      }
    };
    tick();

    //differed a resize event
    setTimeout(this.onResize.bind(this), 1000);
  }

  getObject3D() {
    return this.object3D;
  }

  /**
   * initialize the scene of the itwons view
   * @param {WorldState} state
   */
  initScene(state) {
    const o = state.getOrigin();
    const [x, y] = proj4.default('EPSG:3946').forward([o.lng, o.lat]);

    //add the object3D of the Game
    //TODO this object should be in World
    this.object3D.position.x = x;
    this.object3D.position.y = y;
    this.object3D.position.z = o.alt;
    this.itownsView.scene.add(this.object3D);

    //init sky color based on config file
    this.skyColor = new THREE.Color(
      this.config.game.skyColor.r,
      this.config.game.skyColor.g,
      this.config.game.skyColor.b
    );

    //init renderer
    const renderer = this.itownsView.mainLoop.gfxEngine.renderer;
    THREEUtils.initRenderer(renderer, this.skyColor);

    //add lights
    const { directionalLight, ambientLight } = THREEUtils.addLights(
      this.itownsView.scene
    );

    //configure shadows based on a config files
    directionalLight.shadow.mapSize = new THREE.Vector2(
      this.config.game.shadowMapSize,
      this.config.game.shadowMapSize
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0005;
    this.directionalLight = directionalLight;
  }

  /**
   * Update GameObject with the new state
   * Initialize assets of the new GameObject
   * Call LocalScript of the GameObject
   * Replace Shadow light if needed
   * Call a render pass
   *
   * @param {WorldState} state the new state used to update this view
   */
  update(state) {
    const _this = this;
    const newGO = [];
    const ctx = this.localContext;

    //update lastState with the new one
    if (this.lastState) {
      let lastGO = this.lastState.getGameObject();
      lastGO.traverse(function (g) {
        const uuid = g.getUUID();
        const current = state.getGameObject().find(uuid);
        if (current && !g.isStatic()) {
          //update local components
          g.updateNoStaticFromGO(current, ctx);
        } else if (!current) {
          //do not exist remove it
          g.removeFromParent();
          delete _this.currentUUID[g.getUUID()];
        }
      });

      state.getGameObject().traverse(function (g) {
        const uuid = g.getUUID();
        const old = lastGO.find(uuid);
        if (!old) {
          //new one add it
          const parent = lastGO.find(g.getParentUUID());
          parent.addChild(g);
        }

        if (!_this.currentUUID[g.getUUID()]) {
          newGO.push(g);
        }
      });

      state.setGameObject(lastGO); //update GO
    } else {
      state.getGameObject().traverse(function (g) {
        newGO.push(g);
      });
    }

    //bufferize
    this.lastState = state;

    //init assets new GO
    newGO.forEach(function (g) {
      g.initAssetsComponents(_this.assetsManager, {
        udviz: udviz,
        Shared: udvShared,
      });
    });

    const go = state.getGameObject();

    //localscript event INIT + ON_NEW_GAMEOBJECT
    newGO.forEach(function (g) {
      console.log('New GO => ', g.name);
      _this.currentUUID[g.getUUID()] = true;

      //init newGO localscript
      const scriptComponent = g.getComponent(LocalScript.TYPE);
      if (scriptComponent) {
        scriptComponent.execute(LocalScript.EVENT.INIT, [ctx]);
      }

      //notify other go that a new go has been added
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

    //rebuild object
    this.object3D.children.length = 0;
    this.object3D.add(go.computeObject3D());
    this.object3D.updateMatrixWorld();

    //update shadow
    if (newGO.length)
      THREEUtils.bindLightTransform(
        10,
        Math.PI / 4,
        Math.PI / 4,
        this.object3D,
        this.directionalLight
      );

    if (!this.pause) {
      //tick local script
      go.traverse(function (child) {
        const scriptComponent = child.getComponent(LocalScript.TYPE);
        if (scriptComponent)
          scriptComponent.execute(LocalScript.EVENT.TICK, [ctx]);
      });

      //render
      const scene = this.itownsView.scene;
      scene.updateMatrixWorld();
      const renderer = this.itownsView.mainLoop.gfxEngine.renderer;
      renderer.clearColor();
      renderer.render(scene, this.itownsView.camera.camera3D);

      //TODO refacto tick integrate with itowns rendering
    }
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

  getStateComputer() {
    return this.stateComputer;
  }
}

/**
 * Context pass to the GameObject LocalScript to work
 * TODO pass ud-viz module instead of just Shared/itowns/proj4
 */
class LocalContext {
  constructor(gameView) {
    this.dt = 0;
    this.gameView = gameView;
  }

  /**
   *
   * @param {Number} dt delta time of the current frame
   */
  setDt(dt) {
    this.dt = dt;
  }

  /**
   * ud-viz/Game/Shared module
   * @returns {Shared}
   */
  getSharedModule() {
    return udvShared;
  }

  /**
   *
   * @returns {Number}
   */
  getDt() {
    return this.dt;
  }

  /**
   *
   * @returns {GameView}
   */
  getGameView() {
    return this.gameView;
  }

  /**
   * itowns module
   * @returns {itowns}
   */
  getItownsModule() {
    return itowns;
  }
}
