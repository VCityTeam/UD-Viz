() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const utilsBrowser = window.utilsBrowser;

    const process = new utilsBrowser.RequestAnimationFrameProcess(20);

    let currentDuration = 0;
    const totalDuration = 120;

    process.start((dt) => {
      currentDuration += dt;

      if (currentDuration > totalDuration) {
        process.stop();
        resolve();
      }
    });
  });
};
