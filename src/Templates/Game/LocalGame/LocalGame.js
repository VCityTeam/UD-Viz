/** @format */

import * as Components from '../../../Components/Components.js';
import { AssetsManager } from '../../../Views/AssetsManager/AssetsManager';
import * as Game from '../../../Game/Game';
import * as Views from '../../../Views/Views';
import * as udviz from '../../../index';

/**
 * A Class contaning method to easily instanciate a local game based on the ud-viz game engine
 */

export class LocalGame {
  constructor() {
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
    this.gameView.dispose();
  }

  /**
   * Start a local game based on the world, the config and some options
   * @param {World} world world to start
   * @param {String} configPath the path of the config file
   * @param {Object} options
   * @returns
   */
  start(world, configPath, options = {}) {
    const _this = this;

    return new Promise((resolve, reject) => {
      Components.SystemUtils.File.loadJSON(configPath).then(function (config) {
        const assetsManager = new AssetsManager();
        assetsManager
          .loadFromConfig(
            config.assetsManager,
            options.htmlParent || document.body
          )
          .then(function () {
            _this
              .startWithAssetsLoaded(world, assetsManager, config, options)
              .then(resolve);
          });
      });
    });
  }

  startWithAssetsLoaded(world, assetsManager, config, options = {}) {
    return new Promise((resolve, reject) => {
      const worldStateComputer = new Game.WorldStateComputer(
        assetsManager,
        60,
        { udviz: udviz, Game: Game }
      );

      worldStateComputer.start(world);

      //smooth rendering with delay
      const interpolator = new Game.WorldStateInterpolator(
        config.worldStateInterpolator.renderDelay,
        worldStateComputer
      );

      this.gameView = new Views.GameView({
        htmlParent: options.htmlParent || document.body,
        assetsManager: assetsManager,
        interpolator: interpolator,
        config: config,
        itownsControls: false,
        localScriptModules: options.localScriptModules,
        userData: options.userData,
      });

      //start gameview tick
      this.gameView
        .start(worldStateComputer.computeCurrentState())
        .then(function () {
          resolve();
        });
    });
  }
}
