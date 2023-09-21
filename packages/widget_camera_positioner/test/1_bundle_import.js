() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetCameraPositioner = window.widgetCameraPositioner;

    for (const key in widgetCameraPositioner) {
      console.log(key);
    }

    resolve();
  });
};
