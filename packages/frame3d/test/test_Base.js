() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const frame3DBase = new udviz.frame3d.Base();
    console.log('frame3DBase initialized');

    const el = new udviz.frame3d.DomElement3D(
      document.createElement('div'),
      new udviz.THREE.Vector3(),
      new udviz.THREE.Vector3(),
      new udviz.THREE.Vector3(),
      10
    );

    frame3DBase.appendDomElement3D(el);
    frame3DBase.removeDomElement3D(el);
    frame3DBase.dispose();

    resolve();
  });
};
