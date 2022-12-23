import { AssetManager } from '../Component/AssetManager/AssetManager';
import { InputManager } from '../Component/InputManager';
import { Planar } from '../Component/Frame3D/Frame3D';
import { Game } from '@ud-viz/core';
import { RequestAnimationFrameProcess } from '../Component/RequestAnimationFrameProcess';
const THREE = require('three');
const THREEUtil = require('../Component/THREEUtil');
// import * as Views from '../../Views/Views';
// import { Game } from '@ud-viz/core';
// import { BrowserContext } from '../../Game/BrowserContext.js';

/**
 * A Class contaning method to easily instanciate a browser game based on the ud-viz game engine
 */
export class SinglePlayerGamePlanar {
  /**
   *
   * @param {itowns.Extent} extent
   * @param {object} options
   * @param {object} options.frame3DPlanarConfig - create a typedef
   * @param {object} options.sceneConfig
   */
  constructor(extent, options = {}) {
    const frame3DPlanarConfig = options.frame3DPlanarConfig || {};

    /** @type {Planar} */
    this.frame3DPlanar = new Planar(extent, {
      hasItownsControls: false,
      coordinates: frame3DPlanarConfig['coordinates'],
      maxSubdivisionLevel: frame3DPlanarConfig['maxSubdivisionLevel'],
      heading: frame3DPlanarConfig['heading'],
      tilt: frame3DPlanarConfig['tilt'],
      range: frame3DPlanarConfig['range'],
      config3DTilesLayers: frame3DPlanarConfig['3D_tiles_layers'],
      configBaseMapLayer: frame3DPlanarConfig['base_map_layer'],
      configElevationLayer: frame3DPlanarConfig['elevation_layer'],
      configGeoJSONLayers: frame3DPlanarConfig['geoJSON_layers'],
    });

    if (options.sceneConfig) {
      // Init renderer
      THREEUtil.initRenderer(
        this.frame3DPlanar.getRenderer(),
        new THREE.Color(
          options.sceneConfig.sky.color.r,
          options.sceneConfig.sky.color.g,
          options.sceneConfig.sky.color.b
        )
      );

      // Add lights
      const { directionalLight } = THREEUtil.addLights(
        this.frame3DPlanar.getScene()
      );

      // Configure shadows based on a config files
      directionalLight.shadow.mapSize = new THREE.Vector2(
        options.sceneConfig.shadowMapSize,
        options.sceneConfig.shadowMapSize
      );
      directionalLight.castShadow = true;
      directionalLight.shadow.bias = -0.0005;

      if (options.sceneConfig.sky.paths) {
        THREEUtil.addCubeTexture(
          options.sceneConfig.sky.paths,
          this.frame3DPlanar.getScene()
        );
      }
    }
  }

  /**
   *
   * @param {object|JSON} gameObject3DJSON
   */
  start(gameObject3DJSON, options = {}) {
    return new Promise((resolve, reject) => {
      /** @type {AssetManager} */
      const assetManager = options.assetManager || new AssetManager();

      /** @type {InputManager} */
      const inputManager = options.inputManager || new InputManager();

      const gameScriptClass = options.gameScriptClass || [];
      const gameContext = new Game.Context(gameScriptClass, gameObject3DJSON);
      gameContext.load().then(() => {
        const interpolator = new Game.StateInterpolator(
          options.interpolatorDelay
        );
        // initialize interpolator
        interpolator.onFirstState(gameContext.toState(false)); // false because no need to send game component

        // start process gameContext
        const gameProcess = new RequestAnimationFrameProcess(
          options.gameProcessFps
        );
        gameProcess.start((dt) => {
          // game loop
          gameContext.onCommand(inputManager.computeCommands()); // pull commands
          gameContext.step(dt); // simulate
          interpolator.onNewState(gameContext.toState(false)); // send new state of the game to interpolator
        });
      });
    });
  }

  /**
   * Start a local game based on the world, the config and some options
   *
   * @param {World} world world to start
   * @param {string} configPath the path of the config file
   * @param {object} options
   * @returns
   */
  // start(world, configPath, options = {}) {
  //   const _this = this;

  //   return new Promise((resolve) => {
  //     Component.SystemUtils.File.loadJSON(configPath).then(function (config) {
  //       const assetsManager = new AssetsManager(
  //         options.worldScripts,
  //         options.browserScripts
  //       );
  //       assetsManager
  //         .loadFromConfig(
  //           config.assetsManager,
  //           options.htmlParent || document.body
  //         )
  //         .then(function () {
  //           _this
  //             .startWithAssetsLoaded(world, assetsManager, config, options)
  //             .then(resolve);
  //         });
  //     });
  //   });
  // }

  startWithAssetsLoaded(world, assetsManager, config, options = {}) {
    const worldStateComputer = new Game.WorldStateComputer(assetsManager, 60);

    worldStateComputer.start(world);

    // Smooth rendering with delay
    const interpolator = new Game.WorldStateInterpolator(
      config.worldStateInterpolator.renderDelay
    );

    // register computer into the interpolator
    interpolator.onFirstState(worldStateComputer.computeCurrentState(false));
    worldStateComputer.addAfterTickRequester(function () {
      interpolator.onNewState(worldStateComputer.computeCurrentState(false));
    });

    if (options.localScriptModules) console.error('no localscripts module');

    this.gameView = new Views.GameView({
      htmlParent: options.htmlParent || document.body,
      config: config,
      userData: options.userData,
    });

    // command from input manager are pull from worldstatecomputer
    worldStateComputer.addAfterTickRequester(() => {
      worldStateComputer.onCommands(
        this.gameView.getInputManager().computeCommands()
      );
    });

    // ref worldstate computer
    this.browserContext = new BrowserContext(assetsManager, interpolator, {
      worldStateComputer: worldStateComputer,
    });

    // Start gameview tick
    return this.gameView.start(this.browserContext);
  }
}
