/** @format */

//UDV
// import { TilesManager } from '../../Utils/3DTiles/TilesManager';
// import { LayerManager } from '../../Utils/LayerManager/LayerManager';
import { AssetsManager } from '../Components/AssetsManager';
import { InputManager } from '../Components/InputManager';
import { Cameraman, Routine } from '../Components/Cameraman';

import { THREEUtils } from '../Components/THREEUtils';

import * as THREE from 'three';
import * as proj4 from 'proj4';
import * as itowns from 'itowns';

import './GameView.css';
import LocalScript from '../Shared/GameObject/Components/LocalScript';
import Render from '../Shared/GameObject/Components/Render';

const udvShared = require('../Shared/Shared');
const Command = udvShared.Command;
const Data = udvShared.Components.Data;
const WorldState = udvShared.WorldState;
const WorldStateDiff = udvShared.WorldStateDiff;

//DEBUG
let id = 0;

export class GameView {
  constructor(params) {
    this.id = id;
    id++;

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
    this.assetsManager = params.assetsManager || new AssetsManager();

    //inputs
    this.inputManager = new InputManager();

    //server
    this.webSocketService = params.webSocketService;

    //state renderer
    this.worldStateInterpolator = params.worldStateInterpolator;

    //object
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'GameView_Object3D';
    this.obstacle = new THREE.Object3D();
    this.obstacle.name = 'GameView_Obstacle';
    this.pointerMouseObject = this.assetsManager.createModel('pointer_mouse');
    this.pointerMouseObject.name = 'GameView_PointerMouse';

    this.fogObject = null;

    //register last pass
    this.lastState = null;

    //flag
    this.disposed = false;

    //camera
    this.cameraman = null;
    this.avatarUUID = null;

    //itowns view
    this.view = null;

    //controls
    this.itownsControls = null;

    //model only in Local
    this.world = null;

    //to pass gameobject world script (only local)
    this.gameContext = {
      assetsManager: this.assetsManager,
      dt: 0,
      commands: null,
      world: null,
      UDVShared: udvShared,
    };

    //to pass local script
    this.localContext = {
      assetsManager: this.assetsManager,
      inputManager: this.inputManager,
      dt: 0,
      UDVShared: udvShared,
    };

    //ref uuid of go in the last state
    this.currentUUID = {};

    this.pause = false;
  }

  setPause(value) {
    this.pause = value;
  }

  appendToUI(el) {
    this.ui.appendChild(el);
  }

  setWorld(world) {
    this.world = world;
    if (!world) return;
    this.gameContext.world = world;

    //reload world
  }

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

  setOnFirstStateEnd(f) {
    this.onFirstStateEnd = f;
  }

  onFirstState(state) {
    //build itowns view
    this.initItownsView(state);
    this.initScene(state);
    this.initInputs(state);
    this.initUI();

    this.cameraman = new Cameraman(this.view.camera.camera3D);

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

        now = Date.now();
        delta = now - then;

        if (delta > 1000 / fps) {
          // update time stuffs
          then = now - (delta % 1000) / fps;
          if (_this.pause) return;
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

        now = Date.now();
        delta = now - then;

        if (delta > 1000 / fps) {
          // update time stuffs
          then = now - (delta % 1000) / fps;

          if (_this.pause) return;
          _this.updateViewServer(delta);
        }
      };
      tick();
    }

    if (this.onFirstStateEnd) this.onFirstStateEnd();

    //resize
    setTimeout(this.onResize.bind(this), 1000);
  }

  getCameraman() {
    return this.cameraman;
  }

  setFog(value) {
    if (value) {
      this.view.scene.fog = this.fogObject;
    } else {
      this.view.scene.fog = null;
    }
  }

  initScene(state) {
    const o = state.getOrigin();
    const [x, y] = proj4.default('EPSG:3946').forward([o.lng, o.lat]);

    this.object3D.position.x = x;
    this.object3D.position.y = y;
    this.object3D.position.z = o.alt;
    this.view.scene.add(this.object3D);

    this.obstacle.position.x = x;
    this.obstacle.position.y = y;
    this.obstacle.position.z = o.alt;
    // this.view.scene.add(this.obstacle);

    //fog
    const skyColor = new THREE.Color(
      this.config.game.skyColor.r,
      this.config.game.skyColor.g,
      this.config.game.skyColor.b
    );
    this.fogObject = new THREE.Fog(
      skyColor,
      this.config.game.fog.near,
      this.config.game.fog.far
    );

    //shadow
    const renderer = this.view.mainLoop.gfxEngine.renderer;
    THREEUtils.initRenderer(renderer, skyColor);

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

  placeLight() {
    const bb = new THREE.Box3().setFromObject(this.object3D);
    const directionalLight = this.directionalLight;

    //place directionnal lights
    const centerOffset = bb.getCenter(new THREE.Vector3());

    directionalLight.target.position.copy(centerOffset);
    directionalLight.target.updateMatrixWorld();

    directionalLight.position.copy(directionalLight.target.position);
    const distlight = 250;
    directionalLight.position.add(
      new THREE.Vector3(distlight, distlight, 2 * distlight)
    );
    directionalLight.updateMatrixWorld();

    const cameraShadow = directionalLight.shadow.camera;
    cameraShadow.near = 1;
    cameraShadow.far = 1000;
    cameraShadow.top = 80;
    cameraShadow.right = 95;
    cameraShadow.left = -100;
    cameraShadow.bottom = -90;
    cameraShadow.updateProjectionMatrix();
  }

  updateViewServer(dt) {
    //TODO itowns BUG
    if (!isNaN(dt)) {
      this.gameContext.dt = dt;
      this.localContext.dt = dt;
    }

    //send cmd
    this.inputManager.sendCommandsToServer(this.webSocketService);

    this.update(this.worldStateInterpolator.getCurrentState());
  }

  updateViewLocal(dt) {
    //TODO itowns BUG
    if (!isNaN(dt)) {
      this.gameContext.dt = dt;
      this.localContext.dt = dt;
    }

    //DEBUG
    // window.UDVDebugger.displayShadowMap(
    //   this.directionalLight,
    //   this.view.mainLoop.gfxEngine.renderer
    // );

    //tick world
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
          //still exist update only the transform
          g.setTransform(current.getTransform());
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

    newGO.forEach(function (g) {
      console.log('New GO => ', g.name);
      _this.currentUUID[g.getUUID()] = true;

      //build render component
      if (!_this.isLocal)
        g.initAssetsComponents(_this.assetsManager, udvShared);

      g.traverse(function (child) {
        const scriptComponent = child.getComponent(LocalScript.TYPE);
        if (scriptComponent)
          scriptComponent.execute(LocalScript.EVENT.INIT, [ctx]);
      });

      //add static object to obstacle
      if (g.isStatic()) {
        //register in obstacle
        const r = g.getComponent(Render.TYPE);
        if (r) {
          const clone = r.getOriginalObject3D().clone();

          const wT = g.computeWorldTransform();

          clone.position.x = wT.position.x;
          clone.position.y = wT.position.y;
          clone.position.z = wT.position.z;

          clone.rotation.x = wT.rotation.x;
          clone.rotation.y = wT.rotation.y;
          clone.rotation.z = wT.rotation.z;

          clone.scale.x = wT.scale.x;
          clone.scale.y = wT.scale.y;
          clone.scale.z = wT.scale.z;

          _this.obstacle.add(clone);
          _this.obstacle.updateMatrixWorld();
        }
      }
    });

    const go = state.getGameObject();

    //tick local script
    go.traverse(function (child) {
      const scriptComponent = child.getComponent(LocalScript.TYPE);
      if (scriptComponent)
        scriptComponent.execute(LocalScript.EVENT.TICK, [ctx]);
    });

    //rebuild object
    this.object3D.children.length = 0;
    this.object3D.add(this.pointerMouseObject);
    this.object3D.add(go.fetchObject3D());
    this.object3D.updateMatrixWorld();

    this.cameraman.tick(
      this.gameContext.dt,
      state,
      this.avatarUUID,
      this.obstacle
    );

    //render
    const scene = this.view.scene;
    const renderer = this.view.mainLoop.gfxEngine.renderer;
    renderer.clearColor();
    renderer.render(scene, this.cameraman.getCamera());

    //TODO ne pas lancer des rendu si itowns vient d'en faire un

    //update ui
    this.fpsLabel.innerHTML = 'FPS = ' + Math.round(1000 / this.gameContext.dt);
    let avatarCount = 0;
    go.traverse(function (g) {
      if (g.name == 'avatar') avatarCount++;
    });
    this.avatarCount.innerHTML = 'Player: ' + avatarCount;

    //update shadow
    if (newGO.length) this.placeLight();

    //buffer
    this.lastState = state;
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
    const wmsImagerySource = new itowns.WMSSource({
      extent: extent,
      name: 'Ortho2018_Dalle_unique_8cm_CC46',
      url: 'https://download.data.grandlyon.com/wms/grandlyon',
      version: '1.3.0',
      projection: 'EPSG:3946',
      format: 'image/jpeg',
    });
    // Add a WMS imagery layer
    const wmsImageryLayer = new itowns.ColorLayer('wms_imagery', {
      updateStrategy: {
        type: itowns.STRATEGY_DICHOTOMY,
        options: {},
      },
      source: wmsImagerySource,
      transparent: true,
    });
    this.view.addLayer(wmsImageryLayer);

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

  initInputs(state) {
    //TODO réfléchir ou mettre ce code faire des scripts dans les gameobject qui tourne coté client
    const viewerDiv = this.rootHtml;
    const camera = this.view.camera.camera3D;
    const _this = this;
    const manager = this.inputManager;

    viewerDiv.requestPointerLock =
      viewerDiv.requestPointerLock || viewerDiv.mozRequestPointerLock;
    document.exitPointerLock =
      document.exitPointerLock || document.mozExitPointerLock;

    const MODE = {
      DEFAULT: 0,
      POINTER_LOCK: 1,
    };
    let currentMode = MODE.DEFAULT;
    const swicthMode = function (newMode) {
      currentMode = newMode;

      switch (currentMode) {
        case MODE.DEFAULT:
          document.exitPointerLock();
          break;
        case MODE.POINTER_LOCK:
          viewerDiv.requestPointerLock();
          break;

        default:
          break;
      }
    };

    //INPUTS LOCAL

    //SWITCH CONTROLS
    manager.addKeyInput('a', 'keydown', function () {
      if (_this.cameraman.hasRoutine()) return; //already routine

      const speed = 0.6;
      if (_this.view.controls) {
        _this.cameraman.addRoutine(
          new Routine(
            function (dt) {
              const t = _this.cameraman.computeTransformTarget();
              const camera = _this.cameraman.getCamera();
              const amount = speed * dt;
              const dist = t.position.distanceTo(camera.position);
              let ratio = amount / dist;
              ratio = Math.min(Math.max(0, ratio), 1);
              camera.position.lerp(t.position, ratio);
              camera.quaternion.slerp(t.quaternion, ratio);
              camera.updateProjectionMatrix();

              return ratio >= 1;
            },
            function () {
              _this.view.controls.dispose();
              _this.view.controls = null;
              _this.cameraman.setFilmingTarget(true);
              _this.setFog(true);
            }
          )
        );
      } else {
        const currentPosition = new THREE.Vector3().copy(
          _this.cameraman.getCamera().position
        );
        //TODO valeur en dur
        const endPosition = new THREE.Vector3(0, 0, 200).add(currentPosition); //envoie la camera 200 metre plus haut
        const endQuaternion = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(Math.PI / 5, 0, 0)
        );

        _this.setFog(false);

        _this.cameraman.addRoutine(
          new Routine(
            function (dt) {
              const camera = _this.cameraman.getCamera();
              const amount = speed * dt;
              const dist = endPosition.distanceTo(camera.position);
              let ratio = amount / dist;
              ratio = Math.min(Math.max(0, ratio), 1);
              camera.position.lerp(endPosition, ratio);
              camera.quaternion.slerp(endQuaternion, ratio);
              camera.updateProjectionMatrix();

              return ratio >= 1;
            },
            function () {
              swicthMode(MODE.DEFAULT);

              //creating controls like put it in _this.view.controls
              const c = new itowns.PlanarControls(_this.view, {
                handleCollision: false,
                focusOnMouseOver: false, //TODO itowns bug not working
                focusOnMouseClick: false,
              });

              _this.cameraman.setFilmingTarget(false);
            }
          )
        );
      }
    });

    //COMMANDS WORLD

    //FORWARD
    manager.listenKeys(['c']);
    manager.addKeyCommand(
      Command.TYPE.MOVE_FORWARD,
      ['z', 'ArrowUp'],
      function () {
        swicthMode(MODE.POINTER_LOCK);
        if (manager.isPressed('c')) {
          return new Command({ type: Command.TYPE.RUN });
        } else {
          return new Command({ type: Command.TYPE.MOVE_FORWARD });
        }
      }
    );

    //BACKWARD
    manager.addKeyCommand(
      Command.TYPE.MOVE_BACKWARD,
      ['s', 'ArrowDown'],
      function () {
        swicthMode(MODE.POINTER_LOCK);
        return new Command({ type: Command.TYPE.MOVE_BACKWARD });
      }
    );

    //LEFT
    manager.addKeyCommand(
      Command.TYPE.MOVE_LEFT,
      ['q', 'ArrowLeft'],
      function () {
        swicthMode(MODE.POINTER_LOCK);
        return new Command({ type: Command.TYPE.MOVE_LEFT });
      }
    );

    //RIGHT
    manager.addKeyCommand(
      Command.TYPE.MOVE_RIGHT,
      ['d', 'ArrowRight'],
      function () {
        swicthMode(MODE.POINTER_LOCK);
        return new Command({ type: Command.TYPE.MOVE_RIGHT });
      }
    );

    //MOVE ON MOUSEDOWN

    //disbale right click context menu
    viewerDiv.oncontextmenu = function (e) {
      e.preventDefault();
      e.stopPropagation();
    };

    manager.addMouseCommand('mousedown', function () {
      const event = this.event('mousedown');
      swicthMode(MODE.DEFAULT);
      if (event.which != 3) return; //if its not a right click

      //map is the root object
      const mapObject = _this.obstacle;
      if (!mapObject) throw new Error('no map object');

      //1. sets the mouse position with a coordinate system where the center
      //   of the screen is the origin
      const mouse = new THREE.Vector2(
        -1 +
          (2 * event.offsetX) / (viewerDiv.clientWidth - viewerDiv.offsetLeft),
        1 - (2 * event.offsetY) / (viewerDiv.clientHeight - viewerDiv.offsetTop)
      );

      //2. set the picking ray from the camera position and mouse coordinates
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      //3. compute intersections
      //TODO opti en enlevant la recursive et en selectionnant seulement les bon object3D

      const intersects = raycaster.intersectObject(mapObject, true);

      if (intersects.length) {
        let minDist = Infinity;
        let p = null;

        intersects.forEach(function (i) {
          if (i.distance < minDist) {
            p = i.point;
            minDist = i.distance;
          }
        });

        //transform p map referentiel
        const bb = new THREE.Box3().setFromObject(mapObject);
        p.sub(bb.min);

        //DEBUG
        console.log(p);

        _this.pointerMouseObject.position.copy(p.clone());
        _this.pointerMouseObject.updateMatrixWorld();

        return new Command({
          type: Command.TYPE.MOVE_TO,
          data: { target: new THREE.Vector2(p.x, p.y) },
        });
      } else {
        return null;
      }
    });

    //ROTATE
    manager.addMouseCommand('mousemove', function () {
      if (
        currentMode == MODE.POINTER_LOCK ||
        (this.isDragging() && currentMode == MODE.DEFAULT)
      ) {
        const event = this.event('mousemove');
        if (event.movementX != 0 || event.movementY != 0) {
          let pixelX = -event.movementX;
          let pixelY = -event.movementY;

          if (this.isDragging()) {
            const dragRatio = 2; //TODO conf ?
            pixelX *= dragRatio;
            pixelY *= dragRatio;
          }

          return new Command({
            type: Command.TYPE.ROTATE,
            data: {
              vector: new THREE.Vector3(pixelY, 0, pixelX),
            },
          });
        }
      }
      return null;
    });

    //start
    manager.startListening(viewerDiv);
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

    if (this.webSocketService) this.webSocketService.reset();

    //flag to stop tick
    this.disposed = true;
  }

  load() {
    const _this = this;

    return new Promise((resolve, reject) => {
      if (!_this.isLocal) {
        //wait to be notify by server
        if (!_this.webSocketService) throw new Error('no websocket service');

        // Register callbacks
        _this.webSocketService.on(
          Data.WEBSOCKET.MSG_TYPES.JOIN_WORLD,
          (firstStateJSON) => {
            if (!firstStateJSON) throw new Error('no data');
            console.log('JOIN_WORLD ', _this.id, firstStateJSON);

            if (!_this.view) {
              //view was not intialized do it
              const state = new WorldState(firstStateJSON.state);
              _this.worldStateInterpolator.onFirstState(state);
              _this.onFirstState(state);
              _this.avatarUUID = firstStateJSON.avatarID;
            } else {
              //TODO maybe do this in parent and not here

              //this need to be disposed
              _this.dispose();

              //create new one
              const gameView = new GameView({
                isLocal: false,
                assetsManager: _this.assetsManager,
                webSocketService: _this.webSocketService,
                worldStateInterpolator: _this.worldStateInterpolator,
                config: _this.config,
              });

              //load then notify join world
              gameView.load().then(function () {
                console.log('JOIN_WORLD ', gameView.id, firstStateJSON);

                const state = new WorldState(firstStateJSON.state);
                gameView.worldStateInterpolator.onFirstState(state);
                gameView.onFirstState(state);
                gameView.avatarUUID = firstStateJSON.avatarID;
              });
            }
          }
        );

        _this.webSocketService.on(
          Data.WEBSOCKET.MSG_TYPES.WORLDSTATE_DIFF,
          (diffJSON) => {
            // console.log(_this.id, ' diff');

            _this.worldStateInterpolator.onNewDiff(
              new WorldStateDiff(diffJSON)
            );
          }
        );

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
}
