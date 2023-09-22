() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const frame3DBase = new udviz.frame3d.Base();
    console.log('frame3DBase initialized');

    const el = new udviz.frame3d.DomElement3D(document.createElement('div'));

    frame3DBase.appendDomElement3D(el);
    frame3DBase.removeDomElement3D(el);
    frame3DBase.dispose();

    resolve();
  });
};
