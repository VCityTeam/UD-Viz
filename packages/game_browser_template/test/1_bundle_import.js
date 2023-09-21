() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const gameBrowserTemplate = window.gameBrowserTemplate;

    for (const key in gameBrowserTemplate) {
      console.log(key);
    }

    resolve();
  });
};
