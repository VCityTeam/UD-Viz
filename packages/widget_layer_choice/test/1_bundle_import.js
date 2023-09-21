() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetLayerChoice = window.widgetLayerChoice;

    for (const key in widgetLayerChoice) {
      console.log(key);
    }

    resolve();
  });
};
