() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const editor = new udviz.gameEditor.Editor();

    console.log(editor);

    resolve();
  });
};
