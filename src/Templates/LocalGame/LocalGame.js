/** @format */

import * as Components from '../../Components/Components.js';
import { AssetsManager } from '../../Game/Components/AssetsManager';
import * as Shared from '../../Game/Shared/Shared';
import * as Views from '../../Views/Views';

export class LocalGame {
  constructor(fps) {
    this.fps = fps || 30;
  }

  start(world, configPath) {
    const fps = this.fps;

    Components.SystemUtils.File.loadJSON(configPath).then(function (config) {
      const assetsManager = new AssetsManager();

      assetsManager.loadFromConfig(config.assetsManager).then(function () {
        const worldStateComputer = new Shared.WorldStateComputer(
          assetsManager,
          fps,
          Shared
        );

        worldStateComputer.onInit(world);

        const gameView = new Views.GameView({
          htmlParent: document.body,
          assetsManager: assetsManager,
          stateComputer: worldStateComputer,
          config: config,
          itownsControls: false,
        });

        //start gameview tick
        gameView.onFirstState(worldStateComputer.computeCurrentState(), null);
      });
    });
  }
}
