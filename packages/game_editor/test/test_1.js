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

    const editor = new udviz.gameEditor.Editor(
      frame3DPlanar,
      new udviz.gameBrowser.AssetManager(),
      [],
      []
    );

    console.log(editor);

    resolve();
  });
};
