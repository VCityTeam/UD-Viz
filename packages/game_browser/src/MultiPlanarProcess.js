import { SocketIOWrapper } from './SocketIOWrapper';
import { InputManager } from './InputManager';
import { AssetManager } from './AssetManager';
import {
  ScriptBase as ExternalScriptBase,
  Context as ExternalContext,
} from './Context';

import { objectOverWrite } from '@ud-viz/utils_shared';
import {
  StateInterpolator,
  constant,
  Object3D,
  State,
  StateDiff,
} from '@ud-viz/game_shared';
import { Planar, PlanarOption } from '@ud-viz/frame3d';
import { RequestAnimationFrameProcess } from '@ud-viz/utils_browser';
import * as itowns from 'itowns';

/**
 * @classdesc Create a multi player game in a {@link Planar}
 */
export class MultiPlanarProcess {
  /**
   *
   * @param {SocketIOWrapper} socketIOWrapper - socket to communicate with gamesocketservice
   * @param {itowns.Extent} extent - extent of the itowns view
   * @param {AssetManager} assetManager - assetManager of the game {@link AssetManager}
   * @param {InputManager} inputManager - input manager of the game {@link InputManager}
   * @param {object} options - multi player game planar options
   * @param {PlanarOption} options.frame3DPlanarOptions - options frame3Dplanar {@link PlanarOption}
   * @param {{x:number,y:number,z:number}=} options.gameOrigin - position of the external game context object3D
   * @param {Object<string,ExternalScriptBase>=} options.externalGameScriptClass - custom external scripts class of your object3D
   * @param {number=} options.interpolatorDelay - delay between state computed in game process and the ones in external context
   * @param {boolean} options.computeBandWidth - compute bandwidth of the interpolator or not
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
     @type {PlanarOption} */
    this.frame3DPlanarOptions = options.frame3DPlanarOptions || {};

    /** 
     * game view
     *  
     @type {Planar} */
    this.frame3DPlanar = new Planar(extent, this.frame3DPlanarOptions);

    /** @type {InputManager} */
    this.inputManager = inputManager;

    /** 
     * interpolator to smooth comminucation between the two process
     *  
     @type {StateInterpolator} */
    this.interpolator = new StateInterpolator(
      options.interpolatorDelay,
      options.computeBandWidth
    );

    /** 
     * render audio external script context
     * 
     @type {ExternalContext} */
    this.externalGameContext = new ExternalContext(
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
   *
   * @param {object} options - options
   * @param {string} options.entryGameObject3DUUID - uuid of the game object3D to connect with SocketService
   */
  start(options = {}) {
    this.externalGameContext.sendCommandsToGameContext = (cmds) => {
      if (!cmds.length) return;
      this.socketIOWrapper.emit(
        constant.WEBSOCKET.MSG_TYPE.COMMANDS,
        cmds.map((el) => el.toJSON())
      );
    };

    // start listening on socket events
    this.socketIOWrapper.on(
      constant.WEBSOCKET.MSG_TYPE.NEW_GAME,
      (gameData) => {
        console.log(gameData);

        const stateJSON = gameData.state;
        const state = new State(
          new Object3D(stateJSON.object3D),
          stateJSON.timestamp
        );

        objectOverWrite(this.externalGameContext.userData, gameData.userData);

        // check if a game was already running
        if (this.interpolator._getLastStateReceived()) {
          // TODO: reuse the same view

          // replace frame3D
          this.frame3DPlanar.dispose();

          this.frame3DPlanar = new Planar(
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
            const commands = this.inputManager
              .computeCommands()
              .map((el) => el.toJSON());

            if (commands.length) {
              this.socketIOWrapper.emit(
                constant.WEBSOCKET.MSG_TYPE.COMMANDS,
                commands
              );
            }
            // simulation
            this.externalGameContext.step(
              dt,
              this.interpolator.computeCurrentStates()
            );

            // to load 3DTiles + trigger mainloop event
            this.frame3DPlanar.itownsView.notifyChange(
              this.frame3DPlanar.camera,
              false
            );
            this.frame3DPlanar.render();
          });
        }

        // init start
        this.frame3DPlanar.enableItownsViewRendering(false);
        this.interpolator.onFirstState(state);
        this.inputManager.startListening(this.frame3DPlanar.domElementWebGL);
      }
    );

    this.socketIOWrapper.on(constant.WEBSOCKET.MSG_TYPE.GAME_DIFF, (diff) => {
      console.log('diff received');
      this.interpolator.onNewDiff(new StateDiff(diff));
    });

    this.socketIOWrapper.emit(
      constant.WEBSOCKET.MSG_TYPE.READY_FOR_GAME,
      options.entryGameObject3DUUID
    );
  }
}
