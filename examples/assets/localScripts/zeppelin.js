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

  update() {
    const go = arguments[0];

    //play a sound because meaning a sphere has been collected
    const s = go.getComponent(udviz.Game.Shared.Audio.TYPE).getSounds()[
      'ballon_pop'
    ];
    s.play();

    this.updateUI();
  }
};
