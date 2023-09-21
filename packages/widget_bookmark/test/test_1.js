() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const crs = 'EPSG:3857';

    const instance = new udviz.widgetBookmark.Bookmark(
      new udviz.itowns.View(crs, document.createElement('div'))
    );

    console.log(instance);

    resolve();
  });
};
