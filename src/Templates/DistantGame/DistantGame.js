/** @format */

import { WorldStateInterpolator } from './WorldStateInterpolator';
import Constants from '../../Game/Shared/Components/Constants';
import { WorldState, WorldStateDiff } from '../../Game/Shared/Shared';
import { GameView } from '../../Views/Views';

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

  reset(userData) {
    this.dispose(true);

    const gV = new GameView({
      assetsManager: this.assetsManager,
      interpolator: this.interpolator,
      config: this.config,
      userData: userData,
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

  start(userData = {}) {
    this.reset(userData);

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
          _this.start(userData);
        }

        _this.interpolator.onFirstState(state);
        _this.gameView.writeUserData('avatarUUID', json.avatarUUID);
        _this.gameView.start(state);
      }
    );

    this.webSocketService.on(
      Constants.WEBSOCKET.MSG_TYPES.WORLDSTATE_DIFF,
      (diffJSON) => {
        _this.interpolator.onNewDiff(new WorldStateDiff(diffJSON));
      }
    );
  }
}
