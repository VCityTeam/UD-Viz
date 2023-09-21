() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const frame3d = window.frame3d;
    const THREE = frame3d.THREE;

    const frame3DBase = new frame3d.Base();
    console.log('frame3DBase initialized');

    const el = new frame3d.DomElement3D(
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
