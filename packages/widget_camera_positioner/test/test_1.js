() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const crs = 'EPSG:3946';

    const instance = new udviz.widgetCameraPositioner.CameraPositioner(
      new udviz.itowns.View(crs, document.createElement('div'))
    );

    console.log(instance);

    resolve();
  });
};
