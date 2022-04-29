/** @format */

let udviz;

module.exports = class Zeppelin {
  constructor(conf, udvizBundle) {
    this.conf = conf;
    udviz = udvizBundle;
    this.labelSphereCount = null;
  }

  init() {
    const localContext = arguments[1];

    const l = document.createElement('div');
    this.labelSphereCount = l;
    localContext.getGameView().appendToUI(l);
    this.updateUI();
  }

  updateUI() {
    this.labelSphereCount.innerHTML = 'Sphere count: ' + this.conf.sphereCount;
  }

  onOutdated() {
    const go = arguments[0];
    this.updateUI();
  }
};
