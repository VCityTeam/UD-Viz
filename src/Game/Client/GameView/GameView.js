/** @format */

//UDV
// import { TilesManager } from '../../Utils/3DTiles/TilesManager';
// import { LayerManager } from '../../Utils/LayerManager/LayerManager';

import { InputManager } from '../InputManager';

const Data = require('../../Shared/Data');
const WorldState = require('../../Shared/WorldState');
const WorldStateDiff = require('../../Shared/WorldStateDiff');

const THREE = require('three');
import proj4 from 'proj4';
import * as itowns from 'itowns';

import './GameView.css';
import { Cameraman, Routine } from '../Cameraman';
import GameObject from '../../Shared/GameObject/GameObject';
import Command from '../../Shared/Command';

export class GameView {
  constructor(params) {
    //html
    this.rootHtml = document.createElement('div');
    this.rootHtml.id = 'viewerDiv'; //itowns
    window.addEventListener('resize', this.onResize.bind(this));

    //game running with  a server simulating world or local
    this.isLocal = params.isLocal;

    //conf
    this.config = params.config;

    //assets
    this.assetsManager = params.assetsManager;

    //inputs
    this.inputManager = new InputManager();

    //server
    this.webSocketService = params.webSocketService;

    //state renderer
    this.worldStateInterpolator = params.worldStateInterpolator;

    //object
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'GameViewObject3D';

    //buffer
    this.lastState = null;

    //camera
    this.cameraman = null;
    this.avatarUUID = null;

    //itowns view
    this.view = null;

    //controls
    this.itownsControls = null;

    //model only in Local
    this.world = null;
  }

  setWorld(world) {
    this.world = world;
  }

  getWorld() {
    return this.world;
  }

  html() {
    return this.rootHtml;
  }

  onFirstState(state, avatarUUID) {
    //build itowns view
    this.initItownsView(state);

    //cameraman
    this.cameraman = new Cameraman(this.view.camera.camera3D);
    this.avatarUUID = avatarUUID;

    this.initScene(state);
    this.initInputs(state);

    //register in mainloop
    if (this.isLocal) {
      this.view.addFrameRequester(
        itowns.MAIN_LOOP_EVENTS.UPDATE_END,
        this.updateViewLocal.bind(this)
      );
    } else {
      this.view.addFrameRequester(
        itowns.MAIN_LOOP_EVENTS.UPDATE_END,
        this.updateViewServer.bind(this)
      );

      //only send cmds to server when not local
      this.view.addFrameRequester(
        itowns.MAIN_LOOP_EVENTS.UPDATE_START,
        this.inputManager.sendCommandsToServer.bind(
          this.inputManager,
          this.webSocketService
        )
      );
    }

    //resize
    setTimeout(this.onResize.bind(this), 1000);
  }

  initScene(state) {
    
    const o = state.getOrigin();
    const [x, y] = proj4('EPSG:3946').forward([o.lng, o.lat]);
    this.object3D.position.x = x;
    this.object3D.position.y = y;
    this.object3D.position.z = o.alt;
    this.updateObject3D(state);
    this.view.scene.add(this.object3D);
    console.log(this.object3D)

    //shadow
    const renderer = this.view.mainLoop.gfxEngine.renderer;
    renderer.shadowMap.enabled = true;
    // to antialias the shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Set sky color to blue
    renderer.setClearColor(0x6699cc, 1);

    // Lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.shadow.mapSize = new THREE.Vector2(
      this.config.game.shadowMapSize,
      this.config.game.shadowMapSize
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0005;
    this.view.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.view.scene.add(ambientLight);

    //place directionnal lights
    const bb = new THREE.Box3().setFromObject(this.object3D);

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

    // const helper = new THREE.DirectionalLightHelper(directionalLight, 110);
    // helper.update();
    // this.view.scene.add(helper);

    //DEBUG
    this.light = directionalLight;
  }

  updateViewServer(dt) {
    //DEBUG
    window.UDVDebugger.displayShadowMap(
      this.light,
      this.view.mainLoop.gfxEngine.renderer
    );

    //TODO itowns BUG
    if (isNaN(dt)) dt = 0;

    const currentState = this.worldStateInterpolator.getCurrentState();
    if (currentState) {
      this.updateObject3D(currentState);
    }
    this.cameraman.setObstacle(this.object3D);
    this.cameraman.tick(dt, currentState, this.avatarUUID);

    //TODO do not notify everytime ?
    this.view.notifyChange();
  }

  updateViewLocal(dt) {
    //TODO itowns BUG
    if (isNaN(dt)) dt = 0;

    //DEBUG
    // window.UDVDebugger.displayShadowMap(
    //   this.light,
    //   this.view.mainLoop.gfxEngine.renderer
    // );

    //tick world
    const commands = this.inputManager.computeCommands();
    const avatarUUID = this.avatarUUID;
    commands.forEach(function (cmd) {
      cmd.setAvatarID(avatarUUID);
    });
    this.world.tick(commands, dt);
    const state = this.world.computeWorldState();
    this.updateObject3D(state);

    this.cameraman.setObstacle(this.object3D);
    this.cameraman.tick(dt, state, this.avatarUUID);

    //TODO do not notify everytime ?
    this.view.notifyChange();
  }

  updateObject3D(state) {
    const stateGO = state.getGameObject();
    if (!stateGO) throw new Error('no gameObject in state');

    if (this.lastState) {
      let lastGO = this.lastState.getGameObject();
      lastGO.traverse(function (g) {
        const current = stateGO.find(g.getUUID());
        if (current) {
          //still exist update only the transform
          g.setTransform(current.getTransform());
        } else {
          //do not exist remove it
          g.removeFromParent();
        }
      });
      stateGO.traverse(function (g) {
        const old = lastGO.find(g.getUUID());
        if (!old) {
          //new one add it
          const parent = lastGO.find(g.getParentUUID());
          parent.addChild(g);
        }
      });

      state.setGameObject(lastGO); //update GO
    }

    const obj = state.getGameObject().computeObject3D(this.assetsManager);
    if (!obj) throw new Error('no object3D');
    this.object3D.children.length = 0;
    this.object3D.add(obj);
    this.object3D.updateMatrixWorld(true);
    //buffer
    this.lastState = state;
  }

  initItownsView(state) {
    // Define EPSG:3946 projection which is the projection used in the 3D view
    // (planarView of iTowns). It is indeed needed
    // to convert the coordinates received from the world server
    // to this coordinate system.
    proj4.defs(
      'EPSG:3946',
      '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
        ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );
    const o = state.getOrigin();
    const [x, y] = proj4('EPSG:3946').forward([o.lng, o.lat]);
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

    //DEBUG
    return;

    //  ADD 3D Tiles Layer
    let layerConfig = 'building';
    // Positional arguments verification
    if (
      !this.config['3DTilesLayer'][layerConfig] ||
      !this.config['3DTilesLayer'][layerConfig]['id'] ||
      !this.config['3DTilesLayer'][layerConfig]['url']
    ) {
      throw new Error('config wrong');
    }

    const extensionsConfig = this.config['3DTilesLayer'][layerConfig][
      'extensions'
    ];
    const extensions = new itowns.C3DTExtensions();
    if (!!extensionsConfig) {
      for (let i = 0; i < extensionsConfig.length; i++) {
        if (extensionsConfig[i] === '3DTILES_temporal') {
          extensions.registerExtension('3DTILES_temporal', {
            [itowns.C3DTilesTypes.batchtable]: $3DTemporalBatchTable,
            [itowns.C3DTilesTypes.boundingVolume]: $3DTemporalBoundingVolume,
            [itowns.C3DTilesTypes.tileset]: $3DTemporalTileset,
          });
        } else if (extensionsConfig[i] === '3DTILES_batch_table_hierarchy') {
          extensions.registerExtension('3DTILES_batch_table_hierarchy', {
            [itowns.C3DTilesTypes.batchtable]:
              itowns.C3DTBatchTableHierarchyExtension,
          });
        } else {
          console.warn(
            'The 3D Tiles extension ' +
              extensionsConfig[i] +
              ' specified in generalDemoConfig.json is not supported ' +
              'by UD-Viz yet. Only 3DTILES_temporal and ' +
              '3DTILES_batch_table_hierarchy are supported.'
          );
        }
      }
    }

    const $3dTilesLayer = new itowns.C3DTilesLayer(
      this.config['3DTilesLayer'][layerConfig]['id'],
      {
        name: 'Lyon-2015-'.concat(layerConfig),
        source: new itowns.C3DTilesSource({
          url: this.config['3DTilesLayer'][layerConfig]['url'],
        }),
        registeredExtensions: extensions,
      },
      this.view
    );

    let material;
    if (this.config['3DTilesLayer'][layerConfig]['pc_size']) {
      material = new THREE.PointsMaterial({
        size: this.config['3DTilesLayer'][layerConfig]['pc_size'],
        vertexColors: true,
      });
    } else if (!this.config['3DTilesLayer'][layerConfig]['color']) {
      material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    } else {
      material = new THREE.MeshLambertMaterial({
        color: parseInt(this.config['3DTilesLayer'][layerConfig]['color']),
      });
    }

    $3dTilesLayer.overrideMaterials = material;
    $3dTilesLayer.material = material;

    const $3DTilesManager = new TilesManager(this.view, $3dTilesLayer);
    new LayerManager(this.view).tilesManagers.push($3DTilesManager);
    const [$a] = [$3dTilesLayer, $3DTilesManager];

    itowns.View.prototype.addLayer.call(this.view, $a);
  }

  initInputs(state) {
    //TODO réfléchir ou mettre ce code
    const canvasGame = this.rootHtml;
    const camera = this.view.camera.camera3D;
    const _this = this;
    const manager = this.inputManager;

    canvasGame.requestPointerLock =
      canvasGame.requestPointerLock || canvasGame.mozRequestPointerLock;
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
          canvasGame.requestPointerLock();
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
      if (_this.itownsControls) {
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
              _this.itownsControls = null;
              _this.cameraman.setFilmingTarget(true);
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

              _this.itownsControls = new itowns.PlanarControls(_this.view, {
                handleCollision: false,
              });

              _this.cameraman.setFilmingTarget(false);
            }
          )
        );
      }
    });

    //COMMANDS WORLD

    //FORWARD
    manager.addKeyCommand(
      Command.TYPE.MOVE_FORWARD,
      ['z', 'ArrowUp'],
      function () {
        swicthMode(MODE.POINTER_LOCK);
        if (manager.isAltKey()) {
          console.log('RUNNN');
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

    //DEBUG
    const debugMesh = this.assetsManager.fetch('sphere');
    debugMesh.scale.copy(new THREE.Vector3(0.2, 0.2, 0.2));

    //disbale right click context menu
    canvasGame.oncontextmenu = function (e) {
      e.preventDefault();
      e.stopPropagation();
    };

    const firstGO = state.getGameObject();
    manager.addMouseCommand('mousedown', function () {
      const event = this.event('mousedown');
      swicthMode(MODE.DEFAULT);
      if (event.which != 3) return; //if its not a right click

      //map is the root object
      const mapObject = firstGO.getObject3D();
      if (!mapObject) throw new Error('no map object');

      //DEBUG
      if (!mapObject.children.includes(debugMesh)) mapObject.add(debugMesh);

      //1. sets the mouse position with a coordinate system where the center
      //   of the screen is the origin
      const mouse = new THREE.Vector2(
        -1 +
          (2 * event.offsetX) /
            (canvasGame.clientWidth - canvasGame.offsetLeft),
        1 -
          (2 * event.offsetY) / (canvasGame.clientHeight - canvasGame.offsetTop)
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
        debugMesh.position.copy(p.clone());

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
    manager.startListening(canvasGame);
  }

  onResize() {
    const w = window.innerWidth - this.rootHtml.offsetLeft;
    const h = window.innerHeight - this.rootHtml.offsetTop;

    //TODO remove this fonction
    this.view.debugResize(w, h);
  }

  dispose() {
    this.inputManager.dispose();
    window.removeEventListener('resize', this.onResize.bind(this));
    this.rootHtml.parentElement.removeChild(this.rootHtml);
  }

  load() {
    const _this = this;

    return new Promise((resolve, reject) => {
      if (!_this.isLocal) {
        //wait to be notify by server
        if (!_this.webSocketService) throw new Error('no websocket service');

        //communication server
        _this.webSocketService.connectToServer();

        // Register callbacks
        _this.webSocketService.on(
          Data.WEBSOCKET.MSG_TYPES.JOIN_SERVER,
          (firstStateJSON) => {
            if (!firstStateJSON) throw new Error('no data');

            console.log('FIRST JSON', firstStateJSON);

            const state = new WorldState(firstStateJSON.state);
            _this.worldStateInterpolator.onFirstState(state);
            _this.onFirstState(state, firstStateJSON.avatarID);
          }
        );

        let firstDiff = true;
        _this.webSocketService.on(
          Data.WEBSOCKET.MSG_TYPES.WORLDSTATE_DIFF,
          (diffJSON) => {
            if (firstDiff) {
              firstDiff = false;
              console.log('FIRST DIFF ', diffJSON);
            }

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
          const avatar = new GameObject(Data.createAvatarJSON());
          _this.world.addGameObject(avatar);

          const state = _this.world.computeWorldState();
          _this.onFirstState(state, avatar.getUUID());

          resolve();
        });
      }
    });
  }
}
