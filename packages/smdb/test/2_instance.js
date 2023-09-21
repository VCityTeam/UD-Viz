() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const smdb = window.smdb;

    const instance = new smdb.Core(new smdb.RequestService(), {
      url: 'none',
      file: 'none',
      document: 'none',
    });

    console.log(instance);

    resolve();
  });
};
