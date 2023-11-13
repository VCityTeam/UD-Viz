() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const crs = 'EPSG:3857';

    const instance = new udviz.pointCloudVisualizer.PointCloudVisualizer(
      new udviz.itowns.Extent(crs, 0, 1, 0, 1)
    );

    console.log(instance);

    resolve();
  });
};
