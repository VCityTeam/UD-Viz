() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../src/index") }
     */
    const udvizBrowser = window.udvizBrowser;

    for (const key in udvizBrowser) {
      console.log(key);
    }

    resolve();
  });
};
