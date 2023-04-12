() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../src/index") }
     */
    // const udvizBrowser = window.udvizBrowser;

    // const crs = 'EPSG:3946';

    // // http://proj4js.org/
    // // define a projection as a string and reference it that way
    // udvizBrowser.proj4.default.defs(
    //   crs,
    //   '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
    //     ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    // );

    // const extent = new udvizBrowser.itowns.Extent(
    //   crs,
    //   1837860,
    //   1851647,
    //   5169347,
    //   5180575
    // );

    // const frame3DPlanar = new udvizBrowser.Frame3DPlanar(extent);
    // frame3DPlanar.dispose();

    resolve();
  });
};
