() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../src/index") }
     */
    const udvizBrowser = window.udvizBrowser;

    const process = new udvizBrowser.RequestAnimationFrameProcess(20);

    let currentDuration = 0;
    const totalDuration = 3000;

    process.start((dt) => {
      currentDuration += dt;
      console.log(currentDuration);

      if (currentDuration > totalDuration) {
        process.stop();
        resolve();
      }
    });
  });
};
