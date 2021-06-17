/** @format */

import * as THREE from 'three';
import * as proj4 from 'proj4';
import * as itowns from 'itowns';

import './GameView.css';
import LocalScript from '../../Game/Shared/GameObject/Components/LocalScript';
import { View3D } from '../View3D/View3D';

const udvShared = require('../../Game/Shared/Shared');
const THREEUtils = udvShared.Components.THREEUtils;

export class GameView extends View3D {
  constructor(params) {
    //call parent class
    super(params);

    //ui
    this.ui = document.createElement('div');
    this.ui.classList.add('ui_GameView');

    //dynamic html
    this.fpsLabel = null;
    this.avatarCount = null;

    //assets
    this.assetsManager = params.assetsManager;

    //state renderer
    this.stateComputer = params.stateComputer;

    //object
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'GameView_Object3D';

    //sky color
    this.skyColor = null;

    //register last pass
    this.lastState = null;

    //first game view to know if traveling
    this.firstGameView = params.firstGameView || false;

    //uuid avatar TODO remove
    this.avatarUUID = null;

    //to pass local script
    this.localContext = new LocalContext(this);

    //ref uuid of go in the last state
    this.currentUUID = {};

    //move in View3D ?
    this.tickRequesters = [];
  }

  getSkyColor() {
    return this.skyColor;
  }

  appendToUI(el) {
    this.ui.appendChild(el);
  }

  initUI() {
    this.fpsLabel = document.createElement('div');
    this.fpsLabel.classList.add('label_GameView');
    this.ui.appendChild(this.fpsLabel);

    this.avatarCount = document.createElement('div');
    this.avatarCount.classList.add('label_GameView');
    this.ui.appendChild(this.avatarCount);

    this.rootHtml.appendChild(this.ui);
  }

  addTickRequester(cb) {
    this.tickRequesters.push(cb);
  }

  onFirstState(state, avatarUUID) {
    this.avatarUUID = avatarUUID;

    //build itowns view
    const o = state.getOrigin();
    const [x, y] = proj4.default('EPSG:3946').forward([o.lng, o.lat]);
    const r = this.config.itowns.radiusExtent;

    // Define geographic extent: CRS, min/max X, min/max Y
    const extent = new itowns.Extent('EPSG:3946', x - r, x + r, y - r, y + r);

    this.initItownsView(extent);

    //other init
    this.initScene(state);
    this.initUI();

    //register in mainloop
    const _this = this;
    const fps = this.config.game.fps;

    let now;
    let then = Date.now();
    let delta;
    const tick = function () {
      if (_this.disposed) return; //stop requesting frame

      requestAnimationFrame(tick);

      _this.tickRequesters.forEach(function (cb) {
        cb();
      });

      now = Date.now();
      delta = now - then;

      if (delta > 1000 / fps) {
        // update time stuffs
        then = now - (delta % 1000) / fps;
        _this.localContext.setDt(delta);
        _this.update(_this.stateComputer.computeCurrentState());
      }
    };
    tick();

    //resize
    setTimeout(this.onResize.bind(this), 1000);
  }

  initScene(state) {
    const o = state.getOrigin();
    const [x, y] = proj4.default('EPSG:3946').forward([o.lng, o.lat]);

    this.object3D.position.x = x;
    this.object3D.position.y = y;
    this.object3D.position.z = o.alt;
    this.itownsView.scene.add(this.object3D);

    //sky
    this.skyColor = new THREE.Color(
      this.config.game.skyColor.r,
      this.config.game.skyColor.g,
      this.config.game.skyColor.b
    );

    //shadow
    const renderer = this.itownsView.mainLoop.gfxEngine.renderer;
    THREEUtils.initRenderer(renderer, this.skyColor);

    // Lights
    const { directionalLight, ambientLight } = THREEUtils.addLights(
      this.itownsView.scene
    );

    directionalLight.shadow.mapSize = new THREE.Vector2(
      this.config.game.shadowMapSize,
      this.config.game.shadowMapSize
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0005;
    this.directionalLight = directionalLight;
  }

  update(state) {
    const _this = this;
    const newGO = [];
    const ctx = this.localContext;

    if (this.lastState) {
      if (!state.getGameObject()) throw new Error('no gameObject in state');

      let lastGO = this.lastState.getGameObject();
      lastGO.traverse(function (g) {
        const uuid = g.getUUID();
        const current = state.getGameObject().find(uuid);
        if (current && !g.isStatic()) {
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

    //buffer
    this.lastState = state;

    const go = state.getGameObject();

    //init new GO
    newGO.forEach(function (g) {
      g.initAssetsComponents(_this.assetsManager, udvShared);
    });

    //localscript event INIT + ON_NEW_GAMEOBJECT
    newGO.forEach(function (g) {
      console.log('New GO => ', g.name);
      _this.currentUUID[g.getUUID()] = true;

      //init newGO localscript
      const scriptComponent = g.getComponent(LocalScript.TYPE);
      if (scriptComponent) {
        scriptComponent.execute(LocalScript.EVENT.INIT, [ctx]);
      }

      //notify other go that
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
    this.object3D.add(go.fetchObject3D());
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

    if (this.pause) return; //no render

    //tick local script
    go.traverse(function (child) {
      const scriptComponent = child.getComponent(LocalScript.TYPE);
      if (scriptComponent)
        scriptComponent.execute(LocalScript.EVENT.TICK, [ctx]);
    });

    //render
    const scene = this.itownsView.scene;
    const renderer = this.itownsView.mainLoop.gfxEngine.renderer;
    renderer.clearColor();
    renderer.render(scene, this.itownsView.camera.camera3D);

    //TODO ne pas lancer des rendu si itowns vient d'en faire un

    //update ui
    this.fpsLabel.innerHTML =
      'FPS = ' + Math.round(1000 / this.localContext.getDt());
    let avatarCount = 0;
    go.traverse(function (g) {
      if (g.name == 'avatar') avatarCount++;
    });
    this.avatarCount.innerHTML = 'Player: ' + avatarCount;
  }

  getAssetsManager() {
    return this.assetsManager;
  }

  getLastState() {
    return this.lastState;
  }
}

class LocalContext {
  constructor(gameView) {
    this.dt = 0;
    this.gameView = gameView;
  }

  setDt(dt) {
    this.dt = dt;
  }

  getSharedModule() {
    return udvShared;
  }
  getDt() {
    return this.dt;
  }
  getGameView() {
    return this.gameView;
  }
  getItownsModule() {
    return itowns;
  }
}
