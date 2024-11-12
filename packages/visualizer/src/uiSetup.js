import { BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three';
import { C3DTILES_LAYER_EVENTS } from 'itowns';
import { createLocalStorageSlider } from '@ud-viz/utils_browser';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 *
 * @param domElement
 * @param layers
 * @param itownsView
 * @param options
 */
export function setupLoadingUI(domElement, layers, itownsView, options) {
  const c3DTilesLoadingDomElement = document.createElement('div');
  if (options.c3DTilesLoadingDomElementClasses) {
    options.c3DTilesLoadingDomElementClasses.forEach((cssClass) => {
      c3DTilesLoadingDomElement.classList.add(cssClass);
    });
  }
  domElement.appendChild(c3DTilesLoadingDomElement);

  const camera3D = itownsView.camera.camera3D;
  c3DTilesLoadingDomElement.hidden = true;

  /** @type {Map<string, Mesh>} */
  const currentLoadingBox = new Map();

  const loadingBoxId = (layer, tileId) => layer.id + tileId;

  layers.forEach((c3dTilesLayer) => {
    c3dTilesLayer.addEventListener(
      C3DTILES_LAYER_EVENTS.ON_TILE_REQUESTED,
      ({ metadata }) => {
        if (metadata.tileId == undefined) throw new Error('no tile id');

        const worldBox3 = metadata.boundingVolume.box.clone();

        if (metadata.transform) {
          worldBox3.applyMatrix4(metadata.transform);
        } else if (metadata._worldFromLocalTransform) {
          worldBox3.applyMatrix4(metadata._worldFromLocalTransform);
        }

        const box3Object = new Mesh(
          new BoxGeometry(),
          new MeshBasicMaterial({
            wireframe: true,
            wireframeLinewidth: 2,
            color: new Color(Math.random(), Math.random(), Math.random()),
          })
        );
        box3Object.scale.copy(worldBox3.max.clone().sub(worldBox3.min));
        worldBox3.getCenter(box3Object.position);
        box3Object.updateMatrixWorld();
        itownsView.scene.add(box3Object);
        itownsView.notifyChange(camera3D);

        // bufferize
        currentLoadingBox.set(
          loadingBoxId(c3dTilesLayer, metadata.tileId),
          box3Object
        );
        c3DTilesLoadingDomElement.hidden = false;
      }
    );

    c3dTilesLayer.addEventListener(
      C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
      ({ tileContent }) => {
        if (
          currentLoadingBox.has(loadingBoxId(c3dTilesLayer, tileContent.tileId))
        ) {
          itownsView.scene.remove(
            currentLoadingBox.get(
              loadingBoxId(c3dTilesLayer, tileContent.tileId)
            )
          );
          currentLoadingBox.delete(
            loadingBoxId(c3dTilesLayer, tileContent.tileId)
          );
          c3DTilesLoadingDomElement.hidden = currentLoadingBox.size == 0; // nothing more is loaded
          itownsView.notifyChange(camera3D);
        }
      }
    );
  });
  return c3DTilesLoadingDomElement;
}

/**
 * The function setUpSpeedControls creates a set of speed controls for an OrbitControls object in a 3D
 * scene.
 *
 * @param {OrbitControls} orbitControls - Object that likely contains properties and methods
 * related to controlling the orbit of a camera in a 3D scene.
 * @returns {HTMLElement} returns the `domElementSpeedControls` which is a div
 * element containing the speed controls slider for the OrbitControls.
 */
export function setUpSpeedControls(orbitControls) {
  const domElementSpeedControls = document.createElement('div');
  const sliderSpeedControls = createLocalStorageSlider(
    'speed_orbit_controls',
    'Speed controls',
    domElementSpeedControls,
    {
      min: 0.01,
      max: 0.75,
      step: 'any',
      defaultValue: 0.3,
    }
  );

  const updateSpeedControls = () => {
    const speed = sliderSpeedControls.valueAsNumber;
    orbitControls.rotateSpeed = speed;
    orbitControls.zoomSpeed = speed;
    orbitControls.panSpeed = speed;
  };

  sliderSpeedControls.oninput = updateSpeedControls;
  updateSpeedControls();

  return domElementSpeedControls;
}
