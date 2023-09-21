() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetGeocoding = window.widgetGeocoding;

    for (const key in widgetGeocoding) {
      console.log(key);
    }

    resolve();
  });
};
