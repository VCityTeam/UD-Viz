() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const crs = 'EPSG:3857';

    const game = new udviz.gameBrowser.SinglePlanarProcess(
      new udviz.gameShared.Object3D({
        components: {
          ExternalScript: {
            scriptParams: [
              { id: udviz.gameBrowserTemplate.CameraManager.ID_SCRIPT },
              { id: udviz.gameBrowserTemplate.DragAndDropAvatar.ID_SCRIPT },
            ],
          },
        },
      }),
      new udviz.frame3d.Planar(new udviz.itowns.Extent(crs, 0, 1, 0, 1)),
      new udviz.gameBrowser.AssetManager(),
      new udviz.gameBrowser.InputManager(),
      {
        externalGameScriptClass: [
          udviz.gameBrowserTemplate.note,
          udviz.gameBrowserTemplate.CameraManager,
          udviz.gameBrowserTemplate.DragAndDropAvatar,
        ],
      }
    );

    game.start().then(() => {
      setTimeout(resolve, 500); // wait some tick
    });
  });
};
