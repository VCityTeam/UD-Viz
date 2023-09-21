() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const crs = 'EPSG:3857';

    const extent = new udviz.itowns.Extent(
      crs,
      1837860,
      1851647,
      5169347,
      5180575
    );

    const frame3DPlanar = new udviz.frame3d.Planar(extent);

    frame3DPlanar.on(udviz.frame3d.Base.EVENT.DISPOSE, resolve);

    frame3DPlanar.dispose();
  });
};
