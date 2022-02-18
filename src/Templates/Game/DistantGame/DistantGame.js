/** @format */

import WorldStateInterpolator from '../../../Game/WorldStateInterpolator';
import Constants from '../../../Game/Components/Constants';
import { WorldState, WorldStateDiff } from '../../../Game/Game';
import { GameView } from '../../../Views/Views';

export class DistantGame {
  constructor(webSocketService, assetsManager, config) {
    this.config = config;
    this.interpolator = new WorldStateInterpolator(
      config.worldStateInterpolator
    );
    this.webSocketService = webSocketService;
    this.assetsManager = assetsManager;
    this.gameView = null;
  }

  /**
   *
   * @returns {GameView} return the gameview of the local game
   */
  getGameView() {
    return this.gameView;
  }

  /**
   * dispose the application
   */
  dispose(keepAssets = false) {
    if (this.gameView) this.gameView.dispose(keepAssets); //keep assets
    //reset websocketservices
    this.webSocketService.reset([
      Constants.WEBSOCKET.MSG_TYPES.JOIN_WORLD,
      Constants.WEBSOCKET.MSG_TYPES.WORLDSTATE_DIFF,
    ]);
  }

  reset(userData, localScriptModules) {
    this.dispose(true);

    const gV = new GameView({
      assetsManager: this.assetsManager,
      interpolator: this.interpolator,
      config: this.config,
      userData: userData,
      localScriptModules: localScriptModules,
    });

    const ctxGameView = gV.getLocalContext();
    ctxGameView.setWebSocketService(this.webSocketService);

    //register in tick of the gameview
    const _this = this;
    gV.addTickRequester(function () {
      gV.getInputManager().sendCommandsToServer(_this.webSocketService);
    });

    this.gameView = gV;
  }

  start(userData = {}, localScriptModules) {
    return new Promise((resolve, reject) => {
      this.reset(userData, localScriptModules);

      const _this = this;

      // Register callbacks
      this.webSocketService.on(
        Constants.WEBSOCKET.MSG_TYPES.JOIN_WORLD,
        (json) => {
          if (!json) throw new Error('no data');
          console.log('JOIN_WORLD ', json);

          const state = new WorldState(json.state);

          if (_this.gameView.getLastState()) {
            userData.firstGameView = false;
            _this.start(userData, localScriptModules);
          }

          _this.interpolator.onFirstState(state);
          _this.gameView.writeUserData('avatarUUID', json.avatarUUID);
          _this.gameView.start(state).then(resolve);
        }
      );

      this.webSocketService.on(
        Constants.WEBSOCKET.MSG_TYPES.WORLDSTATE_DIFF,
        (diffJSON) => {
          _this.interpolator.onNewDiff(new WorldStateDiff(diffJSON));
        }
      );

      //app is loaded and ready to receive worldstate
      this.webSocketService.emit(
        Constants.WEBSOCKET.MSG_TYPES.READY_TO_RECEIVE_STATE
      );
    });
  }
}
