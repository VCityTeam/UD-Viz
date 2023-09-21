() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const extensions3DTilesTemporal = window.extensions3DTilesTemporal;

    const crs = 'EPSG:3857';

    const extensions = new extensions3DTilesTemporal.itowns.C3DTExtensions();
    extensions.registerExtension(extensions3DTilesTemporal.ID, {
      [extensions3DTilesTemporal.itowns.C3DTilesTypes.batchtable]:
        extensions3DTilesTemporal.C3DTTemporalBatchTable,
      [extensions3DTilesTemporal.itowns.C3DTilesTypes.boundingVolume]:
        extensions3DTilesTemporal.C3DTTemporalBoundingVolume,
      [extensions3DTilesTemporal.itowns.C3DTilesTypes.tileset]:
        extensions3DTilesTemporal.C3DTTemporalTileset,
    });

    const instance = new extensions3DTilesTemporal.Temporal3DTilesLayerWrapper(
      new extensions3DTilesTemporal.itowns.C3DTilesLayer(
        'layer_3DTiles_test',
        {
          source: new extensions3DTilesTemporal.itowns.C3DTilesSource({
            url: 'https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis/Temporal/Lyon1er_Temporal-2009-2012-2015_TileSet/tileset.json',
          }),
          registeredExtensions: extensions,
        },
        new extensions3DTilesTemporal.itowns.View(
          crs,
          document.createElement('div')
        )
      )
    );

    console.log(instance);

    resolve();
  });
};
