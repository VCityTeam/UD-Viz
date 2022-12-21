() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../src/index") }
     */
    const udvizBrowser = window.udvizBrowser;
    const THREE = udvizBrowser.THREE;

    const frame3DBase = new udvizBrowser.Component.Frame3D.Base({});
    frame3DBase.init3D();
    console.log('frame3DBase initialized');

    const min = new THREE.Vector2(10, 65);
    const max = new THREE.Vector2(500, 896);
    frame3DBase.setDisplaySize(min, max);

    if (frame3DBase.getSize().x != max.x - min.x) {
      console.warn('WARNING: width not well computed');
    }

    if (frame3DBase.getSize().y != max.y - min.y) {
      console.warn('WARNING: height not well computed');
    }

    const billboard = new udvizBrowser.Component.Frame3D.Component.Billboard(
      document.createElement('div'),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      10
    );

    frame3DBase.appendBillboard(billboard);
    frame3DBase.removeBillboard(billboard);
    frame3DBase.dispose();

    resolve();
  });
};
