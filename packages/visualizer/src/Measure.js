import { createLocalStorageDetails } from '@ud-viz/utils_browser';
import { round, vector3ToLabel } from '@ud-viz/utils_shared';
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  Line,
  LineBasicMaterial,
  Object3D,
  SphereGeometry,
  BufferGeometry,
  Vector3,
} from 'three';

import { MAIN_LOOP_EVENTS, PlanarView } from 'itowns';
import { LayerManager } from './LayerManager';

/** @classdesc Measurement tool in a 3D visualization. Measure distances by clicking points in the scene and creating a path */
export class Measure {
  /**
   * @param {PlanarView} itownsView - managing the 3D scene.
   * @param {LayerManager} layerManager -  handling 3D tiles and intersections.
   * @param {HTMLElement} viewerDiv - 3D viewer container.
   */
  constructor(itownsView, layerManager, viewerDiv) {
    this.domElement = createLocalStorageDetails('measure_details', 'Mesure');

    /** @type {HTMLButtonElement} Toggling measure mode*/
    this.pathButton = null;
    /** @type {HTMLButtonElement} Clearing the current measure path */
    this.clearMeasurePathButton = null;
    /** @type {HTMLDivElement} */
    this.infoPointCloudClicked = null;

    /** @type {LayerManager} */
    this.layerManager = layerManager;

    /** @type {boolean} Flag if measure is active */
    this.modeMeasure = false;

    /** @type {MeasurePath} */
    this.currentMeasurePath = null;

    /** @type {Group} */
    this.group = new Group();
    this.initHtml();
    this.initCallBack(viewerDiv, itownsView);
  }

  initHtml() {
    this.pathButton = document.createElement('button');
    this.domElement.appendChild(this.pathButton);

    this.clearMeasurePathButton = document.createElement('button');
    this.clearMeasurePathButton.innerText = 'Supprimer mesure';
    this.domElement.appendChild(this.clearMeasurePathButton);

    this.infoPointCloudClicked = document.createElement('div');
    this.domElement.appendChild(this.infoPointCloudClicked);
  }

  /**
   * Initializes event callbacks for handling user interactions.
   * Handles point selection in the scene, toggling measure mode, and clearing the current path.
   *
   * @param {HTMLElement} viewerDiv - 3D viewer container.
   * @param {PlanarView} itownsView - iTowns view instance.
   */
  initCallBack(viewerDiv, itownsView) {
    this.clearMeasurePathButton.onclick = () => {
      if (this.currentMeasurePath) this.currentMeasurePath.dispose();
      this.leaveMeasureMode(itownsView);
    };
    this.pathButton.onclick = () => {
      this.modeMeasure = !this.modeMeasure;
      this.update(itownsView);
    };

    viewerDiv.addEventListener('click', (event) => {
      const i = this.layerManager.eventTo3DTilesIntersect(
        event,
        itownsView.camera.camera3D
      );

      if (i) {
        this.infoPointCloudClicked.innerText =
          'position point cliqué = ' + vector3ToLabel(i.point);

        // if measure mode add point to path
        if (this.modeMeasure) {
          this.currentMeasurePath.addPoint(i.point, itownsView);
        }
      }
    });
  }

  /**
   * Exits the measurement mode and updates the view accordingly.
   *
   * @param {PlanarView} itownsView - iTowns view instance.
   */
  leaveMeasureMode(itownsView) {
    if (this.modeMeasure) {
      this.modeMeasure = false;
      this.update(itownsView);
    }
  }

  /**
   * Updates the UI and behavior based on the current measurement mode.
   *
   * @param {PlanarView} itownsView - iTowns view instance.
   */
  update(itownsView) {
    this.pathButton.innerText = this.modeMeasure
      ? 'Arreter de  mesurer'
      : 'Ajouter chemin de mesure';

    if (this.modeMeasure) {
      this.domElement.classList.add('cursor_add');
      if (this.currentMeasurePath) this.currentMeasurePath.dispose();
      this.currentMeasurePath = this.createNewMeasurePath(itownsView);
    } else {
      this.domElement.classList.remove('cursor_add');
    }
  }

  /**
   * Creates a new measurement path and adds it to the group.
   *
   * @param {PlanarView} itownsView - iTowns view instance.
   * @returns {MeasurePath} - New instance of the MeasurePath class.
   */
  createNewMeasurePath(itownsView) {
    const pointMaterial = new MeshBasicMaterial({ color: 'green' });
    const lineMaterial = new LineBasicMaterial({
      color: 0x0000ff,
      linewidth: 3,
    });
    const newMeasurePath = new MeasurePath(
      this.group,
      itownsView,
      pointMaterial,
      lineMaterial
    );
    return newMeasurePath;
  }
}

/**
 * @classdesc Measurement path composed of points and lines.
 */
class MeasurePath {
  /**
   * @param {Group} parentMeasureObject - Group that contains the path.
   * @param {PlanarView} itownsView - iTowns view instance.
   * @param {MeshBasicMaterial} pointMaterial - Material for the sphere meshes.
   * @param {LineBasicMaterial} lineMaterial - Material for the lines.
   */
  constructor(parentMeasureObject, itownsView, pointMaterial, lineMaterial) {
    /** @type {Object3D} */
    this.object3D = new Object3D();

    parentMeasureObject.add(this.object3D);

    /** @type {MeshBasicMaterial} */
    this.pointMaterial = pointMaterial;
    /** @type {LineBasicMaterial} */
    this.lineMaterial = lineMaterial;

    /** @type {Array<Mesh>} array of spheres that representing points*/
    this.sphereMesh = [];

    /** @type {Array<Label3D>} array of Label3D for distances between points*/
    this.labelDomElements = [];

    // record a frame requester
    itownsView.addFrameRequester(MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE, () => {
      this.updateTransform(itownsView);
    });

    /** @type {Array<Vector3>} Array of points*/
    this.points = [];
  }

  /**
   * Updates the 3D objects representing the measurement path, including spheres and lines.
   *
   * @param {PlanarView} itownsView - iTowns view instance.
   */
  update(itownsView) {
    // clear existing objects
    while (this.object3D.children.length) {
      this.object3D.remove(this.object3D.children[0]);
    }

    // add points as spheres
    for (let index = 0; index < this.points.length; index++) {
      const point = this.points[index];
      const sphere = new Mesh(new SphereGeometry(), this.pointMaterial);
      sphere.position.copy(point);

      this.sphereMesh.push(sphere);
      this.object3D.add(sphere);
    }

    // clear labels
    this.labelDomElements.forEach((l) => l.dispose());
    this.labelDomElements.length = 0;

    if (this.points.length >= 2) {
      const cloneArray = this.points.map((el) => el.clone());

      const max = new Vector3(-Infinity, -Infinity, -Infinity);
      const min = new Vector3(Infinity, Infinity, Infinity);

      // compute bb to center line object to avoid blink (when geometry has values too high)
      for (let index = 0; index < cloneArray.length; index++) {
        const point = cloneArray[index];
        max.x = Math.max(point.x, max.x);
        max.y = Math.max(point.y, max.y);
        max.z = Math.max(point.z, max.z);
        min.x = Math.min(point.x, min.x);
        min.y = Math.min(point.y, min.y);
        min.z = Math.min(point.z, min.z);

        // add distance label between points
        if (cloneArray[index + 1]) {
          this.labelDomElements.push(
            new Label3D(
              new Vector3().lerpVectors(
                cloneArray[index],
                cloneArray[index + 1],
                0.5
              ),
              round(cloneArray[index].distanceTo(cloneArray[index + 1])) + 'm'
            )
          );
        }
      }

      const center = min.lerp(max, 0.5);

      cloneArray.forEach((point) => {
        point.sub(center);
      });

      // create line from points
      const line = new Line(
        new BufferGeometry().setFromPoints(cloneArray),
        this.lineMaterial
      );

      line.position.copy(center);
      this.object3D.add(line);
    }

    this.updateTransform(itownsView);
  }

  /**
   * Updates the transform (scale) of spheres and labels based on camera distance.
   *
   * @param {PlanarView} itownsView - iTowns view instance.
   */
  updateTransform(itownsView) {
    this.sphereMesh.forEach((s) => {
      const scale =
        itownsView.camera.camera3D.position.distanceTo(s.position) / 100;
      s.scale.set(scale, scale, scale);
    });

    // update the position of labels on the screen
    this.labelDomElements.forEach((l) => l.update(itownsView));

    itownsView.notifyChange(itownsView.camera.camera3D);
  }

  /**
   * Adds a new point to the measurement path.
   *
   * @param {Vector3} vector - position of the point.
   * @param {PlanarView} itownsView - iTowns view instance.
   */
  addPoint(vector, itownsView) {
    this.points.push(vector);
    this.update(itownsView);
  }

  dispose() {
    this.object3D.removeFromParent();
    this.labelDomElements.forEach((l) => l.dispose());
  }
}

/**
 * @classdesc 3D label that displays information
 */
class Label3D {
  /**
   * @param {Vector3} position - Position of the label.
   * @param {string} value - text value.
   */
  constructor(position, value) {
    /** @type {Vector3} */
    this.position = position;

    /** @type {HTMLDivElement} */
    this.domElement = document.createElement('div');
    this.domElement.classList.add('label_3D');
    this.domElement.innerText = value;
  }

  dispose() {
    this.domElement.remove();
  }

  /**
   * Updates the position of the label on the screen based on the camera view.
   *
   * @param {PlanarView} itownsView - iTowns view instance.
   */
  update(itownsView) {
    const onScreenPosition = this.position.clone();
    onScreenPosition.project(itownsView.camera.camera3D);

    // compute position on screen
    // note that this is working only when parent div of the html is 100% window size
    const widthHalf =
        itownsView.mainLoop.gfxEngine.renderer.domElement.clientWidth * 0.5,
      heightHalf =
        itownsView.mainLoop.gfxEngine.renderer.domElement.clientHeight * 0.5;
    onScreenPosition.x = onScreenPosition.x * widthHalf + widthHalf;
    onScreenPosition.y = -(onScreenPosition.y * heightHalf) + heightHalf;

    this.domElement.style.left = onScreenPosition.x + 'px';
    this.domElement.style.top = onScreenPosition.y + 'px';
  }
}
