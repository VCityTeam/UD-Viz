export class RequestAnimationFrameProcess {
  constructor(fps, process) {
    this.stopped = false;

    let now;
    let then = Date.now();
    let delta;
    const tick = () => {
      if (this.stopped) return; // Stop requesting frame

      requestAnimationFrame(tick);

      now = Date.now();
      delta = now - then;

      if (delta > 1000 / fps) {
        // Update time stuffs
        then = now - (delta % 1000) / fps;
        process(delta);
      }
    };
    tick();
  }

  stop() {
    this.stopped = true;
  }
}
