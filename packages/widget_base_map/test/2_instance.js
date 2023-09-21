() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const widgetBaseMap = window.widgetBaseMap;

    const crs = 'EPSG:3857';

    const instance = new widgetBaseMap.BaseMap(
      new widgetBaseMap.itowns.View(crs, document.createElement('div')),
      [],
      new widgetBaseMap.itowns.Extent(crs, 0, 1, 0, 1)
    );

    console.log(instance.baseMapLayersConfigs);

    resolve();
  });
};
