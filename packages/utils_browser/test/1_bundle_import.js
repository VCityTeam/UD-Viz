() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const utilsBrowser = window.utilsBrowser;

    for (const key in utilsBrowser) {
      console.log(key);
    }

    resolve();
  });
};
