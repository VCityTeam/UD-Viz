/** @format */

module.exports = class Zeppelin {
  constructor(conf) {
    this.conf = conf;
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
    this.updateUI();
  }
};
