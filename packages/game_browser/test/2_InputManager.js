() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const gameBrowser = window.gameBrowser;

    // InputManager Test
    const inputManager = new gameBrowser.InputManager();
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
