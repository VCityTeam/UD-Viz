// Everything there should be contributed at some point in itowns

const THREE = require('three');
const itowns = require('itowns');

/** CAMERA */

/**
 * Compute a distance automatically for travel features of itowns Planar View
 *
 * Note: Code retrieve itowns - {@link https://github.com/iTowns/itowns/blob/1bad0d627764c73b606179c636ad7b70105dd633/src/Controls/PlanarControls.js#L712}
 *
 * @param {itowns.PlanarControls} controls - planar controls of itownsView
 * @param {THREE.Vector3} targetPos - position of our target
 * @returns {number} the duration of travel to focus a targetPosition
 */
function autoDurationTravel(controls, targetPos) {
  const normalizedDistance = Math.min(
    1,
    targetPos.distanceTo(controls.camera.position) / controls.autoTravelTimeDist
  );

  return THREE.MathUtils.lerp(
    controls.autoTravelTimeMin,
    controls.autoTravelTimeMax,
    normalizedDistance
  );
}

/**
 * Makes the camera move to focus on the target position.
 *
 * @param {itowns.PlanarView} view The iTowns view.
 * @param {itowns.PlanarControls} controls The camera controls.
 * @param {THREE.Vector3} targetPos The target position.
 * @param {*} [options] Optional parameters for the travel. Accepted entries
 * are :
 * - `duration` : the duration of the movement, in seconds. The promise will
 * resolve after this value. If not specified, the value `auto` is used for
 * the movement (see the `PlanarControls.initateTravel` method), and the promise
 * resolves imediatly.
 * - `verticalDistance` : Desired height of the camera relative to the target
 * position.
 * - `horizontalDistance` : Desired distance of the camera from the target
 * position.
 * @returns {Promise} Promise of the camera focusing on target
 * @todo this function is used by widget should be contribute to itowns or be remove
 */
export function focusCameraOn(view, controls, targetPos, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const duration = options.duration || null;
      const verticalDist = options.verticalDistance || 800;
      const horizontalDist = options.horizontalDistance || 1000;

      const cameraPos = view.camera.camera3D.position.clone();
      const direction = new THREE.Vector3().subVectors(targetPos, cameraPos);
      const currentDist = Math.sqrt(
        direction.x * direction.x + direction.y * direction.y
      );
      cameraPos.addScaledVector(direction, 1 - horizontalDist / currentDist);
      cameraPos.z = targetPos.z + verticalDist;

      const noControls = !view.controls;

      if (noControls) controls = new itowns.PlanarControls(view);

      const travelDuration =
        duration || duration == 0
          ? duration
          : autoDurationTravel(controls, targetPos);

      const timeoutDuration = travelDuration * 1000;
      controls.initiateTravel(cameraPos, travelDuration, targetPos, true);

      setTimeout(() => {
        if (noControls) {
          view.controls.dispose();
          view.controls = undefined;
        }
        resolve();
      }, timeoutDuration);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 *
 * Focus a C3DTiles Layer
 *
 * @param {itowns.PlanarView} itownsView - view
 * @param {itowns.C3DTilesLayer} layer - layer to focus
 * @todo this function is used by widget should be contribue or removed
 */
export function focusC3DTilesLayer(itownsView, layer) {
  if (!layer.isC3DTilesLayer) return;

  const coordinates = itownsView.camera.position();
  const extent = layer.extent;
  coordinates.x = (extent.east + extent.west) / 2;
  coordinates.y = (extent.north + extent.south) / 2;
  coordinates.z = 200;
  if (layer.tileset.tiles[0])
    coordinates.z = layer.tileset.tiles[0].boundingVolume.box.max.z;

  focusCameraOn(
    itownsView,
    itownsView.controls,
    new THREE.Vector3().copy(coordinates),
    {
      verticalDistance: 200,
      horizontalDistance: 200,
    }
  );
}

/**
 * fetchC3DTileFeatureWithNodeText takes a parameter `batchTableKey` and returns a feature from a `3DTileslayer` if
 * the batch table content of the feature contains a given `batchTableValue` string in the given key. Returns an object
 * containing the first matching feature and its layer.
 *
 * @param {itowns.PlanarView} itownsView - view
 * @param {string} batchTableKey a given batch table key
 * @param {string} batchTableValue a given batch table value
 * @returns {object} containting the feature and the layer containing the feature
 */
export function fetchC3DTileFeatureWithNodeText(
  itownsView,
  batchTableKey,
  batchTableValue
) {
  let result = null;
  itownsView
    .getLayers()
    .filter((el) => el.isC3DTilesLayer)
    .forEach((c3DTilesLayer) => {
      for (const [
        // eslint-disable-next-line no-unused-vars
        tileId,
        tileC3DTileFeatures,
      ] of c3DTilesLayer.tilesC3DTileFeatures) {
        // eslint-disable-next-line no-unused-vars
        for (const [batchId, c3DTileFeature] of tileC3DTileFeatures) {
          if (
            c3DTileFeature.getInfo().batchTable[batchTableKey] ==
            batchTableValue
          ) {
            result = {
              feature: c3DTileFeature,
              layer: c3DTilesLayer,
            };
            break;
          }
        }
      }
    });

  return result;
}
