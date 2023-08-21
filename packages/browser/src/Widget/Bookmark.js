import * as itownsWidget from 'itowns/widgets';
import * as THREE from 'three';
import * as itowns from 'itowns';

const DEFAULT_OPTIONS = {
  position: 'top-right', // should be deprecated https://github.com/iTowns/itowns/issues/2005
};

const LOCAL_STORAGE_KEY = 'widget_bookmark_localstorage_key';

export class Bookmark extends itownsWidget.Widget {
  constructor(view, options = {}) {
    super(view, options, DEFAULT_OPTIONS);

    /** @type {itowns.View} */
    this.view = view;

    const nameNewBookmark = document.createElement('input');
    nameNewBookmark.setAttribute('type', 'text');
    this.domElement.appendChild(nameNewBookmark);

    const buttonNewBookmark = document.createElement('button');
    buttonNewBookmark.innerText = 'Add bookmark';
    this.domElement.appendChild(buttonNewBookmark);

    /** @type {HTMLElement} */
    this.bookmarksContainer = document.createElement('div');
    this.domElement.appendChild(this.bookmarksContainer);

    /** @type {Map<string,BookmarkElement>} */
    this.elements = new Map();

    buttonNewBookmark.onclick = () =>
      this.addBookmarkElement(
        new BookmarkElement(
          THREE.MathUtils.generateUUID(),
          nameNewBookmark.value,
          view.camera.camera3D.matrixWorld.clone()
        )
      );

    // local storage listen the close tab event
    window.addEventListener('beforeunload', () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.toJSON()));
    });

    // check in local storage if a json is present
    const localStorageBookmark = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localStorageBookmark) {
      this.fromJSON(JSON.parse(localStorageBookmark));
    }
  }

  /**
   *
   * @param {BookmarkElement} el - bookmark element to add in widget
   */
  addBookmarkElement(el) {
    this.bookmarksContainer.appendChild(el.domElement);
    this.elements.set(el.uuid, el);
    el.buttonDelete.onclick = () => this.removeBookmarkElement(el);

    el.buttonSelect.onclick = () => {
      el.matrix4.decompose(
        this.view.camera.camera3D.position,
        this.view.camera.camera3D.quaternion,
        this.view.camera.camera3D.scale
      );
      this.view.notifyChange(this.view.camera.camera3D);
    };
  }

  /**
   *
   * @param {BookmarkElement} el - bookmark element to remove in widget
   */
  removeBookmarkElement(el) {
    el.domElement.remove();
    this.elements.delete(el.uuid);
  }

  /**
   * serialize this
   *
   * @returns {object} - this serialized
   */
  toJSON() {
    const elementsArray = [];
    // eslint-disable-next-line no-unused-vars
    for (const [uuid, el] of this.elements) {
      elementsArray.push(el.toJSON());
    }

    return {
      elements: elementsArray,
    };
  }

  /**
   * deserialize this
   *
   * @param {object} json - this serialized
   * @returns {Bookmark} - this
   */
  fromJSON(json) {
    json.elements.forEach((jsonEl) => {
      this.addBookmarkElement(new BookmarkElement().fromJSON(jsonEl));
    });

    return this;
  }
}

class BookmarkElement {
  constructor(uuid, name, matrix4) {
    /** @type {string} */
    this.uuid = uuid;

    /** @type {string} */
    this.name = name;

    /** @type {THREE.Matrix4} */
    this.matrix4 = matrix4;

    /** @type {HTMLElement} */
    this.domElement = document.createElement('div');

    /** @type {HTMLElement} */
    this.nameDomElement = document.createElement('label');
    this.nameDomElement.innerText = this.name;
    this.domElement.appendChild(this.nameDomElement);

    /** @type {HTMLElement} */
    this.buttonSelect = document.createElement('button');
    this.buttonSelect.innerText = 'Select';
    this.domElement.appendChild(this.buttonSelect);

    /** @type {HTMLElement} */
    this.buttonDelete = document.createElement('button');
    this.buttonDelete.innerText = 'Delete';
    this.domElement.appendChild(this.buttonDelete);
  }

  /**
   * serialize this
   *
   * @returns {object} - this serialized
   */
  toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      matrix4: this.matrix4.toArray(),
    };
  }

  /**
   * deserialize this
   *
   * @param {object} json - this serialized
   * @returns {BookmarkElement} - this
   */
  fromJSON(json) {
    this.uuid = json.uuid;
    this.name = json.name;
    this.matrix4 = new THREE.Matrix4().fromArray(json.matrix4);

    this.nameDomElement.innerText = this.name;

    return this;
  }
}
