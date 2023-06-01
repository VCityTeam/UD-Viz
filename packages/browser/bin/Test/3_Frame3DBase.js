() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../src/index") }
     */
    const udvizBrowser = window.udvizBrowser;
    const THREE = udvizBrowser.THREE;

    const frame3DBase = new udvizBrowser.Frame3DBase();
    console.log('frame3DBase initialized');

    const el = new udvizBrowser.DomElement3D(
      document.createElement('div'),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      10
    );

    frame3DBase.appendDomElement3D(el);
    frame3DBase.removeDomElement3D(el);
    frame3DBase.dispose();

    resolve();
  });
};
