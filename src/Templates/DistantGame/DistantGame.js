/** @format */

import { WorldStateInterpolator } from './WorldStateInterpolator';
import Constants from '../../Game/Shared/Components/Constants';
import { WorldState, WorldStateDiff } from '../../Game/Shared/Shared';
import { GameView } from '../../Views/Views';

export class DistantGame {
  constructor(webSocketService, assetsManager, config) {
    this.config = config;
    this.stateComputer = new WorldStateInterpolator(
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
  dispose() {
    if (this.gameView) this.gameView.dispose();
    //reset websocketservices
    this.webSocketService.reset([
      Constants.WEBSOCKET.MSG_TYPES.JOIN_WORLD,
      Constants.WEBSOCKET.MSG_TYPES.WORLDSTATE_DIFF,
    ]);
  }

  reset(options) {
    this.dispose();

    const gV = new GameView({
      assetsManager: this.assetsManager,
      stateComputer: this.stateComputer,
      config: this.config,
      firstGameView: options.firstGameView,
    });

    //register in tick of the gameview
    const _this = this;
    gV.addTickRequester(function () {
      gV.getInputManager().sendCommandsToServer(_this.webSocketService);
    });

    this.gameView = gV;
  }

  start(options = {}) {
    this.reset(options);

    const _this = this;

    // Register callbacks
    this.webSocketService.on(
      Constants.WEBSOCKET.MSG_TYPES.JOIN_WORLD,
      (json) => {
        if (!json) throw new Error('no data');
        console.log('JOIN_WORLD ', json);

        const state = new WorldState(json.state);

        if (!_this.gameView.getLastState()) {
          //view was not intialized do it
          _this.stateComputer.onFirstState(state);
          _this.gameView.start(state, json.avatarUUID);
        } else {
          _this.start({ firstGameView: false });
          _this.stateComputer.onFirstState(state);
          _this.gameView.start(state, json.avatarUUID);
        }
      }
    );

    this.webSocketService.on(
      Constants.WEBSOCKET.MSG_TYPES.WORLDSTATE_DIFF,
      (diffJSON) => {
        _this.stateComputer.onNewDiff(new WorldStateDiff(diffJSON));
      }
    );
  }
}
