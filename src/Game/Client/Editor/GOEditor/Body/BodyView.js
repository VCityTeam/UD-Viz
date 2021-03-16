/** @format */

import { BodyModel } from './BodyModel';
import * as ShapeController from '../../Components/ShapeController';
const THREE = require('three');

import './Body.css';
import '../../Editor.css';

export class BodyView {
  constructor(goView) {
    //parent
    this.goView = goView;

    //root ui
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('root_BodyView');

    //Body model
    if (!goView.model) throw new Error('no model');
    this.model = new BodyModel(goView.model);

    //raycaster
    this.raycaster = new THREE.Raycaster();

    //html
    this.selectStep = null;
    this.minusStepButton = null;
    this.plusStepButton = null;
    this.circleButton = null;
    this.polygonButton = null;
    this.shapesList = null;
    this.currentShapeAnchor = null;
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
    //step
    const parentStep = document.createElement('div');
    parentStep.style.display = 'flex';

    const steps = [10, 1, 0.1, 0.01];
    const selectStep = document.createElement('select');
    steps.forEach(function (step) {
      const option = document.createElement('option');
      option.text = step + '';
      selectStep.appendChild(option);
    });
    parentStep.appendChild(selectStep);
    this.selectStep = selectStep;

    //button
    const minusStepButton = document.createElement('div');
    minusStepButton.classList.add('button_Editor');
    minusStepButton.innerHTML = '-';
    parentStep.appendChild(minusStepButton);
    this.minusStepButton = minusStepButton;

    //button
    const plusStepButton = document.createElement('div');
    plusStepButton.classList.add('button_Editor');
    plusStepButton.innerHTML = '+';
    parentStep.appendChild(plusStepButton);
    this.plusStepButton = plusStepButton;

    this.rootHtml.appendChild(parentStep);

    //Shape add
    const circleButton = document.createElement('div');
    circleButton.classList.add('button_Editor');
    circleButton.innerHTML = 'Circle';
    this.rootHtml.appendChild(circleButton);
    this.circleButton = circleButton;

    const polygonButton = document.createElement('div');
    polygonButton.classList.add('button_Editor');
    polygonButton.innerHTML = 'Polygon';
    this.rootHtml.appendChild(polygonButton);
    this.polygonButton = polygonButton;

    //current
    this.currentShapeAnchor = document.createElement('div');
    this.rootHtml.appendChild(this.currentShapeAnchor);

    //shapes preview
    const labelShapesList = document.createElement('div');
    labelShapesList.innerHTML = 'Shapes';
    this.rootHtml.appendChild(labelShapesList);
    const shapesList = document.createElement('ul');
    this.rootHtml.appendChild(shapesList);
    this.shapesList = shapesList;

    this.updateUI();
  }

  shapeHtml(shape) {
    const _this = this;

    const result = document.createElement('li');
    result.innerHTML = shape.toString();

    if (this.model.getCurrentShape() != shape) {
      const editButton = document.createElement('div');
      editButton.classList.add('button_Editor');
      editButton.innerHTML = 'Edit';
      editButton.onclick = function () {
        _this.model.setCurrentShape(shape);
        _this.updateUI();
      };
      result.appendChild(editButton);
    } else {
      //add shape button
      const addButton = document.createElement('div');
      addButton.classList.add('button_Editor');
      addButton.innerHTML = 'Add';
      result.appendChild(addButton);
      addButton.onclick = function () {
        _this.model.addCurrentShape();
        _this.updateUI();
      };
    }

    const deleteButton = document.createElement('div');
    deleteButton.classList.add('button_Editor');
    deleteButton.innerHTML = 'Delete';
    deleteButton.onclick = function () {
      _this.model.remove(shape);
      _this.updateUI();
    };

    result.appendChild(deleteButton);

    result.onmouseover = function () {
      if (shape.mouseOver()) _this.model.updatePlanTexture(); //return true if change occur
    };

    result.onmouseout = function () {
      if (shape.mouseOut()) _this.model.updatePlanTexture();
    };

    return result;
  }

  updateUI() {
    const _this = this;

    //update shapesList
    const list = this.shapesList;
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    this.model.getShapes().forEach(function (shape) {
      list.appendChild(_this.shapeHtml(shape));
    });

    //update current
    const current = this.model.getCurrentShape();
    while (this.currentShapeAnchor.firstChild) {
      this.currentShapeAnchor.removeChild(this.currentShapeAnchor.firstChild);
    }
    if (current) {
      this.currentShapeAnchor.appendChild(this.shapeHtml(current));
    }
  }

  dispose() {
    this.rootHtml.parentElement.removeChild(this.rootHtml);
  }

  initCallbacks() {
    const _this = this;

    //step
    this.minusStepButton.onclick = function (event) {
      _this.model.addZPlan(-parseFloat(_this.selectStep.value));
    };
    this.plusStepButton.onclick = function (event) {
      _this.model.addZPlan(parseFloat(_this.selectStep.value));
    };

    //canvas listener
    const canvas = this.goView.getRenderer().domElement;
    const mouse2PlanCoord = function (event) {
      //1. sets the mouse position with a coordinate system where the center
      //   of the screen is the origin
      const mouse = new THREE.Vector2(
        -1 + (2 * event.offsetX) / canvas.clientWidth,
        1 - (2 * event.offsetY) / canvas.clientHeight
      );

      //2. set the picking ray from the camera position and mouse coordinates
      _this.raycaster.setFromCamera(mouse, _this.goView.getCamera());

      //3. compute intersections
      const intersects = _this.raycaster.intersectObject(
        _this.model.getPlanMesh()
      );

      //only one intersection possible
      if (intersects.length) {
        const p = intersects[0].point;
        return new THREE.Vector2(p.x, p.y);
      } else {
        return null;
      }
    };
    canvas.onmousedown = function (event) {
      if (event.button != 0) return; //only left click
      const currentShape = _this.model.getCurrentShape();
      if (!currentShape) return;
      const point = mouse2PlanCoord(event);
      currentShape.mouseDown(point);
      if (point) {
        _this.goView.enableControls(false);
        _this.model.updatePlanTexture();
      }
    };
    canvas.onmousemove = function (event) {
      const currentShape = _this.model.getCurrentShape();
      if (!currentShape) return;

      const point = mouse2PlanCoord(event);
      if (point) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'auto';
      }

      currentShape.mouseMove(point);
      if (point) _this.model.updatePlanTexture();
    };
    canvas.onmouseup = function (event) {
      _this.goView.enableControls(true);
      const currentShape = _this.model.getCurrentShape();
      if (!currentShape) return;
      const point = mouse2PlanCoord(event);
      currentShape.mouseUp(point);
      if (point) _this.model.updatePlanTexture();
    };

    //add shape
    this.polygonButton.onclick = function () {
      const bb = _this.model.getBoundingBox();
      _this.model.setCurrentShape(new ShapeController.Polygon(bb));
      _this.updateUI();
    };

    this.circleButton.onclick = function () {
      const bb = _this.model.getBoundingBox();
      _this.model.setCurrentShape(new ShapeController.Circle(bb));
      _this.updateUI();
    };
  }
}
