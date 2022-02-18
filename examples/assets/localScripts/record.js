/** @format */

let udviz = null;
const sharedType = require('ud-viz/src/Game/Shared/Shared');
/** @type {sharedType} */
let Shared;

module.exports = class Focus {
  constructor(conf, udvizBundle) {
    this.conf = conf;
    udviz = udvizBundle;
    Shared = udviz.Game.Shared;
  }

  init() {
    const gV = arguments[1].getGameView();

    //start record button
    const startRecord = document.createElement('button');
    startRecord.innerHTML = 'Start record';

    gV.appendToUI(startRecord);

    const statesBuffer = [];

    startRecord.onclick = function () {
      console.log('start record');
      gV.getInterpolator()
        .getLocalComputer()
        .addAfterTickRequester(function () {
          statesBuffer.push(
            gV.getInterpolator().getLocalComputer().computeCurrentState()
          );
        });
    };

    const replayRecord = document.createElement('button');
    replayRecord.innerHTML = 'Replay record';

    gV.appendToUI(replayRecord);

    replayRecord.onclick = function () {
      console.log('replay record');

      gV.getInterpolator().getLocalComputer().resetAfterTickRequester();
      gV.getInterpolator().states.length = 0;

      let index = 0;
      if (!statesBuffer[index]) return;

      const planNextState = function () {
        gV.getInterpolator().onNewState(statesBuffer[index]);
        if (statesBuffer[index + 1]) {
          setTimeout(
            planNextState,
            statesBuffer[index + 1].timestamp - statesBuffer[index].timestamp
          );
          index += 1;
        }
      };
      planNextState();
    };
  }
};
