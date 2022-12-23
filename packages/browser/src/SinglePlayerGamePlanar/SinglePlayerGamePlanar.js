import { AssetManager } from '../Component/AssetManager/AssetManager';
import { InputManager } from '../Component/InputManager';
import { Planar } from '../Component/Frame3D/Frame3D';
import { Game } from '@ud-viz/core';
import { RequestAnimationFrameProcess } from '../Component/RequestAnimationFrameProcess';
const THREE = require('three');
const itowns = require('itowns');
const THREEUtil = require('../Component/THREEUtil');
import * as ExternalGame from '../Component/ExternalGame/ExternalGame';

//DEBUG
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * A Class contaning method to easily instanciate a browser game based on the ud-viz game engine
 */
export class SinglePlayerGamePlanar {
  constructor() {
    // nothing for now
  }

  /**
   *
   * @param {*} extent
   * @param {*} gameObject3DJSON
   * @param {*} options
   * @param {InputManager} options.inputManager
   * @returns
   */
  start(extent, gameObject3DJSON, options = {}) {
    return new Promise((resolve, reject) => {
      // initialize planar
      const frame3DPlanarConfig = options.frame3DPlanarConfig || {};

      /** @type {Planar} */
      const frame3DPlanar = new Planar(extent, {
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

      // init game process
      const gameScriptClass = options.gameScriptClass || {};
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

        // create an input manager to plug it directly in game process
        /** @type {InputManager} */
        const inputManager = options.inputManager || new InputManager();

        gameProcess.start((dt) => {
          // game loop
          gameContext.onCommand(inputManager.computeCommands()); // pull commands
          gameContext.step(dt); // simulate
          interpolator.onNewState(gameContext.toState(false)); // send new state of the game to interpolator
        });

        // init external game context

        /** @type {AssetManager} */
        const assetManager = options.assetManager || new AssetManager();
        const externalGameScriptClass = options.externalGameScriptClass || {};

        const externalGameContext = new ExternalGame.Context(
          frame3DPlanar,
          assetManager,
          inputManager,
          externalGameScriptClass,
          { sceneConfig: options.sceneConfig }
        );

        // position of the external game context object extent center
        const center = extent.center();
        externalGameContext.object3D.position.set(center.x, center.y, 300); // TODO 300 is HARD CODED

        // step external game context

        // DEBUG THREE CONTROLLER
        // const elementToListen =
        //   frame3DPlanar.itownsView.mainLoop.gfxEngine.label2dRenderer
        //     .domElement;
        // const orbitControls = new OrbitControls(
        //   frame3DPlanar.camera,
        //   elementToListen
        // );
        // orbitControls.target.copy(externalGameContext.object3D.position);

        const s = assetManager.createRenderData('cube').getObject3D();
        s.scale.set(100, 100, 100);
        externalGameContext.object3D.add(s);

        // METHOD 1 ITOWNS MAIN LOOP BAD RENDERING NO CONTROL DT

        // frame3DPlanar.itownsView.addFrameRequester(
        //   itowns.MAIN_LOOP_EVENTS.UPDATE_START,
        //   (dt) => {
        //     externalGameContext.step(dt, interpolator.computeCurrentStates());
        //   }
        // );

        // METHOD 2 REQUESTANIMATIONFRAME
        frame3DPlanar.enableItownsViewRendering(false);
        const process = new RequestAnimationFrameProcess(30);
        process.start((dt) => {
          externalGameContext.step(dt, interpolator.computeCurrentStates());
          // orbitControls.update();
          frame3DPlanar.itownsView.notifyChange(frame3DPlanar.camera);
          frame3DPlanar
            .getRenderer()
            .render(frame3DPlanar.getScene(), frame3DPlanar.getCamera());
        });

        // DEBUG PRINT
        inputManager.addKeyInput('p', 'keyup', () => {
          console.log('external game context ', externalGameContext);
          console.log('game context ', gameContext);
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
