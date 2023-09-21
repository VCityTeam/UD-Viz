() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const widgetSlideShow = window.widgetSlideShow;

    const crs = 'EPSG:3857';

    const instance = new widgetSlideShow.SlideShow(
      new widgetSlideShow.itowns.View(crs, document.createElement('div')),
      null,
      new widgetSlideShow.itowns.Extent(crs, 0, 1, 0, 1)
    );

    console.log(instance);

    resolve();
  });
};
