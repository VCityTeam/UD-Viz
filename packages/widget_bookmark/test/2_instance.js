() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const widgetBookmark = window.widgetBookmark;

    const crs = 'EPSG:3857';

    const instance = new widgetBookmark.Bookmark(
      new widgetBookmark.itowns.View(crs, document.createElement('div'))
    );

    console.log(instance);

    resolve();
  });
};
