() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetWorkspace = window.widgetWorkspace;

    for (const key in widgetWorkspace) {
      console.log(key);
    }

    resolve();
  });
};
