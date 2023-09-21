() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const extensions3DTilesTemporal = window.extensions3DTilesTemporal;

    for (const key in extensions3DTilesTemporal) {
      console.log(key);
    }

    resolve();
  });
};
