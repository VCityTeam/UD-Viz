() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const frame3d = window.frame3d;

    for (const key in frame3d) {
      console.log(key);
    }

    resolve();
  });
};
