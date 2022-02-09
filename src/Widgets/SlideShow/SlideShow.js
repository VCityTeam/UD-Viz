/** @format */

//Components
import { Window } from '../Components/GUI/js/Window';
import * as THREE from 'three';

export class SlideShow extends Window {
  constructor(app, inputManager) {
    super('slideShow', 'Slide Show', false);
    this.app = app;
    this.extent = app.extent;
    this.view = app.view;

    //content
    this.htmlSlideShow = null;
    //ids
    this.coordinatesInputVectorID = null;
    this.rotationInputVectorID = null;
    this.sizeInputVectorID = null;
    this.aspectRatioCheckboxID = null;

    //Vectors
    this.coordinatesVector = new THREE.Vector3();
    this.rotationVector = new THREE.Vector3();
    this.sizeVector = new THREE.Vector2();

    this.callbacksHTMLEl = [];

    this.plane = null;

    this.texturesFiles = null;
    this.currentTextureFile = null;
    this.iCurrentTexture = 0;

    this.notifyValue = false;

    this.initDefaultTextureFile();

    this.currentTexture = null;

    this.initHtml();
    this.initInput(app, inputManager);
    this.initCBDrop();
    const _this = this;
    const tick = function () {
      requestAnimationFrame(tick);
      _this.notifyChangeEachFrame();
    };
    tick();
  }

  get coordinatesInputVectorDOM() {
    return document.getElementById(this.coordinatesInputVectorID);
  }
  get rotationInputVectorDOM() {
    return document.getElementById(this.rotationInputVectorID);
  }
  get sizeInputVectorDOM() {
    return document.getElementById(this.sizeInputVectorID);
  }
  get aspectRatioCheckboxDOM() {
    return document.getElementById(this.aspectRatioCheckboxID);
  }

  initDefaultTextureFile() {
    this.defaultTexture = new THREE.TextureLoader().load(
      '../assets/img/DefaultTexture.jpg'
    );
    const img = document.createElement('img');
    img.src = '../assets/img/DefaultTexture.jpg';
    this.texturesFiles = [
      {
        index: 0,
        name: 'First',
        texture: this.defaultTexture,
        getSize: function () {
          return {
            height: img.height,
            width: img.width,
          };
        },
      },
    ];
    this.iCurrentText = 0;
    this.currentTextureFile = this.texturesFiles[0];
  }

  notifyChangeEachFrame() {
    if (this.notifyValue) {
      this.app.update3DView();
    }
  }

  initHtml() {
    const htmlSlideShow = document.createElement('div');
    const coordinatesElement = this.createInputVector(
      ['X', 'Y', 'Z'],
      'Coordinates',
      100
    );
    htmlSlideShow.appendChild(coordinatesElement.title);
    this.coordinatesInputVectorID = coordinatesElement.inputVector.id;
    htmlSlideShow.appendChild(coordinatesElement.inputVector);

    const rotationElement = this.createInputVector(
      ['X', 'Y', 'Z'],
      'Rotation',
      0.1
    );
    htmlSlideShow.appendChild(rotationElement.title);
    this.rotationInputVectorID = rotationElement.inputVector.id;
    htmlSlideShow.appendChild(rotationElement.inputVector);

    const sizeElement = this.createInputVector(
      ['Height', 'Width'],
      'Size',
      100
    );
    htmlSlideShow.appendChild(sizeElement.title);
    this.sizeInputVectorID = sizeElement.inputVector.id;
    htmlSlideShow.appendChild(sizeElement.inputVector);

    const matchExtentButton = document.createElement('button');
    matchExtentButton.id = '_button_match_extent';
    matchExtentButton.innerHTML = 'Match Extent';
    this.callbacksHTMLEl.push({
      event: 'click',
      id: matchExtentButton.id,
      cb: function () {
        const extentCenter = this.extent.center();
        this.setSizeInputs(
          new THREE.Vector2(
            Math.abs(this.extent.west - this.extent.east),
            Math.abs(this.extent.north - this.extent.south)
          )
        );
        this.setCoordinatesInputs(
          new THREE.Vector3(extentCenter.x, extentCenter.y, 250)
        );
        this.setRotationInputs(new THREE.Vector3());
      },
    });
    htmlSlideShow.appendChild(matchExtentButton);

    const aspectRatioCheckbox = document.createElement('input');
    aspectRatioCheckbox.id = 'aspectRatio';
    aspectRatioCheckbox.type = 'checkbox';
    this.callbacksHTMLEl.push({
      event: 'change',
      id: aspectRatioCheckbox.id,
      cb: function (event) {
        if (event.target.checked) {
          const currentW = this.getSizeInputsValue().width;
          const w =
            currentW != 0 ? currentW : this.currentTextureFile.getSize().width;
          this.setSizeInputs(new THREE.Vector2(null, w));
        }
      },
    });

    this.aspectRatioCheckboxID = aspectRatioCheckbox.id;
    htmlSlideShow.appendChild(aspectRatioCheckbox);

    const labelAspectRatio = document.createElement('label');
    labelAspectRatio.htmlFor = aspectRatioCheckbox.id;
    labelAspectRatio.innerHTML = 'Aspect Ratio';
    htmlSlideShow.appendChild(labelAspectRatio);

    this.htmlSlideShow = htmlSlideShow;
  }

  windowCreated() {
    const _this = this;
    this.callbacksHTMLEl.forEach(function (element) {
      const htmlElement = document.getElementById(element.id);
      htmlElement.addEventListener(element.event, element.cb.bind(_this));
    });
  }

  createInputVector(labels, vectorName, step = 0.5) {
    const titleVector = document.createElement('h3');
    titleVector.innerHTML = vectorName;

    const inputVector = document.createElement('div');
    inputVector.id = vectorName + '_inputVector';
    inputVector.style.display = 'grid';
    for (let iInput = 0; iInput < labels.length; iInput++) {
      const labelElement = document.createElement('label');
      labelElement.innerHTML = labels[iInput];

      const componentElement = document.createElement('input');
      componentElement.id = vectorName + labelElement.innerHTML;
      componentElement.type = 'number';
      componentElement.setAttribute('value', '0');
      componentElement.step = step;

      labelElement.htmlFor = componentElement.id;
      this.callbacksHTMLEl.push({
        event: 'change',
        id: componentElement.id,
        cb: function (event) {
          const value = event.target.value;
          const element = event.target;
          element.setAttribute('value', value);
          if (this.aspectRatioCheckboxDOM.checked)
            if (vectorName.toLowerCase().includes('size'))
              this.matchRatio(iInput, value);
          this.setVectors();
        },
      });

      inputVector.appendChild(labelElement);
      inputVector.appendChild(componentElement);
    }
    return {
      title: titleVector,
      inputVector: inputVector,
    };
  }

  matchRatio(iInput, value) {
    const linkedSizeElement =
      this.sizeInputVectorDOM.getElementsByTagName('input')[
        iInput == 0 ? 1 : 0
      ];

    const height = this.currentTextureFile.getSize().height;
    const width = this.currentTextureFile.getSize().width;
    const ratio = width / height;
    const newValue = iInput == 0 ? value / ratio : value * ratio;

    linkedSizeElement.value = newValue;
  }

  setVectors() {
    this.coordinatesVector =
      this.inputVectorToVector(this.coordinatesInputVectorDOM) ||
      new THREE.Vector3();

    this.rotationVector =
      this.inputVectorToVector(this.rotationInputVectorDOM) ||
      new THREE.Vector3();

    this.sizeVector =
      this.inputVectorToVector(this.sizeInputVectorDOM) || new THREE.Vector2();

    this.modifyPlane();
  }

  inputVectorToVector(inputVector) {
    const inputEls = document
      .getElementById(inputVector.id)
      .getElementsByTagName('input');

    const countEls = inputEls.length;

    switch (countEls) {
      case 2:
        return new THREE.Vector2(inputEls[0].value, inputEls[1].value);
      case 3:
        return new THREE.Vector3(
          inputEls[0].value,
          inputEls[1].value,
          inputEls[2].value
        );
      case 4:
        return new THREE.Vector4(
          inputEls[0].value,
          inputEls[1].value,
          inputEls[2].value,
          inputEls[3].value
        );
    }

    return null;
  }

  setSizeInputs(vec2) {
    const sizeInputEls = this.sizeInputVectorDOM.getElementsByTagName('input');

    if (vec2.x) {
      const element0 = sizeInputEls[0];
      element0.value = vec2.x;
      element0.dispatchEvent(new Event('change'));
    }

    if (vec2.y) {
      const element1 = sizeInputEls[1];
      element1.value = vec2.y;
      element1.dispatchEvent(new Event('change'));
    }
  }

  getSizeInputsValue() {
    const sizeInputEls = this.sizeInputVectorDOM.getElementsByTagName('input');
    return {
      height: parseInt(sizeInputEls[0].value),
      width: parseInt(sizeInputEls[1].value),
    };
  }

  setCoordinatesInputs(vec3) {
    const coordinatesInputEls =
      this.coordinatesInputVectorDOM.getElementsByTagName('input');
    const element0 = coordinatesInputEls[0];
    element0.value = vec3.x || this.coordinatesVector.x;
    element0.dispatchEvent(new Event('change'));

    const element1 = coordinatesInputEls[1];
    element1.value = vec3.y || this.coordinatesVector.y;
    element1.dispatchEvent(new Event('change'));

    const element2 = coordinatesInputEls[2];
    element2.value = vec3.z || this.coordinatesVector.z;
    element2.dispatchEvent(new Event('change'));
  }

  setRotationInputs(vec3) {
    const rotationInputEls =
      this.rotationInputVectorDOM.getElementsByTagName('input');
    const element0 = rotationInputEls[0];
    element0.value = vec3.x || this.rotationVector.x;
    element0.dispatchEvent(new Event('change'));

    const element1 = rotationInputEls[1];
    element1.value = vec3.y || this.rotationVector.y;
    element1.dispatchEvent(new Event('change'));

    const element2 = rotationInputEls[2];
    element2.value = vec3.z || this.rotationVector.z;
    element2.dispatchEvent(new Event('change'));
  }

  get innerContentHtml() {
    return this.htmlSlideShow.outerHTML;
  }

  createPlane() {
    const geometry = new THREE.PlaneGeometry(1, 1);

    const material = new THREE.MeshBasicMaterial({
      map: this.defaultTexture,
      side: THREE.DoubleSide,
    });

    this.plane = new THREE.Mesh(geometry, material);
  }

  modifyPlane() {
    if (!this.plane) {
      this.createPlane();
    }
    this.plane.position.set(
      this.coordinatesVector.x,
      this.coordinatesVector.y,
      this.coordinatesVector.z
    );

    this.plane.rotation.set(
      this.rotationVector.x,
      this.rotationVector.y,
      this.rotationVector.z
    );
    this.plane.scale.set(this.sizeVector.x, this.sizeVector.y, 1);
    this.plane.material.map = this.currentTexture || this.plane.material.map;

    this.plane.updateMatrixWorld();
    this.view.scene.add(this.plane);
    this.app.update3DView();
  }

  /**
   * @param {AllWidget} app
   * @param {InputManager} iM
   */
  initInput(app, iM) {
    const _this = this;

    // Clamp number between two values with the following line:
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

    iM.addKeyInput('h', 'keydown', function () {
      if (!_this.plane) return;
      _this.plane.visible = !_this.plane.visible;
      app.update3DView();
    });

    iM.addKeyInput('ArrowRight', 'keydown', function () {
      if (!_this.texturesFiles) return;
      _this.iCurrentText = clamp(
        _this.iCurrentText + 1,
        0,
        _this.texturesFiles.length - 1
      );
      _this.setTexture(_this.iCurrentText);

      _this.aspectRatioCheckboxDOM.dispatchEvent(new Event('change'));

      app.update3DView();
    });
    iM.addKeyInput('ArrowLeft', 'keydown', function () {
      if (!_this.texturesFiles) return;
      _this.iCurrentText = clamp(
        _this.iCurrentText - 1,
        0,
        _this.texturesFiles.length - 1
      );
      _this.setTexture(_this.iCurrentText);
      _this.aspectRatioCheckboxDOM.dispatchEvent(new Event('change'));

      app.update3DView();
    });
  }

  /**
   * @param {*} iText
   */
  setTexture(iText) {
    const _this = this;
    if (this.currentTextureFile.video) {
      this.currentTextureFile.video.pause();
      this.currentTextureFile.video.currentTime = 0;
      this.notifyValue = false;
    }
    this.currentTextureFile = this.texturesFiles[iText];
    if (this.currentTextureFile.video) {
      this.currentTextureFile.video.play();
      this.notifyValue = true;
    }

    this.currentTexture = this.currentTextureFile.texture;
    const app = this.app;
    this.modifyPlane();
    app.update3DView();
  }

  /**
   *
   */
  initCBDrop() {
    const _this = this;
    const body = document.body;
    body.addEventListener('drop', function (event) {
      event.preventDefault();
      if (!_this.plane) return;
      _this.initDefaultTextureFile();
      const files = Array.from(event.dataTransfer.files);

      files.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file) {
          try {
            const reader = new FileReader();

            reader.onload = function (data) {
              if (file.type.includes('image/')) {
                const img = document.createElement('img');
                img.src = data.target.result;

                _this.texturesFiles.push({
                  index: i + 1,
                  name: file.name,
                  texture: new THREE.TextureLoader().load(data.target.result),
                  getSize: function () {
                    return {
                      height: img.height,
                      width: img.width,
                    };
                  },
                });
              } else if (file.type.includes('video/')) {
                const video = document.createElement('video');
                video.src = data.target.result;
                video.autoplay = true;
                video.muted = true;
                video.loop = true;
                video.load();

                const videoTexture = new THREE.VideoTexture(video);
                // Rotate the video texture with
                // videoTexture.center.set(0.5, 0.5);
                // videoTexture.rotation = Math.PI / 2;

                _this.texturesFiles.push({
                  index: i + 1,
                  name: file.name,
                  texture: videoTexture,
                  video: video,
                  getSize: function () {
                    return {
                      height: video.videoHeight,
                      width: video.videoWidth,
                    };
                  },
                });
              }
            };

            reader.readAsDataURL(file);
          } catch (e) {
            throw new Error(e);
          }
        }
      }
      _this.setTexture(0);
      console.log(_this.texturesFiles);
    });

    body.addEventListener(
      'dragover',
      function (event) {
        event.preventDefault();
      },
      false
    );
  }

  dispose() {
    super.dispose();
    // if (this.plane) this.plane.removeFromParent();
    // inputManager.dispose();
  }
}
