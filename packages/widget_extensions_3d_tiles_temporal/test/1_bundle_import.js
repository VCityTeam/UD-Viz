() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetExtensionsC3dTilesTemporal =
      window.widgetExtensionsC3dTilesTemporal;

    for (const key in widgetExtensionsC3dTilesTemporal) {
      console.log(key);
    }

    resolve();
  });
};
