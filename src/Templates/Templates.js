/** @format */
import { LocalGame } from './LocalGame/LocalGame';
export { LocalGame };
export { DistantGame } from './DistantGame/DistantGame';
export { AllWidget } from './AllWidget/AllWidget';

const startLocalGame = function (gameView, world, config) {
  gameView.setIsRendering(false); //stop rendering
  gameView.getInputManager().setPause(true); //inputs are paused
  const htmlParent = gameView.html().parentNode; //html
  gameView.html().remove();

  //start local
  const localGame = new LocalGame();
  localGame
    .start(world, config, {
      htmlParent: htmlParent,
    })
    .then(function () {
      const manager = localGame.getGameView().getInputManager();
      manager.addKeyInput('Escape', 'keydown', function () {
        localGame.dispose();
        htmlParent.appendChild(gameView.html());
        gameView.setIsRendering(true);
        gameView.getInputManager().setPause(false);
      });
    });
};

export { startLocalGame };
