import { AssetManager } from '../Component/AssetManager/AssetManager';
import { InputManager } from '../Component/InputManager';
import { Frame3DPlanar } from '../Component/Frame3D/Frame3D';
import { Game } from '@ud-viz/core';
import { RequestAnimationFrameProcess } from '../Component/RequestAnimationFrameProcess';
import * as ExternalGame from '../Component/ExternalGame/ExternalGame';

/**
 * @classdesc Create a single player game in a {@link Frame3DPlanar}
 */
export class SinglePlayerGamePlanar {
  /**
   *
   * @param {Game.Object3D} gameObject3D - root game object3D of your game
   * @param {Frame3DPlanar} frame3DPlanar - frame3DPlanar where the game is taking place
   * @param {AssetManager} assetManager - assetManager of the game {@link AssetManager}
   * @param {InputManager} inputManager - input manager of the game {@link InputManager}
   * @param {object} options - single player game planar options
   * @param {Object<string,Game.ScriptBase>=} options.gameScriptClass - custom game scripts class of your object3D
   * @param {{x:number,y:number,z:number}=} options.gameOrigin - position of the external game context object3D
   * @param {Object<string,ExternalGame.ScriptBase>=} options.externalGameScriptClass - custom external scripts class of your object3D
   * @param {object=} options.sceneConfig - configuration of the scene 3D {@link ExternalGame.Context}
   * @param {number=} options.interpolatorDelay - delay between state computed in game process and the ones in external context
   */
  constructor(
    gameObject3D,
    frame3DPlanar,
    assetManager,
    inputManager,
    options = {}
  ) {
    /** @type {Game.Context} - game script + collision context */
    this.gameContext = new Game.Context(
      options.gameScriptClass || {},
      gameObject3D
    );

    /** @type {Frame3DPlanar} - game view */
    this.frame3DPlanar = frame3DPlanar;

    /** @type {AssetManager} - asset manager */
    this.assetManager = assetManager;

    /** @type {InputManager} - input manager */
    this.inputManager = inputManager;

    /** @type {ExternalGame.Context} - render audio external script context */
    this.externalGameContext = new ExternalGame.Context(
      this.frame3DPlanar,
      assetManager,
      inputManager,
      options.externalGameScriptClass || {},
      { sceneConfig: options.sceneConfig }
    );

    if (options.gameOrigin) {
      this.externalGameContext.object3D.position.set(
        options.gameOrigin.x,
        options.gameOrigin.y,
        options.gameOrigin.z
      );
      this.externalGameContext.object3D.updateMatrixWorld();
    }

    /** @type {Game.StateInterpolator} - interpolator to smooth comminucation between the two process */
    this.interpolator = new Game.StateInterpolator(options.interpolatorDelay);
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
        this.inputManager.startListening(this.frame3DPlanar.html());

        gameProcess.start((dt) => {
          // game loop
          this.gameContext.onCommand(this.inputManager.computeCommands()); // pull commands
          this.gameContext.step(dt); // simulate

          // here we compute a diff with the last game state (we could just send a newState to the interpolator)
          // but this is to test multiplayer (isOutdated is used in diff forcing the update transform in external context)
          // isOutdated is also used to notify external script maybe we should use two boolean TODO_ISSUE
          const newState = this.gameContext.toState(false);
          const stateDiff = newState.sub(previousGameState);
          previousGameState = newState;

          // console.log(stateDiff);

          this.interpolator.onNewDiff(stateDiff); // send new diff of the game to interpolator
        });

        // indicate to the external context how to send command to gamecontext (could be with websocket)
        this.externalGameContext.sendCommandToGameContext = (cmds) => {
          this.gameContext.onCommand(cmds);
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
        const process = new RequestAnimationFrameProcess(30);
        process.start((dt) => {
          // external game loop
          this.externalGameContext.step(
            dt,
            this.interpolator.computeCurrentStates()
          ); // simulate
          this.frame3DPlanar.itownsView.notifyChange(this.frame3DPlanar.camera); // => to load 3DTiles
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
