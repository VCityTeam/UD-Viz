import { SocketIOWrapper } from '../Component/SocketIOWrapper';
import { Constant, Data, Game } from '@ud-viz/shared';
import {
  Frame3DPlanar,
  Frame3DPlanarOption,
} from '../Component/Frame3D/Frame3DPlanar';
import { RequestAnimationFrameProcess } from '../Component/RequestAnimationFrameProcess';
import { InputManager } from '../Component/InputManager';
import { AssetManager } from '../Component/AssetManager/AssetManager';
import * as ExternalGame from '../Component/Game/External/ExternalGame';
import * as itowns from 'itowns';

/**
 * @classdesc Create a multi player game in a {@link Frame3DPlanar}
 */
export class MultiPlayerGamePlanar {
  /**
   *
   * @param {SocketIOWrapper} socketIOWrapper - socket to communicate with gamesocketservice
   * @param {itowns.Extent} extent - extent of the itowns view
   * @param {AssetManager} assetManager - assetManager of the game {@link AssetManager}
   * @param {InputManager} inputManager - input manager of the game {@link InputManager}
   * @param {object} options - multi player game planar options
   * @param {Frame3DPlanarOption} options.frame3DPlanarOptions - options frame3Dplanar {@link Frame3DPlanarOption}
   * @param {{x:number,y:number,z:number}=} options.gameOrigin - position of the external game context object3D
   * @param {Object<string,ExternalGame.ScriptBase>=} options.externalGameScriptClass - custom external scripts class of your object3D
   * @param {object=} options.sceneConfig - configuration of the scene 3D {@link ExternalGame.Context}
   * @param {number=} options.interpolatorDelay - delay between state computed in game process and the ones in external context
   */
  constructor(
    socketIOWrapper,
    extent,
    assetManager,
    inputManager,
    options = {}
  ) {
    /**
     *  websocket communication
     *  
     @type {SocketIOWrapper} */
    this.socketIOWrapper = socketIOWrapper;

    /** @type {itowns.Extent} - buffer to rebuild a frame3Dplanar on demand */
    this.extent = extent;

    /** @type {Frame3DPlanarOption} - buffer to rebuild a frame3Dplanar on demand */
    this.frame3DPlanarOptions = options.frame3DPlanarOptions || {};

    /** 
     * game view
     *  
     @type {Frame3DPlanar} */
    this.frame3DPlanar = new Frame3DPlanar(extent, this.frame3DPlanarOptions);

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
     @type {ExternalGame.Context} */
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

        // check if a game was already running
        if (this.interpolator._getLastStateReceived()) {
          // replace frame3D
          this.frame3DPlanar.dispose();

          this.frame3DPlanar = new Frame3DPlanar(
            this.extent,
            this.frame3DPlanarOptions
          );

          // reset
          this.externalGameContext.reset(this.frame3DPlanar);
        } else {
          // first state received start process
          const process = new RequestAnimationFrameProcess(30);
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
            this.frame3DPlanar.itownsView.notifyChange(
              this.frame3DPlanar.camera
            ); // => to load 3DTiles + trigger mainloop event
            this.frame3DPlanar.render();
          });
        }

        // init start
        this.frame3DPlanar.enableItownsViewRendering(false);
        this.interpolator.onFirstState(state);
        this.inputManager.startListening(this.frame3DPlanar.rootWebGL);
      }
    );

    this.socketIOWrapper.on(Constant.WEBSOCKET.MSG_TYPE.GAME_DIFF, (diff) => {
      this.interpolator.onNewDiff(new Game.StateDiff(diff));
    });

    this.socketIOWrapper.emit(Constant.WEBSOCKET.MSG_TYPE.READY_FOR_GAME);
  }
}
