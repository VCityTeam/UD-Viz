() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const smdb = window.smdb;

    for (const key in smdb) {
      console.log(key);
    }

    resolve();
  });
};
