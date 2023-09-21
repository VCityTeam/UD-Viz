() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    // InputManager Test
    const inputManager = new udviz.gameBrowser.InputManager();
    console.log('create an input manager');
    inputManager.startListening(window);
    console.log('input manager start listening');

    const listener = () => {
      console.log('mouse clicked');
    };
    inputManager.addMouseInput(window, 'mouseclick', listener);
    inputManager.removeInputListener(listener);

    // AssetManager Test

    resolve();
  });
};
