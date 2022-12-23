export class RequestAnimationFrameProcess {
  constructor(fps) {
    this.stopped = false;

    this.fps = fps;
  }

  start(requester) {
    let now;
    let then = Date.now();
    let delta;
    const tick = () => {
      if (this.stopped) return; // Stop requesting frame

      requestAnimationFrame(tick);

      now = Date.now();
      delta = now - then;

      if (delta > 1000 / this.fps) {
        // Update time stuffs
        then = now - (delta % 1000) / this.fps;
        requester(delta);
      }
    };
    tick();
  }

  stop() {
    this.stopped = true;
  }
}
