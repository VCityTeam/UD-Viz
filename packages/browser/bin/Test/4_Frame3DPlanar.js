() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../src/index") }
     */
    const udvizBrowser = window.udvizBrowser;

    const extent = new udvizBrowser.itowns.Extent(
      'EPSG:3946',
      1837860,
      1851647,
      5169347,
      5180575
    );

    const frame3DPlanar = new udvizBrowser.Component.Frame3D.Planar(extent);
    frame3DPlanar.dispose();

    resolve();
  });
};
