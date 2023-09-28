import { AssetManager } from './AssetManager';
import { InputManager } from './InputManager';
import {
  ScriptBase as ExternalScriptBase,
  Context as ExternalContext,
} from './Context';

import { Planar } from '@ud-viz/frame3d';
import {
  Object3D,
  ScriptBase,
  StateInterpolator,
  Context,
} from '@ud-viz/game_shared';
import { RequestAnimationFrameProcess } from '@ud-viz/utils_browser';

/**
 * @classdesc Create a single player game in a {@link Planar}
 */
export class SinglePlanarProcess {
  /**
   *
   * @param {Object3D} gameObject3D - root game object3D of your game
   * @param {Planar} frame3DPlanar - frame3DPlanar where the game is taking place
   * @param {AssetManager} [assetManager] - assetManager of the game {@link AssetManager}
   * @param {InputManager} [inputManager] - input manager of the game {@link InputManager}
   * @param {object} options - single player game planar options
   * @param {Object<string,ScriptBase>=} options.gameScriptClass - custom game scripts class of your object3D
   * @param {Object<string,ExternalScriptBase>=} options.externalGameScriptClass - custom external scripts class of your object3D
   * @param {number=} options.interpolatorDelay - delay between state computed in game process and the ones in external context
   */
  constructor(
    gameObject3D,
    frame3DPlanar,
    assetManager = new AssetManager(),
    inputManager = new InputManager(),
    options = {}
  ) {
    /**
     * game script + collision context
     *
      @type {Context} */
    this.gameContext = new Context(options.gameScriptClass || {}, gameObject3D);

    /**
     * game view
     *
      @type {Planar}  */
    this.frame3DPlanar = frame3DPlanar;

    /**
     * asset manager
     *
      @type {AssetManager} */
    this.assetManager = assetManager;

    /**
     * input manager
     *
      @type {InputManager} */
    this.inputManager = inputManager;

    /**
     * interpolator to smooth comminucation between the two process
     *
      @type {StateInterpolator} */
    this.interpolator = new StateInterpolator(options.interpolatorDelay);

    /**
     * render audio external script context
     *
      @type {ExternalContext} */
    this.externalGameContext = new ExternalContext(
      this.frame3DPlanar,
      assetManager,
      inputManager,
      options.externalGameScriptClass || {},
      { interpolator: this.interpolator }
    );

    /** @type {RequestAnimationFrameProcess} */
    this.process = new RequestAnimationFrameProcess(30);
  }

  dispose() {
    this.frame3DPlanar.dispose();
    this.process.stop();
  }

  /**
   *
   * @returns {Promise} - promise resolving when game has started
   */
  start() {
    return new Promise((resolve) => {
      this.gameContext.load().then(() => {
        // initialize interpolator
        let previousGameState = this.gameContext.toState(false); // false because no need to send game component
        this.interpolator.onFirstState(previousGameState);

        // start process gameContext
        const gameProcess = new RequestAnimationFrameProcess(60);

        // plug inputmanager directly in game process
        this.inputManager.startListening(this.frame3DPlanar.domElement);

        gameProcess.start((dt) => {
          // game loop
          this.gameContext.onCommands(this.inputManager.computeCommands()); // pull commands
          this.gameContext.step(dt); // simulate

          // here we compute a diff with the last game state (we could just send a newState to the interpolator)
          // but this is to test multiplayer (isOutdated is used in diff forcing the update transform in external context)
          // isOutdated is also used to notify external script maybe we should use two boolean ? but no since isOutdated means object3D model has changed anyway
          const newState = this.gameContext.toState(false);
          const stateDiff = newState.sub(previousGameState);
          previousGameState = newState;

          // console.log(stateDiff);

          this.interpolator.onNewDiff(stateDiff); // send new diff of the game to interpolator
        });

        // indicate to the external context how to send command to gamecontext (could be with websocket)
        this.externalGameContext.sendCommandsToGameContext = (cmds) => {
          this.gameContext.onCommands(cmds);
        };

        // step external game context

        // METHOD 1 ITOWNS MAIN LOOP NO SMOOTH RENDERING NO CONTROL DT

        // this.frame3DPlanar.itownsView.addFrameRequester(
        //   itowns.MAIN_LOOP_EVENTS.UPDATE_START,
        //   (dt) => {
        //     this.externalGameContext.step(dt, this.interpolator.computeCurrentStates());
        //   }
        // );

        // METHOD 2 REQUESTANIMATIONFRAME
        this.frame3DPlanar.enableItownsViewRendering(false);
        this.process.start((dt) => {
          // external game loop
          this.externalGameContext.step(
            dt,
            this.interpolator.computeCurrentStates()
          ); // simulate
          this.frame3DPlanar.render();
        });

        // DEBUG PRINT
        this.inputManager.addKeyInput('p', 'keyup', () => {
          console.log('game ', this);
        });

        resolve();
      });
    });
  }
}
