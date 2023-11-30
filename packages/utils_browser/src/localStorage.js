import * as THREE from 'three';
import {
  checkIfSubStringIsMatrix4,
  checkIfSubStringIsVector3,
} from '@ud-viz/utils_shared';

import { createLabelInput } from './html';

/**
 * If there was a matrix4 recorded in localStorage restore it matrix4 + when tab is closing record current matrix4
 * /!\ calling this function make window reference the matrix4 avoiding it to be GC and could cause memory leak
 *
 * @param {THREE.Matrix4} matrix4 - matrix4 to track
 * @param {string} key - key of the item in localstorage
 * @returns {boolean} true if matrix4 has been setted with localStorage
 */
export function localStorageSetMatrix4(matrix4, key) {
  // listen the close tab event
  window.addEventListener('beforeunload', () => {
    const matrix4String = matrix4.toArray().toString();
    if (checkIfSubStringIsMatrix4(matrix4String.split(','))) {
      localStorage.setItem(key, matrix4String);
    }
  });

  // check if there was a previous matrix4
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

      matrix4.fromArray(storedMatrixArray);
      return true;
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
export const createLocalStorageNumberInput = (
  keyLocalStorage,
  labelText,
  inputParent,
  options = {}
) => {
  const { input, parent } = createLabelInput(labelText, 'number');
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
