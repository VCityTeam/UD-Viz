import './SplashScreen.css';

/**
 *
 * @param {*} duration
 * @returns
 */
export function splashScreen(duration) {
  return new Promise((resolve) => {
    const splashScreen = document.createElement('div');
    splashScreen.setAttribute('id', 'splashScreen');
    document.body.appendChild(splashScreen);

    const label = document.createElement('div');
    label.classList.add('label_splashscreen');
    label.innerHTML = 'Urban Data VisualiZation';
    splashScreen.appendChild(label);

    // splashScreen.style.opacity = 0;

    setTimeout(() => {
      splashScreen.remove();
      resolve();
    }, duration); // wait duration then resolve
  });
}
