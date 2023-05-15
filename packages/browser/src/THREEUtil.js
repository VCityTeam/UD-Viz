const THREE = require('three');
const { Data } = require('@ud-viz/shared');

/**
 * @typedef SceneConfig
 * @property {number} cameraFov - default camera fov
 * @property {number} shadowMapSize - size of shadow map
 * @property {object} sky - sky property
 * @property {{r:number,g:number,b:number}} sky.color - rgb color (value are between [0,1])
 * @property {{offset:number,phi:number,theta:number}} sky.sun_position - position of the sun in sheprical coord (phi theta) + an offset {@link THREEUtil.bindLightTransform}
 */

/**
 * Set of function for a high level use of THREE.js
 */
/**
 *  Default scene 3D config
 *
 * @type {SceneConfig}
 */
const defaultConfigScene = {
  cameraFov: 60,
  shadowMapSize: 2046,
  sky: {
    color: {
      r: 0.4,
      g: 0.6,
      b: 0.8,
    },
    sun_position: {
      offset: 10,
      phi: 1,
      theta: 0.3,
    },
  },
};
export { defaultConfigScene };

/**
 * Init scene 3D with {@link SceneConfig}
 *
 * @param {THREE.PerspectiveCamera} camera - camera rendering scene
 * @param {THREE.WebGLRenderer} renderer - webgl renderer
 * @param {THREE.Scene} scene - scene
 * @param {SceneConfig|null} config - config
 * @param {THREE.Object3D|null} object3D - object to focus with shadow map
 * @returns {THREE.DirectionalLight} - directional light created
 */
export function initScene(camera, renderer, scene, config, object3D) {
  const configToApply = JSON.parse(JSON.stringify(defaultConfigScene));
  Data.objectOverWrite(configToApply, config);

  camera.fov = config.cameraFov;

  // Init renderer
  initRenderer(
    renderer,
    new THREE.Color(
      configToApply.sky.color.r,
      configToApply.sky.color.g,
      configToApply.sky.color.b
    )
  );

  // Add lights
  const { directionalLight } = addLights(scene);

  // Configure shadows based on a config files
  directionalLight.shadow.mapSize = new THREE.Vector2(
    configToApply.shadowMapSize,
    configToApply.shadowMapSize
  );
  directionalLight.castShadow = true;
  directionalLight.shadow.bias = -0.0005;

  if (configToApply.sky.paths) {
    addCubeTexture(configToApply.sky.paths, scene);
  }

  if (object3D) {
    bindLightTransform(
      configToApply.sky.sun_position.offset,
      configToApply.sky.sun_position.phi,
      configToApply.sky.sun_position.theta,
      object3D,
      directionalLight
    );
  }

  return directionalLight; // return the directional light
}

/**
 * Texture encoding used to have the right color of the .glb model + have an alpha channel
 */
const textureEncoding = THREE.sRGBEncoding;
export { textureEncoding };

/**
 *
 * @param {Array<string>} paths - paths of cube texture order should be negX posX negY posY posZ negZ
 * @param {THREE.Scene} scene - 3d scene
 */
export function addCubeTexture(paths, scene) {
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load(paths);
  scene.background = texture;
}

/**
 * Add default lights to a scene 3D
 * one directional and one ambient
 *
 * @param {THREE.Scene} scene - the scene where to add lights
 * @returns {{directionalLight:THREE.DirectionalLight, ambientLight:THREE.AmbientLight}} - lights added
 */
export function addLights(scene) {
  // Lights
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(100, 100, 500);
  directionalLight.target.position.set(0, 0, 0);
  directionalLight.updateMatrixWorld();
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  return { directionalLight: directionalLight, ambientLight: ambientLight };
}

/**
 * Initialize the webgl renderer with default values
 *
 * @param {THREE.WebGLRenderer} renderer - the renderer to init
 * @param {THREE.Color} skyColor - clear color of the scene
 * @param {boolean} clear - autoclear, default is false
 */
export function initRenderer(renderer, skyColor, clear = false) {
  // Set sky color to blue
  renderer.setClearColor(skyColor, 1);
  renderer.autoClear = clear;
  renderer.autoClearColor = clear;
  renderer.outputEncoding = textureEncoding;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  // To antialias the shadow
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

/**
 * Place the directional light in order its shadow camera fit the object
 *
 * @param {number} offset - distance from the bounding sphere of the object to the light
 * @param {number} phi - phi of spherical coord in radian
 * @param {number} theta - theta of spherical coord in radian
 * @param {THREE.Object3D} obj - the object to fit inside the projection plane of the shadow camera
 * @param {THREE.DirectionalLight} dirLight - the light with the shadow camera
 */
export function bindLightTransform(offset, phi, theta, obj, dirLight) {
  // Computing boundingSphere
  const bb = new THREE.Box3().setFromObject(obj);
  const center = bb.getCenter(new THREE.Vector3());
  const bsphere = bb.getBoundingSphere(new THREE.Sphere(center));
  const sphericalPoint = new THREE.Spherical(
    bsphere.radius + offset,
    phi,
    theta
  );

  // Set the light's target
  dirLight.target.position.copy(center);
  dirLight.target.updateMatrixWorld();

  // Convert spherical coordinates in cartesian
  const vecLightPos = new THREE.Vector3();
  vecLightPos.setFromSpherical(sphericalPoint);
  vecLightPos.add(dirLight.target.position);

  // Place directionnal lights
  dirLight.position.copy(vecLightPos);
  dirLight.updateMatrixWorld();

  // Set up camera that computes the shadow map
  const cameraShadow = dirLight.shadow.camera;
  cameraShadow.near = offset;
  cameraShadow.far = offset + bsphere.radius * 2;
  cameraShadow.top = bsphere.radius;
  cameraShadow.right = bsphere.radius;
  cameraShadow.left = -bsphere.radius;
  cameraShadow.bottom = -bsphere.radius;
  cameraShadow.updateProjectionMatrix();
}

/**
 * Compute near and far of camera in order to wrap a box define by a min and max value
 *
 * @param {THREE.PerspectiveCamera} camera - camera to compute near and far
 * @param {THREE.Vector3} min - min coord of box
 * @param {THREE.Vector3} max - max coord of box
 */
export function computeNearFarCamera(camera, min, max) {
  const points = [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ];

  const dirCamera = camera.getWorldDirection(new THREE.Vector3());

  let minDist = Infinity;
  let maxDist = -Infinity;
  points.forEach(function (p) {
    const pointDir = p.clone().sub(camera.position);
    const cos = pointDir.dot(dirCamera) / pointDir.length(); // Dircamera length is 1
    const dist = p.distanceTo(camera.position) * cos;
    if (minDist > dist) minDist = dist;
    if (maxDist < dist) maxDist = dist;
  });

  const epsilon = 10;
  camera.near = Math.max(minDist - epsilon, 0.000001);
  camera.far = maxDist + epsilon;

  camera.updateProjectionMatrix();
}

/**
 * Move camera transform so the rectangle define by min & max (in the xy plane) fit the entire screen
 *
 * @param {THREE.PerspectiveCamera} camera - camera to update
 * @param {THREE.Vector2} min - min coord of the rectangle
 * @param {THREE.Vector2} max - max coord of the rectangle
 * @todo rectangle is not force to be in xy plane
 */
export function cameraFitRectangle(camera, min, max) {
  const center = min.clone().lerp(max, 0.5);
  const width = max.x - min.x;
  const height = max.y - min.y;
  const fov = camera.fov * (Math.PI / 180); // fov radian
  const fovh = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
  const dx = Math.abs(height / 2 / Math.tan(fovh / 2));
  const dy = Math.abs(width / 2 / Math.tan(fov / 2));
  const distance = Math.max(dx, dy);

  camera.position.copy(center);
  camera.position.z = distance;
  camera.rotation.set(0, 0, -Math.PI / 2);
  camera.updateProjectionMatrix();
}
/**
 * Traverse a THREE.Object3D and append in each Object3D children a THREE.LineSegment geometry  representing its wireframe
 *
 * @param {THREE.Object3D} object3D  An Object3D from three
 * @param {number} threshOldAngle  An edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.
 */
export function appendWireframeToObject3D(object3D, threshOldAngle = 30) {
  object3D.traverse((child) => {
    if (
      child.geometry &&
      child.geometry.isBufferGeometry &&
      !child.userData.isWireframe &&
      !child.userData.hasWireframe
    ) {
      // This bool avoid to create multiple wireframes for one geometry
      child.userData.hasWireframe = true;

      // THREE.EdgesGeometry needs triangle indices to be created.
      // Create a new array for the indices
      const indices = [];

      // Iterate over every group of three vertices in the unindexed mesh and add the corresponding indices to the indices array
      for (let i = 0; i < child.geometry.attributes.position.count; i += 3) {
        indices.push(i, i + 1, i + 2);
      }
      child.geometry.setIndex(indices);

      // Create wireframes
      const geomEdges = new THREE.EdgesGeometry(child.geometry, threshOldAngle);
      const mat = new THREE.LineBasicMaterial({
        color: 0x000000,
      });
      const wireframe = new THREE.LineSegments(geomEdges, mat);
      wireframe.userData.isWireframe = true;
      child.add(wireframe);
    }
  });
}

/**
 * Traverse a THREE.Object3D and append in each Object3D children a THREE.LineSegment geometry  representing its wireframe.
 * Each wireframe geometry will keep the associated attribute value.
 *
 * @param {THREE.Object3D} object3D  An Object3D from three
 * @param {string} nameOfGeometryAttribute The attribute used to split each geometry of the BufferGeometry
 * @param {number} threshOldAngle  An edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.
 */
export function appendWireframeByGeometryAttributeToObject3D(
  object3D,
  nameOfGeometryAttribute,
  threshOldAngle = 30
) {
  object3D.traverse((child) => {
    if (
      child.geometry &&
      child.geometry.isBufferGeometry &&
      !child.userData.isWireframe &&
      !child.userData.hasWireframe
    ) {
      // This event can be triggered multiple times, even when the geometry is loaded.
      // This bool avoid to create multiple wireframes for one geometry
      child.userData.hasWireframe = true;

      // Get the geometry that have the same value in the geometric attribute to create its own wireframe
      let startIndex = 0;

      // Position array that will be filled with each geometry
      const pos = new Array();

      // Array that will be filled with the geometric attribute
      const attributeArray = new Array();

      // Iterate through each geometry
      for (
        let i = 1;
        i < child.geometry.attributes[nameOfGeometryAttribute].count;
        i++
      ) {
        if (
          child.geometry.attributes[nameOfGeometryAttribute].array[i - 1] !=
          child.geometry.attributes[nameOfGeometryAttribute].array[i]
        ) {
          const positionByAttribute = new THREE.BufferAttribute(
            child.geometry.attributes.position.array.slice(startIndex, i * 3),
            3
          );

          // Get all points that have the same value of the "nameOfGeometryAttribute"
          const mesh = new THREE.BufferGeometry();
          mesh.setAttribute('position', positionByAttribute);

          // THREE.EdgesGeometry needs triangle indices to be created.
          // Create a new array for the indices
          const indices = [];

          // Iterate over every group of three vertices in the unindexed mesh and add the corresponding indices to the indices array
          for (let j = 0; j < mesh.attributes.position.count; j += 3) {
            indices.push(j, j + 1, j + 2);
          }
          mesh.setIndex(indices);

          // Create the wireframe geometry
          const edges = new THREE.EdgesGeometry(mesh, threshOldAngle);

          // Add this wireframe geometry to the global wireframe geometry
          for (let l = 0; l < edges.attributes.position.count * 3; l++)
            pos.push(edges.attributes.position.array[l]);
          // Fill the attribute buffer
          for (let l = 0; l < edges.attributes.position.count; l++)
            attributeArray.push(
              child.geometry.attributes[nameOfGeometryAttribute].array[i - 1]
            );

          startIndex = i * 3;
        }
      }

      const mat = new THREE.LineBasicMaterial({ color: 0x000000 });
      const geomEdges = new THREE.EdgesGeometry();
      geomEdges.setAttribute(
        'position',
        new THREE.BufferAttribute(Float32Array.from(pos), 3)
      );
      const wireframe = new THREE.LineSegments(geomEdges, mat);
      wireframe.geometry.setAttribute(
        nameOfGeometryAttribute,
        new THREE.BufferAttribute(Int32Array.from(attributeArray), 1)
      );
      wireframe.userData.isWireframe = true;
      child.add(wireframe);
    }
  });
}
