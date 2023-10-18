() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const crs = 'EPSG:3857';

    const instance = new udviz.widgetGuidedTour.GuidedTour(
      new udviz.itowns.View(crs, document.createElement('div')),
      null,
      null
    );

    console.log(instance);

    resolve();
  });
};
