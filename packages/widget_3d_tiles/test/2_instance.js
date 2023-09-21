() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const widgetC3DTiles = window.widgetC3DTiles;

    const crs = 'EPSG:3857';

    const instance = new widgetC3DTiles.C3DTiles(
      new widgetC3DTiles.itowns.View(crs, document.createElement('div'))
    );

    console.log(instance);

    resolve();
  });
};
