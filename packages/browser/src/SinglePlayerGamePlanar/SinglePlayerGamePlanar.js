import { AssetManager } from '../Component/AssetManager/AssetManager';
import { InputManager } from '../Component/InputManager';
import { Frame3DPlanar } from '../Component/Frame3D/Frame3D';
import { Game } from '@ud-viz/core';
import { RequestAnimationFrameProcess } from '../Component/RequestAnimationFrameProcess';
import * as ExternalGame from '../Component/ExternalGame/ExternalGame';

import { Extent } from 'itowns';
import { ExternalScriptBase } from '../Component/ExternalGame/Context';

/**
 * @classdesc A Class contaning method to easily instanciate a browser game based on the ud-viz game engine
 */
export class SinglePlayerGamePlanar {
  constructor() {
    /** @type {Frame3DPlanar} */
    this.frame3DPlanar = null;
  }

  /**
   * @param {Extent} extent - Geographical bounding rectangle. {@link http://www.itowns-project.org/itowns/docs/#api/Geographic/Extent Extent}
   * @param {Game.Object3D} gameObject3D - Game object used to create the {@link Game.Context}
   * @param {object} options - options
   * @param {AssetManager} [options.assetManager] - {@link AssetManager}
   * @param {Object<string, ExternalScriptBase>} [options.externalGameScriptClass] - Class that can be reference by {@link GameScript} of an object3D
   * @param {Frame3DPlanar} [options.frame3DPlanar] - {@link Frame3DPlanar}
   * @param {Object<string, Game.ScriptBase>} [options.gameScriptClass] - Class that can be reference by {@link GameScript} of an object3D
   * @param {number} [options.gameProcessFps] - Frame per second
   * @param {InputManager} [options.inputManager] - {@link InputManager}
   * @param {number} [options.interpolatorDelay] - Delay between state received and state computed
   * @param {object} [options.sceneConfig] - config of the scene give at the instanciation of External.Context
   * @returns {Promise} start promise
   */
  start(extent, gameObject3D, options = {}) {
    return new Promise((resolve) => {
      // initialize planar
      /** @type {Frame3DPlanar} */
      this.frame3DPlanar =
        options.frame3DPlanar ||
        new Frame3DPlanar(extent, { hasItownsControls: false });

      // init game process
      const gameScriptClass = options.gameScriptClass || {};
      const gameContext = new Game.Context(gameScriptClass, gameObject3D);
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
        inputManager.startListening(this.frame3DPlanar.html());

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
          this.frame3DPlanar,
          assetManager,
          inputManager,
          externalGameScriptClass,
          { sceneConfig: options.sceneConfig }
        );

        // indicate to the external context how to send command to gamecontext (could be with websocket)
        externalGameContext.sendCommandToGameContext = (cmds) => {
          gameContext.onCommand(cmds);
        };

        // position of the external game context object extent center
        const center = extent.center();
        externalGameContext.object3D.position.set(center.x, center.y, 300); // TODO 300 is HARD CODED
        externalGameContext.object3D.updateMatrixWorld();

        // step external game context

        // METHOD 1 ITOWNS MAIN LOOP NO SMOOTH RENDERING NO CONTROL DT

        // this.frame3DPlanar.itownsView.addFrameRequester(
        //   itowns.MAIN_LOOP_EVENTS.UPDATE_START,
        //   (dt) => {
        //     externalGameContext.step(dt, interpolator.computeCurrentStates());
        //   }
        // );

        // METHOD 2 REQUESTANIMATIONFRAME
        this.frame3DPlanar.enableItownsViewRendering(false);
        const process = new RequestAnimationFrameProcess(30);
        process.start((dt) => {
          // external game loop
          externalGameContext.step(dt, interpolator.computeCurrentStates()); // simulate
          this.frame3DPlanar.itownsView.notifyChange(this.frame3DPlanar.camera); // => to load 3DTiles
          this.frame3DPlanar.render();
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
}
