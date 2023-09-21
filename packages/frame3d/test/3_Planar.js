() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const frame3d = window.frame3d;

    const crs = 'EPSG:3857';

    const extent = new frame3d.itowns.Extent(
      crs,
      1837860,
      1851647,
      5169347,
      5180575
    );

    const frame3DPlanar = new frame3d.Planar(extent);

    frame3DPlanar.on(frame3d.Base.EVENT.DISPOSE, resolve);

    frame3DPlanar.dispose();
  });
};
