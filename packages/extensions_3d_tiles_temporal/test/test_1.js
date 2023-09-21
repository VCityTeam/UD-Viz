() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const crs = 'EPSG:3857';

    const extensions = new udviz.itowns.C3DTExtensions();
    extensions.registerExtension(udviz.extensions3DTilesTemporal.ID, {
      [udviz.itowns.C3DTilesTypes.batchtable]:
        udviz.extensions3DTilesTemporal.C3DTTemporalBatchTable,
      [udviz.itowns.C3DTilesTypes.boundingVolume]:
        udviz.extensions3DTilesTemporal.C3DTTemporalBoundingVolume,
      [udviz.itowns.C3DTilesTypes.tileset]:
        udviz.extensions3DTilesTemporal.C3DTTemporalTileset,
    });

    const instance =
      new udviz.extensions3DTilesTemporal.Temporal3DTilesLayerWrapper(
        new udviz.itowns.C3DTilesLayer(
          'layer_3DTiles_test',
          {
            source: new udviz.itowns.C3DTilesSource({
              url: 'https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis/Temporal/Lyon1er_Temporal-2009-2012-2015_TileSet/tileset.json',
            }),
            registeredExtensions: extensions,
          },
          new udviz.itowns.View(crs, document.createElement('div'))
        )
      );

    console.log(instance);

    resolve();
  });
};
