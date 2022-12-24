import { AssetManager } from '../Component/AssetManager/AssetManager';
import { InputManager } from '../Component/InputManager';
import { Planar } from '../Component/Frame3D/Frame3D';
import { Game } from '@ud-viz/core';
import { RequestAnimationFrameProcess } from '../Component/RequestAnimationFrameProcess';
import * as ExternalGame from '../Component/ExternalGame/ExternalGame';

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
    return new Promise((resolve) => {
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
        let previousGameState = gameContext.toState(false); // false because no need to send game component
        interpolator.onFirstState(previousGameState);

        // start process gameContext
        const gameProcess = new RequestAnimationFrameProcess(
          options.gameProcessFps
        );

        // create an input manager to plug it directly in game process
        /** @type {InputManager} */
        const inputManager = options.inputManager || new InputManager();
        inputManager.startListening(frame3DPlanar.html());

        gameProcess.start((dt) => {
          // game loop
          gameContext.onCommand(inputManager.computeCommands()); // pull commands
          gameContext.step(dt); // simulate

          // here we compute a diff with the last game state (we could just send a newState to the interpolator)
          // but this is to test multiplayer (isOutdated is used in diff forcing the update transform in external context)
          // isOutdated is also used to notify external script maybe we should use two boolean TODO_ISSUE
          const newState = gameContext.toState(false);
          const stateDiff = newState.sub(previousGameState);
          previousGameState = newState;

          // console.log(stateDiff);

          interpolator.onNewDiff(stateDiff); // send new diff of the game to interpolator
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
          // external game loop
          externalGameContext.step(dt, interpolator.computeCurrentStates()); // simulate
          frame3DPlanar.itownsView.notifyChange(frame3DPlanar.camera); // => to load 3DTiles
          frame3DPlanar
            .getRenderer()
            .render(frame3DPlanar.getScene(), frame3DPlanar.getCamera()); // render
        });

        // DEBUG PRINT
        inputManager.addKeyInput('p', 'keyup', () => {
          console.log('external game context ', externalGameContext);
          console.log('game context ', gameContext);
        });

        resolve();
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
