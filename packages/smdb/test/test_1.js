() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const instance = new udviz.smdb.Core(new udviz.RequestService(), {
      url: 'none',
      file: 'none',
      document: 'none',
    });

    console.log(instance);

    resolve();
  });
};
