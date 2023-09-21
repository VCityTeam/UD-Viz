() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const gameBrowser = window.gameBrowser;

    for (const key in gameBrowser) {
      console.log(key);
    }

    resolve();
  });
};
