() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetBookmark = window.widgetBookmark;

    for (const key in widgetBookmark) {
      console.log(key);
    }

    resolve();
  });
};
