() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const process = new udviz.RequestAnimationFrameProcess(20);

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
