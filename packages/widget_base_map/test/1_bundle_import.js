() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetBaseMap = window.widgetBaseMap;

    for (const key in widgetBaseMap) {
      console.log(key);
    }

    resolve();
  });
};
