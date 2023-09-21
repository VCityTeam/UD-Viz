() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const widgetCameraPositioner = window.widgetCameraPositioner;

    const crs = 'EPSG:3946';

    const instance = new widgetCameraPositioner.CameraPositioner(
      new widgetCameraPositioner.itowns.View(crs, document.createElement('div'))
    );

    console.log(instance);

    resolve();
  });
};
