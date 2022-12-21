const THREE = require('three');

/**
 * Set of class/function for a high level use of THREE.js
 */
module.exports = {
  /**
   * Texture encoding used to have the right color of the .glb model + have an alpha channel
   */
  textureEncoding: THREE.sRGBEncoding,

  addCubeTexture: function (paths, scene) {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load(paths);
    scene.background = texture;
  },

  /**
   * Add default lights to a scenedebugger;
   * one directional and one ambient
   *
   * @param {THREE.Scene} scene the scene where to add lights
   * @returns {THREE.DirectionalLight, THREE.AmbientLight} lights added
   */
  addLights: function (scene) {
    // Lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(100, 100, 500);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.updateMatrixWorld();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    return { directionalLight: directionalLight, ambientLight: ambientLight };
  },

  /**
   * Initialize the webgl renderer with default values
   *
   * @param {THREE.WebGLRenderer} renderer the renderer to init
   * @param {THREE.Color} skyColor clear color of the scene
   * @param {boolean} clear autoclear, default is false
   */
  initRenderer: function (renderer, skyColor, clear = false) {
    // Set sky color to blue
    renderer.setClearColor(skyColor, 1);
    renderer.autoClear = clear;
    renderer.autoClearColor = clear;
    renderer.outputEncoding = this.textureEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    // To antialias the shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  },

  /**
   * Place the directional light in order its shadow camera fit the object
   *
   * @param {number} offset distance from the bounding sphere of the object to the light
   * @param {number} phi phi of spherical coord in radian
   * @param {number} theta theta of spherical coord in radian
   * @param {THREE.Object3D} obj the object to fit inside the projection plane of the shadow camera
   * @param {THREE.DirectionalLight} dirLight the light with the shadow camera
   */
  bindLightTransform: function (offset, phi, theta, obj, dirLight) {
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
  },

  /**
   *
   * @param {*} camera
   * @param {*} min
   * @param {*} max
   */
  computeNearFarCamera: function (camera, min, max) {
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

    camera.near = Math.max(minDist, 0.000001);
    camera.far = maxDist;

    camera.updateProjectionMatrix();
  },
};
