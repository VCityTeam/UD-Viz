/** @format */

import { InputManager } from '../Components/InputManager';

import { UDVDebugger } from '../../Game/UDVDebugger/UDVDebugger';

import * as THREE from 'three';
import * as proj4 from 'proj4';
import * as itowns from 'itowns';

import './GameView.css';
import LocalScript from '../Shared/GameObject/Components/LocalScript';

const udvShared = require('../Shared/Shared');
const WorldState = udvShared.WorldState;
const THREEUtils = udvShared.Components.THREEUtils;

export class GameView {
  constructor(params) {
    params.htmlParent = params.htmlParent || document.body;

    //html
    this.rootHtml = document.createElement('div');
    this.rootHtml.id = 'viewerDiv'; //itowns
    params.htmlParent.appendChild(this.rootHtml);
    window.addEventListener('resize', this.onResize.bind(this));

    //ui
    this.ui = document.createElement('div');
    this.ui.classList.add('ui_GameView');

    this.fpsLabel = null;
    this.avatarCount = null;

    //game running with  a server simulating world or local
    this.isLocal = params.isLocal;

    //conf
    this.config = params.config;

    //assets
    this.assetsManager = params.assetsManager;

    //inputs
    this.inputManager = new InputManager();

    //state renderer
    this.worldStateInterpolator = params.worldStateInterpolator;

    //object
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'GameView_Object3D';

    //sky color
    this.skyColor = null;

    //register last pass
    this.lastState = null;

    //flag
    this.disposed = false;

    //first game view to know if traveling
    this.firstGameView = params.firstGameView || false;

    //uuid avatar TODO remove
    this.avatarUUID = null;

    //itowns view
    this.view = null;

    //model only in Local
    this.world = null;

    //to pass gameobject world script (only local) TODO move this in LocalWorld
    this.gameContext = {
      assetsManager: this.assetsManager,
      dt: 0,
      commands: null,
      world: null,
      UDVShared: udvShared,
    };

    //to pass local script
    this.localContext = new LocalContext(this);

    //ref uuid of go in the last state
    this.currentUUID = {};

    this.pause = false;

    this.tickRequesters = [];

    //DEBUG
    window.UDVDebugger = new UDVDebugger(document.body);
  }

  getSkyColor() {
    return this.skyColor;
  }

  setPause(value) {
    this.pause = value;
    this.inputManager.setPause(value);
  }

  appendToUI(el) {
    this.ui.appendChild(el);
  }

  //TODO remove in localworld object
  setWorld(world) {
    this.world = world;
    if (!world) return;
    this.gameContext.world = world;

    //reload world
  }

  //TODO remove in localworld object
  getWorld() {
    return this.world;
  }

  html() {
    return this.rootHtml;
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

  onFirstStateJSON(firstStateJSON) {
    const state = new WorldState(firstStateJSON.state);
    this.worldStateInterpolator.onFirstState(state);
    this.onFirstState(state);
    this.avatarUUID = firstStateJSON.avatarID;
  }

  addTickRequester(cb) {
    this.tickRequesters.push(cb);
  }

  onFirstState(state) {
    //build itowns view
    this.initItownsView(state);
    this.initScene(state);
    this.initUI();

    //register in mainloop
    const _this = this;
    const fps = this.config.game.fps;
    if (this.isLocal) {
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
          _this.updateViewLocal(delta);
        }
      };
      tick();
    } else {
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
          _this.updateViewServer(delta);
        }
      };
      tick();
    }

    //resize
    setTimeout(this.onResize.bind(this), 1000);
  }

  initScene(state) {
    const o = state.getOrigin();
    const [x, y] = proj4.default('EPSG:3946').forward([o.lng, o.lat]);

    this.object3D.position.x = x;
    this.object3D.position.y = y;
    this.object3D.position.z = o.alt;
    this.view.scene.add(this.object3D);

    //sky
    this.skyColor = new THREE.Color(
      this.config.game.skyColor.r,
      this.config.game.skyColor.g,
      this.config.game.skyColor.b
    );

    //shadow
    const renderer = this.view.mainLoop.gfxEngine.renderer;
    THREEUtils.initRenderer(renderer, this.skyColor);

    // Lights
    const { directionalLight, ambientLight } = THREEUtils.addLights(
      this.view.scene
    );

    directionalLight.shadow.mapSize = new THREE.Vector2(
      this.config.game.shadowMapSize,
      this.config.game.shadowMapSize
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0005;
    this.directionalLight = directionalLight;
  }

  getWorldStateInterpolator() {
    return this.worldStateInterpolator;
  }

  //TODO only one update
  updateViewServer(dt) {
    //TODO itowns BUG
    if (!isNaN(dt)) {
      this.gameContext.dt = dt;
      this.localContext.setDt(dt);
    }

    window.UDVDebugger.displayShadowMap(
      this.directionalLight,
      this.view.mainLoop.gfxEngine.renderer
    );

    this.update(this.worldStateInterpolator.getCurrentState());
  }

  updateViewLocal(dt) {
    //TODO itowns BUG
    if (!isNaN(dt)) {
      this.gameContext.dt = dt;
      this.localContext.setDt(dt);
    }

    //tick world TODO handle by another class
    this.gameContext.commands = this.inputManager.computeCommands();
    const avatarUUID = this.avatarUUID;
    this.gameContext.commands.forEach(function (cmd) {
      cmd.setAvatarID(avatarUUID);
    });
    this.world.tick(this.gameContext);

    this.update(this.world.computeWorldState());
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
          g.updateNoStaticFromGO(current);
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

    //init new GO remove ?
    if (!this.isLocal) {
      newGO.forEach(function (g) {
        g.initAssetsComponents(_this.assetsManager, udvShared);
      });
    }

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
    const scene = this.view.scene;
    const renderer = this.view.mainLoop.gfxEngine.renderer;
    renderer.clearColor();
    renderer.render(scene, this.view.camera.camera3D);

    //TODO ne pas lancer des rendu si itowns vient d'en faire un

    //update ui
    this.fpsLabel.innerHTML = 'FPS = ' + Math.round(1000 / this.gameContext.dt);
    let avatarCount = 0;
    go.traverse(function (g) {
      if (g.name == 'avatar') avatarCount++;
    });
    this.avatarCount.innerHTML = 'Player: ' + avatarCount;
  }

  initItownsView(state) {
    // Define EPSG:3946 projection which is the projection used in the 3D view
    // (planarView of iTowns). It is indeed needed
    // to convert the coordinates received from the world server
    // to this coordinate system.
    proj4.default.defs(
      'EPSG:3946',
      '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
        ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );
    const o = state.getOrigin();
    const [x, y] = proj4.default('EPSG:3946').forward([o.lng, o.lat]);
    const r = this.config.itowns.radiusExtent;

    // Define geographic extent: CRS, min/max X, min/max Y
    const extent = new itowns.Extent('EPSG:3946', x - r, x + r, y - r, y + r);

    // Get camera placement parameters from config
    let coordinates = extent.center();
    let heading = parseFloat(this.config['itowns']['camera']['heading']);
    let range = parseFloat(this.config['itowns']['camera']['range']);
    let tilt = parseFloat(this.config['itowns']['camera']['tilt']);

    this.view = new itowns.PlanarView(this.rootHtml, extent, {
      disableSkirt: false,
      placement: {
        coord: coordinates,
        heading: heading,
        range: range,
        tilt: tilt,
      },
      noControls: true,
    });

    //TODO parler a itowns remove listener of the resize
    this.view.debugResize = this.view.resize;
    this.view.resize = function () {
      //nada
    };

    //LYON WMS
    // const wmsImagerySource = new itowns.WMSSource({
    //   extent: extent,
    //   name: 'Ortho2018_Dalle_unique_8cm_CC46',
    //   url: 'https://download.data.grandlyon.com/wms/grandlyon',
    //   version: '1.3.0',
    //   projection: 'EPSG:3946',
    //   format: 'image/jpeg',
    // });
    // // Add a WMS imagery layer
    // const wmsImageryLayer = new itowns.ColorLayer('wms_imagery', {
    //   updateStrategy: {
    //     type: itowns.STRATEGY_DICHOTOMY,
    //     options: {},
    //   },
    //   source: wmsImagerySource,
    //   transparent: true,
    // });
    // this.view.addLayer(wmsImageryLayer);

    // Add a WMS elevation source
    const wmsElevationSource = new itowns.WMSSource({
      extent: extent,
      url: 'https://download.data.grandlyon.com/wms/grandlyon',
      name: 'MNT2018_Altitude_2m',
      projection: 'EPSG:3946',
      heightMapWidth: 256,
      format: 'image/jpeg',
    });
    // Add a WMS elevation layer
    const wmsElevationLayer = new itowns.ElevationLayer('wms_elevation', {
      useColorTextureElevation: true,
      colorTextureElevationMinZ: 144,
      colorTextureElevationMaxZ: 622,
      source: wmsElevationSource,
    });
    this.view.addLayer(wmsElevationLayer);
  }

  onResize() {
    const w = window.innerWidth - this.rootHtml.offsetLeft;
    const h = window.innerHeight - this.rootHtml.offsetTop;

    //TODO remove this fonction
    this.view.debugResize(w, h);
  }

  dispose() {
    this.view.dispose();
    this.inputManager.dispose();
    window.removeEventListener('resize', this.onResize.bind(this));
    this.rootHtml.remove();

    //flag to stop tick
    this.disposed = true;
  }

  load() {
    const _this = this;

    return new Promise((resolve, reject) => {
      if (!_this.isLocal) {
        resolve();
      } else {
        //load world
        if (!_this.world) throw new Error('no world');

        _this.world.load(function () {
          const state = _this.world.computeWorldState();
          _this.onFirstState(state);

          //add an avatar in it
          const avatar = _this.assetsManager.fetchPrefab('avatar');
          _this.avatarUUID = avatar.getUUID();
          const parent = _this.world.getGameObject();
          _this.world.addGameObject(avatar, _this.gameContext, parent, resolve);
        }, _this.gameContext);
      }
    });
  }

  getInputManager() {
    return this.inputManager;
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
