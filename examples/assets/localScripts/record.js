

let udviz = null;
const gameType = require('ud-viz/src/Game/Game');
/** @type {gameType} */
let Game;

module.exports = class Focus {
  constructor(conf, udvizBundle) {
    this.conf = conf;
    udviz = udvizBundle;
    Game = udviz.Game;
  }

  init() {
    const gV = arguments[1].getGameView();

    console.log('start record');
    const record = [];
    gV.getInterpolator()
      .getLocalComputer()
      .addAfterTickRequester(function () {
        record.push(
          gV.getInterpolator().getLocalComputer().computeCurrentState()
        );
      });

    const replayRecord = document.createElement('button');
    replayRecord.innerHTML = 'Replay record';

    gV.appendToUI(replayRecord);

    replayRecord.onclick = function () {
      console.log('replay record');

      // Stop current simulation
      gV.getInterpolator().stop();
      // New interpolator
      const interpolator = new Game.WorldStateInterpolator();
      // Bind record
      record.forEach(function (s, index) {
        if (index) {
          interpolator.onNewState(s);
        } else {
          interpolator.onFirstState(s);
        }
      });
      // Replace the old one in the gameview
      gV.setInterpolator(interpolator);
    };
  }
};
