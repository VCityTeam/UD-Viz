import * as THREE from 'three';
import {
  checkIfSubStringIsMatrix4,
  checkIfSubStringIsVector3,
} from '@ud-viz/utils_shared';

import { createLabelInput } from './html';

/**
 * Some unique key to not collide with another item recorded in localStorage
 */
const KEY = {
  CAMERA: 'ab9b47f4-930d-48d8-a810-aa184181a560',
};

/**
 * If there was a camera matrix recorded in localStorage restore it matrix world + when tab is closing record current camera matrix world
 * /!\ calling this function make window reference the camera avoiding it to be GC and could cause memory leak
 * You want to use this only when there is just one camera during the lifecycle of your application
 *
 * @param {THREE.PerspectiveCamera} camera - camera to track
 * @param {string} [key=KEY.CAMERA] - key of the item in the localStorage ud-viz has a default one but you can use yours to avoid collision with another ud-viz app
 * @returns {boolean} true if camera has been setted with localStorage
 */
export function localStorageSetCameraMatrix(camera, key = KEY.CAMERA) {
  if (!camera) throw new Error('no camera to track');

  // listen the close tab event
  window.addEventListener('beforeunload', () => {
    camera.updateMatrixWorld();
    const cameraMatrixString = camera.matrixWorld.toArray().toString();
    if (checkIfSubStringIsMatrix4(cameraMatrixString.split(','))) {
      localStorage.setItem(key, cameraMatrixString);
    }
  });

  // check if there was a previous camera matrix
  const storedMatrixArrayString = localStorage.getItem(key);

  if (
    typeof storedMatrixArrayString === 'string' &&
    checkIfSubStringIsMatrix4(storedMatrixArrayString.split(','))
  ) {
    let error = false;
    try {
      const storedMatrixArray = storedMatrixArrayString
        .split(',')
        .map((x) => parseFloat(x));

      const storedCameraMatrixWorld = new THREE.Matrix4().fromArray(
        storedMatrixArray
      );
      storedCameraMatrixWorld.decompose(
        camera.position,
        camera.quaternion,
        camera.scale
      );
    } catch (e) {
      error = true;
      console.error(e);
    }
    return !error;
  }

  return false;
}

/**
 * If there was a vector 3 recorded in localStorage within the key passed copy values in vector3 + when tab is closing record current vector3 values
 * /!\ calling this function make window reference the vector3 avoiding it to be GC and could cause memory leak
 *
 * @param {THREE.Vector3} vector3 - vector 3 to track
 * @param {string} key - key of the item in localstorage
 * @returns {boolean} true if vector3 has been setted with localStorage
 */
export function localStorageSetVector3(vector3, key) {
  if (!vector3) throw new Error('no vector3');
  if (!key) throw new Error('no key');

  // listen the close tab event
  window.addEventListener('beforeunload', () => {
    const vector3String = vector3.toArray().toString();
    if (checkIfSubStringIsVector3(vector3String.split(','))) {
      localStorage.setItem(key, vector3String);
    }
  });

  // check if there was a previous vector3 register within this key
  const storedVector3String = localStorage.getItem(key);

  if (
    typeof storedVector3String === 'string' &&
    checkIfSubStringIsVector3(storedVector3String.split(','))
  ) {
    let error = false;
    try {
      const storedVector3Array = storedVector3String
        .split(',')
        .map((x) => parseFloat(x));

      const storedVector3 = new THREE.Vector3().fromArray(storedVector3Array);

      vector3.copy(storedVector3);
    } catch (e) {
      error = true;
      console.error(e);
    }
    return !error;
  }

  return false;
}

/**
 *
 * @param {string} keyLocalStorage - the key of the item in localstorage
 * @param {string} summaryText - what text to display
 * @param {HTMLElement|null} [parent=null] - where to append result (optional)
 * @returns {HTMLElement} - the html element created
 */
export const createLocalStorageDetails = (
  keyLocalStorage,
  summaryText,
  parent = null
) => {
  const details = document.createElement('details');

  if (parent) parent.appendChild(details);

  const summary = document.createElement('summary');
  summary.innerText = summaryText;
  details.appendChild(summary);

  const item = localStorage.getItem(keyLocalStorage)
    ? JSON.parse(localStorage.getItem(keyLocalStorage))
    : null;
  if (item && item.opened) details.open = true;

  window.addEventListener('beforeunload', () => {
    localStorage.setItem(
      keyLocalStorage,
      JSON.stringify({ opened: details.open })
    );
  });

  return details;
};

/**
 *
 * @param {string} keyLocalStorage - the key of the item in localstorage
 * @param {string} labelText - what text to display
 * @param {HTMLElement} inputParent - where to append
 * @param {boolean} defaultValue - value to initialize with
 * @returns {HTMLElement} - the html element created
 */
export const createLocalStorageCheckbox = (
  keyLocalStorage,
  labelText,
  inputParent,
  defaultValue = false
) => {
  const { input, parent } = createLabelInput(labelText, 'checkbox');
  inputParent.appendChild(parent);

  const item = localStorage.getItem(keyLocalStorage)
    ? JSON.parse(localStorage.getItem(keyLocalStorage))
    : null;
  if (item) {
    input.checked = item.checked;
  } else {
    input.checked = defaultValue;
  }

  window.addEventListener('beforeunload', () => {
    localStorage.setItem(
      keyLocalStorage,
      JSON.stringify({ checked: input.checked })
    );
  });

  return input;
};

/**
 *
 * @param {string} keyLocalStorage - the key of the item in localstorage
 * @param {string} labelText - what text to display
 * @param {HTMLElement} inputParent - where to append
 * @param {object} options - options of the slider
 * @param {number} options.min - min of the slider
 * @param {number} options.max - max of the slider
 * @param {number} options.step - step of the slider
 * @returns {HTMLElement} - the html element created
 */
export const createLocalStorageSlider = (
  keyLocalStorage,
  labelText,
  inputParent,
  options = {}
) => {
  const { input, parent } = createLabelInput(labelText, 'range');
  inputParent.appendChild(parent);

  input.min = options.min || 0;
  input.max = options.max || 1;
  input.step = options.step || 0.1;

  const item = localStorage.getItem(keyLocalStorage)
    ? JSON.parse(localStorage.getItem(keyLocalStorage))
    : null;
  if (item) {
    input.value = item.value;
  } else {
    input.value = options.defaultValue || input.max;
  }

  window.addEventListener('beforeunload', () => {
    localStorage.setItem(
      keyLocalStorage,
      JSON.stringify({ value: input.value })
    );
  });

  return input;
};
