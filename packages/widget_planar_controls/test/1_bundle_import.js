() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetPlanarControls = window.widgetPlanarControls;

    for (const key in widgetPlanarControls) {
      console.log(key);
    }

    resolve();
  });
};
