() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetSlideShow = window.widgetSlideShow;

    for (const key in widgetSlideShow) {
      console.log(key);
    }

    resolve();
  });
};
