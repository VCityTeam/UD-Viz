import { SocketIOWrapper } from '../Component/SocketIOWrapper';
import { Constant, Data, Game } from '@ud-viz/shared';
import { Frame3DPlanar } from '../Component/Frame3D/Frame3DPlanar';
import { RequestAnimationFrameProcess } from '../Component/RequestAnimationFrameProcess';
import { InputManager } from '../Component/InputManager';
import { AssetManager } from '../Component/AssetManager/AssetManager';
import * as ExternalGame from '../Component/Game/External/ExternalGame';

/**
 * @classdesc Create a multi player game in a {@link Frame3DPlanar}
 */
export class MultiPlayerGamePlanar {
  /**
   *
   * @param {SocketIOWrapper} socketIOWrapper - socket to communicate with gamesocketservice
   * @param {Frame3DPlanar} frame3DPlanar - frame3DPlanar where the game is taking place
   * @param {AssetManager} assetManager - assetManager of the game {@link AssetManager}
   * @param {InputManager} inputManager - input manager of the game {@link InputManager}
   * @param {object} options - multi player game planar options
   * @param {{x:number,y:number,z:number}=} options.gameOrigin - position of the external game context object3D
   * @param {Object<string,ExternalGame.ScriptBase>=} options.externalGameScriptClass - custom external scripts class of your object3D
   * @param {object=} options.sceneConfig - configuration of the scene 3D {@link ExternalGame.Context}
   * @param {number=} options.interpolatorDelay - delay between state computed in game process and the ones in external context
   */
  constructor(
    socketIOWrapper,
    frame3DPlanar,
    assetManager,
    inputManager,
    options = {}
  ) {
    /**
     *  websocket communication
     *  
     @type {SocketIOWrapper} */
    this.socketIOWrapper = socketIOWrapper;

    /** 
     * game view
     *  
     @type {Frame3DPlanar} */
    this.frame3DPlanar = frame3DPlanar;

    /** @type {InputManager} */
    this.inputManager = inputManager;

    /** 
     * interpolator to smooth comminucation between the two process
     *  
     @type {Game.StateInterpolator} */
    this.interpolator = new Game.StateInterpolator(options.interpolatorDelay);

    /** 
     * render audio external script context
     * 
     @type {Context} */
    this.externalGameContext = new ExternalGame.Context(
      this.frame3DPlanar,
      assetManager,
      inputManager,
      options.externalGameScriptClass || {},
      {
        sceneConfig: options.sceneConfig,
        socketIOWrapper: this.socketIOWrapper,
        interpolator: this.interpolator,
      }
    );

    if (options.gameOrigin) {
      this.externalGameContext.object3D.position.set(
        options.gameOrigin.x,
        options.gameOrigin.y,
        options.gameOrigin.z
      );
      this.externalGameContext.object3D.updateMatrixWorld();
    }
  }

  /**
   * Start game communication with server
   */
  start() {
    this.externalGameContext.sendCommandToGameContext = (cmds) => {
      this.socketIOWrapper.emit(Constant.WEBSOCKET.MSG_TYPE.COMMANDS, cmds);
    };

    this.socketIOWrapper.on(
      Constant.WEBSOCKET.MSG_TYPE.EXTERNAL_CONTEXT_USER_DATA,
      (data) => {
        Data.objectOverWrite(this.externalGameContext.userData, data);
        console.log(this.externalGameContext.userData);
      }
    );

    // start listening on socket events
    this.socketIOWrapper.on(
      Constant.WEBSOCKET.MSG_TYPE.NEW_GAME,
      (gameData) => {
        const stateJSON = gameData.state;
        const state = new Game.State(
          new Game.Object3D(stateJSON.object3D),
          stateJSON.timestamp
        );

        console.log(state);

        this.interpolator.onFirstState(state);
        this.inputManager.startListening(this.frame3DPlanar.rootWebGL);

        const process = new RequestAnimationFrameProcess(30);
        this.frame3DPlanar.enableItownsViewRendering(false);
        process.start((dt) => {
          // send commands
          const commands = this.inputManager.computeCommands();

          this.socketIOWrapper.emit(
            Constant.WEBSOCKET.MSG_TYPE.COMMANDS,
            commands
          );

          // simulation
          this.externalGameContext.step(
            dt,
            this.interpolator.computeCurrentStates()
          );

          // render
          this.frame3DPlanar.itownsView.notifyChange(this.frame3DPlanar.camera); // => to load 3DTiles + trigger mainloop event
          this.frame3DPlanar.render();
        });
      }
    );

    this.socketIOWrapper.on(Constant.WEBSOCKET.MSG_TYPE.GAME_DIFF, (diff) => {
      this.interpolator.onNewDiff(new Game.StateDiff(diff));
    });

    this.socketIOWrapper.emit(Constant.WEBSOCKET.MSG_TYPE.READY_FOR_GAME);
  }
}
