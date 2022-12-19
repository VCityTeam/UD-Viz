() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../src/index") }
     */
    const udvizBrowser = window.udvizBrowser;

    console.log('start test');
    console.log(udvizBrowser);

    setTimeout(() => {
      console.log('end test');
      resolve();
    }, 5000);
  });
};
