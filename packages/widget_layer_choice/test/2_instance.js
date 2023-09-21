() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const widgetLayerChoice = window.widgetLayerChoice;

    const crs = 'EPSG:3857';

    const instance = new widgetLayerChoice.LayerChoice(
      new widgetLayerChoice.itowns.View(crs, document.createElement('div'))
    );

    console.log(instance);

    resolve();
  });
};
