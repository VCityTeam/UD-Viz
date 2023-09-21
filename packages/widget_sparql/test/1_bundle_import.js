() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetSPARQL = window.widgetSPARQL;

    for (const key in widgetSPARQL) {
      console.log(key);
    }

    resolve();
  });
};
