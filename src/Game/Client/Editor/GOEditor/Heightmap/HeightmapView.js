/** @format */

import { HeightmapModel } from './HeightmapModel';

const THREE = require('three');

import './Heightmap.css';
import '../../Editor.css';

export class HeightMapView {
  constructor(goView) {
    //root ui
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('root_HeightMapView');

    //heightmap model
    if (!goView.model) throw new Error('no model');
    this.model = new HeightmapModel(goView.model);

    //html
    this.sliderPlanTop = null;
    this.sliderPlanBottom = null;
    this.labelDepthResolution = null;
    this.canvasPreview = null;
    this.selectMapSize = null;
    this.downloadButton = null;
  }

  html() {
    return this.rootHtml;
  }

  init() {
    this.model.initScene();

    this.initUI();

    this.initCallbacks();
  }

  initUI() {
    //slider top
    const labelSliderTop = document.createElement('div');
    labelSliderTop.innerHTML = 'Plan Top';
    this.rootHtml.appendChild(labelSliderTop);
    const sliderPlanTop = document.createElement('input');
    sliderPlanTop.setAttribute('type', 'range');
    sliderPlanTop.value = '100';
    this.rootHtml.appendChild(sliderPlanTop);
    this.sliderPlanTop = sliderPlanTop; //ref

    //slider bottom
    const labelSliderBottom = document.createElement('div');
    labelSliderBottom.innerHTML = 'Plan Bottom';
    this.rootHtml.appendChild(labelSliderBottom);
    const sliderPlanBottom = document.createElement('input');
    sliderPlanBottom.setAttribute('type', 'range');
    sliderPlanBottom.value = '0';
    this.rootHtml.appendChild(sliderPlanBottom);
    this.sliderPlanBottom = sliderPlanBottom; //ref

    //label res
    const labelDepthResolution = document.createElement('div');
    this.rootHtml.appendChild(labelDepthResolution);
    this.labelDepthResolution = labelDepthResolution;
    this.updateLabelDepthResolution();

    //preview
    const canvasPreview = document.createElement('canvas');
    canvasPreview.classList.add('canvas_preview');
    this.rootHtml.appendChild(canvasPreview);
    this.canvasPreview = canvasPreview;

    //map size
    const sizes = [128, 256, 512, 1024, 2046, 4096];
    const selectMapSize = document.createElement('select');
    sizes.forEach(function (size) {
      const option = document.createElement('option');
      option.text = size + '';
      selectMapSize.appendChild(option);
    });
    this.rootHtml.appendChild(selectMapSize);
    this.selectMapSize = selectMapSize;

    //download
    const downloadButton = document.createElement('div');
    downloadButton.innerHTML = 'Download Heightmap';
    downloadButton.classList.add('button_Editor');
    this.rootHtml.appendChild(downloadButton);
    this.downloadButton = downloadButton;
  }

  initCallbacks() {
    const _this = this;

    //sliders
    this.sliderPlanTop.oninput = function (event) {
      let ratio = parseFloat(event.target.value) / 100;
      const bbox = _this.model.getBoundingBox();
      const z = bbox.min.z * (1 - ratio) + bbox.max.z * ratio;
      _this.model.movePlanTop(z);
      _this.updateLabelDepthResolution();
    };

    this.sliderPlanBottom.oninput = function (event) {
      let ratio = parseFloat(event.target.value) / 100;
      const bbox = _this.model.getBoundingBox();
      const z = bbox.min.z * (1 - ratio) + bbox.max.z * ratio;
      _this.model.movePlanBottom(z);
      _this.updateLabelDepthResolution();
    };

    //canvas preview heightmap
    setTimeout(this.initCanvasPreview.bind(this), 100);

    //download
    this.downloadButton.onclick = function () {
      const bbox = this.model.getBoundingBox();
      const widthObject = bbox.max.x - bbox.min.x;
      const heightObject = bbox.max.y - bbox.min.y;
      const cameraCanvas = new THREE.OrthographicCamera(
        widthObject / -2,
        widthObject / 2,
        heightObject / 2,
        heightObject / -2,
        0.001,
        1000
      );

      const rendererCanvas = new THREE.WebGLRenderer({
        canvas: document.createElement('canvas'),
      });
      const mapSize = parseInt(this.selectMapSize.value);
      rendererCanvas.setSize(mapSize, mapSize);

      this.renderHeightmap(cameraCanvas, rendererCanvas);

      const imgResult = document.createElement('img');
      imgResult.src = rendererCanvas.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgResult.src;
      link.download = 'Heightmap.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }.bind(this);
  }

  dispose() {
    //nothing because did not use addEventListener
    this.rootHtml.parentElement.removeChild(this.rootHtml);
  }

  initCanvasPreview() {
    const bbox = this.model.getBoundingBox();
    const widthObject = bbox.max.x - bbox.min.x;
    const heightObject = bbox.max.y - bbox.min.y;
    const cameraCanvas = new THREE.OrthographicCamera(
      widthObject / -2,
      widthObject / 2,
      heightObject / 2,
      heightObject / -2,
      0.001,
      1000
    );

    const rendererCanvas = new THREE.WebGLRenderer({
      canvas: this.canvasPreview,
    });
    rendererCanvas.setSize(this.canvasPreview.width, this.canvasPreview.height);

    const renderCanvas = function () {
      this.renderHeightmap(cameraCanvas, rendererCanvas);
      requestAnimationFrame(renderCanvas);
    }.bind(this);
    renderCanvas();
  }

  renderHeightmap(cameraCanvas, rendererCanvas) {
    cameraCanvas.position.copy(this.model.maxPosition());
    cameraCanvas.updateProjectionMatrix();

    const scene = this.model.getScene();

    scene.overrideMaterial = this.model.computeHeightmapMaterial();
    rendererCanvas.render(scene, cameraCanvas);
    scene.overrideMaterial = null;
  }

  updateLabelDepthResolution() {
    const res = this.model.computeDepthResolution();
    this.labelDepthResolution.innerHTML = 'Resolution = ' + res;
  }
}
