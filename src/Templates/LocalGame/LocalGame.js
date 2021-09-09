/** @format */

import * as Components from '../../Components/Components.js';
import { AssetsManager } from '../../Game/Components/AssetsManager';
import * as Shared from '../../Game/Shared/Shared';
import * as Views from '../../Views/Views';

import * as udviz from '../../index';

export class LocalGame {
  constructor(fps) {
    this.fps = fps || 30;

    this.gameView = null;
  }

  getGameView() {
    return this.gameView;
  }

  dispose() {
    this.gameView.dispose();
  }

  start(world, configPath, options = {}) {
    const fps = this.fps;

    const _this = this;

    return new Promise((resolve, reject) => {
      Components.SystemUtils.File.loadJSON(configPath).then(function (config) {
        const assetsManager = new AssetsManager();

        assetsManager.loadFromConfig(config.assetsManager).then(function () {
          const worldStateComputer = new Shared.WorldStateComputer(
            assetsManager,
            fps,
            { udviz: udviz, Shared: Shared }
          );

          worldStateComputer.load(world);

          _this.gameView = new Views.GameView({
            htmlParent: options.htmlParent || document.body,
            assetsManager: assetsManager,
            stateComputer: worldStateComputer,
            config: config,
            itownsControls: false,
          });

          //start gameview tick
          _this.gameView.start(
            worldStateComputer.computeCurrentState(),
            options.avatarUUID
          );

          resolve();
        });
      });
    });
  }
}
