() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../src/index") }
     */
    const udvizBrowser = window.udvizBrowser;
    const THREE = udvizBrowser.THREE;

    const baseView = new udvizBrowser.View.Base({});
    baseView.init3D();

    const min = new THREE.Vector2(10, 65);
    const max = new THREE.Vector2(500, 896);
    baseView.setDisplaySize(min, max);

    if (baseView.getSize().x != max.x - min.x) {
      console.warn('WARNING: width not well computed');
    }

    if (baseView.getSize().y != max.y - min.y) {
      console.warn('WARNING: height not well computed');
    }

    const billboard = new udvizBrowser.View.Components.Billboard(
      document.createElement('div'),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      10
    );

    baseView.appendBillboard(billboard);
    baseView.removeBillboard(billboard);

    resolve();
  });
};
