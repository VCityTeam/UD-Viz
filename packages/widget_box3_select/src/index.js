import { PlanarView } from 'itowns';
import {
  createLocalStorageDetails,
  ExtentInputElement,
  Heightmap,
  checkParentChild,
} from '@ud-viz/utils_browser';
import {
  Box3,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  Vector2,
} from 'three';
import { isNumeric, objectOverWrite } from '@ud-viz/utils_shared';

const MIN_Z = 0; //sea level
const MAX_Z = 8850; //everest
const DEFAULT_HEIGHTMAP_SIZE = new Vector2(500, 500);

export const EVENT = {
  BOX3_CHANGED: 'box3_changed',
};

export class Box3Select extends HTMLElement {
  /**
   *
   * @param {PlanarView} view
   * @param {Object} options
   * @param {Number} options.minZ
   * @param {Number} options.maxZ
   */
  constructor(view, options = {}) {
    super();

    this.view = view;

    this.heightmapSize = options.heightmapSize || DEFAULT_HEIGHTMAP_SIZE;

    this.maxZ = isNumeric(options.maxZ) ? options.maxZ : MAX_Z;
    this.minZ = isNumeric(options.minZ) ? options.minZ : MIN_Z;

    this.box3 = new Box3();

    this.mesh = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({ color: 'red', opacity: 0.2, transparent: true })
    );

    const extentInputOptions = {
      west: view.tileLayer.extent.west,
      east: view.tileLayer.extent.east,
      north: view.tileLayer.extent.north,
      south: view.tileLayer.extent.south,
    };
    objectOverWrite(extentInputOptions, options.extentInputOptions); // by default planar extent is set

    this.extentInput = new ExtentInputElement(
      view.referenceCrs,
      extentInputOptions
    );
    this.appendChild(this.extentInput);

    const detailsHeightmap = createLocalStorageDetails(
      'box3_select_details',
      'Heightmap',
      this
    );
    this.heightmap = new Heightmap('box_3_select');
    detailsHeightmap.appendChild(this.heightmap.domElement);

    const updateMeshFromBox3 = () => {
      this.box3.getCenter(this.mesh.position);
      this.mesh.scale.set(
        this.box3.max.x - this.box3.min.x,
        this.box3.max.y - this.box3.min.y,
        this.box3.max.z - this.box3.min.z
      );
      this.mesh.updateMatrixWorld();
    };

    const updateFromExtent = async () => {
      if (!this.mesh.parent) view.scene.add(this.mesh);

      //rendering between this.minZ and this.maxZ

      this.box3.min = new Vector3(
        this.extentInput.west,
        this.extentInput.south,
        this.minZ
      );
      this.box3.max = new Vector3(
        this.extentInput.east,
        this.extentInput.north,
        this.maxZ
      );

      await this.heightmap.load(view, this.box3, this.heightmapSize);

      this.box3.min.z = this.heightmap.min;
      this.box3.max.z = this.heightmap.max;

      updateMeshFromBox3();
      this.dispatchEvent(new Event(EVENT.BOX3_CHANGED));
    };

    this.extentInput.onchange = updateFromExtent;

    const updateFromExtentButton = document.createElement('button');
    updateFromExtentButton.innerText = 'update from extent';
    this.appendChild(updateFromExtentButton);
    updateFromExtentButton.onclick = updateFromExtent;

    const toggleSelectModeButton = document.createElement('button');
    toggleSelectModeButton.innerText = 'select with drag';
    this.appendChild(toggleSelectModeButton);

    // drag
    const worldCoordStart = new Vector3();
    const worldCoordCurrent = new Vector3();

    const updateMesh = () => {
      this.mesh.position.lerpVectors(worldCoordStart, worldCoordCurrent, 0.5);
      this.mesh.position.z = (this.maxZ - this.minZ) * 0.5 + this.minZ;
      this.mesh.scale.z = this.maxZ - this.minZ;
      this.mesh.scale.x = worldCoordCurrent.x - worldCoordStart.x;
      this.mesh.scale.y = worldCoordCurrent.y - worldCoordStart.y;
      this.mesh.updateMatrixWorld();
      this.view.notifyChange();
    };

    let isDragging = false;

    const dragStart = (event) => {
      if (checkParentChild(event.target, this.parentElement)) return; // Ui has been clicked

      isDragging = true; // Reset

      this.view.getPickingPositionFromDepth(
        new Vector2(event.offsetX, event.offsetY),
        worldCoordStart
      );
      this.view.getPickingPositionFromDepth(
        new Vector2(event.offsetX, event.offsetY),
        worldCoordCurrent
      );

      updateMesh();

      if (!this.mesh.parent) this.view.scene.add(this.mesh);
    };

    const dragging = (event) => {
      if (checkParentChild(event.target, this.parentElement) || !isDragging)
        return; // Ui

      this.view.getPickingPositionFromDepth(
        new Vector2(event.offsetX, event.offsetY),
        worldCoordCurrent
      );
      updateMesh();
    };

    const dragEnd = async () => {
      if (!isDragging) return; // Was not dragging

      this.view.scene.remove(this.mesh);
      isDragging = false;

      if (worldCoordStart.equals(worldCoordCurrent)) return; // It is not an area

      this.view.scene.add(this.mesh);

      this.extentInput.west = Math.min(worldCoordCurrent.x, worldCoordStart.x);
      this.extentInput.east = Math.max(worldCoordCurrent.x, worldCoordStart.x);
      this.extentInput.south = Math.min(worldCoordCurrent.y, worldCoordStart.y);
      this.extentInput.north = Math.max(worldCoordCurrent.y, worldCoordStart.y);

      updateFromExtent();
    };

    let isSelectingWithDrag = false;
    toggleSelectModeButton.onclick = () => {
      isSelectingWithDrag = !isSelectingWithDrag;
      if (isSelectingWithDrag) {
        toggleSelectModeButton.innerText = 'stop drag';
        window.addEventListener('mousedown', dragStart);
        window.addEventListener('mousemove', dragging);
        window.addEventListener('mouseup', dragEnd);
        this.view.controls.enabled = false;
      } else {
        window.removeEventListener('mousedown', dragStart);
        window.removeEventListener('mousemove', dragging);
        window.removeEventListener('mouseup', dragEnd);
        toggleSelectModeButton.innerText = 'select with drag';
        this.view.controls.enabled = true;
      }
    };
  }
}

window.customElements.define('box3-select', Box3Select); // mandatory to extends HTMLElement
