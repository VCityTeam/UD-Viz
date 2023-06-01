import { SocketIOWrapper } from '../../SocketIOWrapper';
import { Constant, Data, Game } from '@ud-viz/shared';
import {
  Frame3DPlanar,
  Frame3DPlanarOption,
} from '../../Frame3D/Frame3DPlanar';
import { RequestAnimationFrameProcess } from '../../RequestAnimationFrameProcess';
import { InputManager } from '../../InputManager';
import { AssetManager } from '../../AssetManager/AssetManager';
import * as ExternalGame from './ExternalGame';
import * as itowns from 'itowns';

/**
 * @classdesc Create a multi player game in a {@link Frame3DPlanar}
 */
export class MultiPlanarProcess {
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

    /**
     * buffer to rebuild a frame3Dplanar on demand
     *
     @type {itowns.Extent}*/
    this.extent = extent;

    /** 
     * buffer to rebuild a frame3Dplanar on demand 
     *  
     @type {Frame3DPlanarOption} */
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

    // start listening on socket events
    this.socketIOWrapper.on(
      Constant.WEBSOCKET.MSG_TYPE.NEW_GAME,
      (gameData) => {
        console.log(gameData);

        const stateJSON = gameData.state;
        const state = new Game.State(
          new Game.Object3D(stateJSON.object3D),
          stateJSON.timestamp
        );

        Data.objectOverWrite(
          this.externalGameContext.userData,
          gameData.userData
        );

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
        this.inputManager.startListening(this.frame3DPlanar.domElementWebGL);
      }
    );

    this.socketIOWrapper.on(Constant.WEBSOCKET.MSG_TYPE.GAME_DIFF, (diff) => {
      this.interpolator.onNewDiff(new Game.StateDiff(diff));
    });

    this.socketIOWrapper.emit(Constant.WEBSOCKET.MSG_TYPE.READY_FOR_GAME);
  }
}
