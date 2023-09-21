() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetC3DTiles = window.widgetC3DTiles;

    for (const key in widgetC3DTiles) {
      console.log(key);
    }

    resolve();
  });
};
