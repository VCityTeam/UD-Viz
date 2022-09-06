/** @format */

const THREE = require('three');

/**
 * Set of class/function for a high level use of THREE.js
 */
module.exports = {
  /**
   * Texture encoding used to have the right color of the .glb model + have an alpha channel
   */
  textureEncoding: THREE.sRGBEncoding,

  addCubeTexture(paths, scene) {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load(paths);
    scene.background = texture;
  },

  /**
   * Add default lights to a scene
   * one directional and one ambient
   *
   * @param {THREE.Scene} scene the scene where to add lights
   * @returns {THREE.DirectionalLight, THREE.AmbientLight} lights added
   */
  addLights(scene) {
    //Lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(100, 100, 500);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.updateMatrixWorld();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    return { directionalLight, ambientLight };
  },

  /**
   * Initialize the webgl renderer with default values
   *
   * @param {THREE.WebGLRenderer} renderer the renderer to init
   * @param {THREE.Color} skyColor clear color of the scene
   * @param {boolean} clear autoclear, default is false
   */
  initRenderer(renderer, skyColor, clear = false) {
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
  bindLightTransform(offset, phi, theta, obj, dirLight) {
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
   * Store all data to place correctly an Object into a 3D scene
   * (ie position, rotation and a scale)
   */
  Transform: class Transform {
    constructor(position, rotation, scale) {
      this.position = position || new THREE.Vector3();
      this.rotation = rotation || new THREE.Vector3();
      this.scale = scale || new THREE.Vector3(1, 1, 1);
    }

    /**
     *
     * @returns {THREE.Vector3}
     */
    getPosition() {
      return this.position;
    }

    /**
     *
     * @param {THREE.Vector3} position
     */
    setPosition(position) {
      this.position = position;
    }

    /**
     *
     * @returns {THREE.Vector3}
     */
    getRotation() {
      return this.rotation;
    }

    /**
     *
     * @param {THREE.Vector3} rotation
     */
    setRotation(rotation) {
      this.rotation = rotation;
    }

    /**
     *
     * @returns {THREE.Vector3}
     */
    getScale() {
      return this.scale;
    }

    /**
     *
     * @param {THREE.Vector3} scale
     */
    setScale(scale) {
      this.scale = scale;
    }

    /**
     * Return a clone of this
     *
     * @returns {Transform}
     */
    clone() {
      return new Transform(
        this.position.clone(),
        this.rotation.clone(),
        this.scale.clone()
      );
    }

    /**
     * Linearly interpolate between this and transform
     *
     * @param {Transform} transform to interpolate towards.
     * @param {number} ratio interpolation factor, typically in the closed interval [0, 1].
     */
    lerp(transform, ratio) {
      this.position.lerp(transform.getPosition(), ratio);
      this.rotation.lerp(transform.getRotation(), ratio);
      this.scale.lerp(transform.getScale(), ratio);
    }

    /**
     * Compute this to JSON
     *
     * @returns {JSON}
     */
    toJSON() {
      return {
        position: this.position.toArray(),
        rotation: this.rotation.toArray(),
        scale: this.scale.toArray(),
      };
    }

    /**
     * Set this from a json
     *
     * @param {JSON} json
     */
    setFromJSON(json) {
      if (json) {
        if (json.position) {
          this.position.fromArray(json.position);
        }

        if (json.rotation) {
          this.rotation.fromArray(json.rotation);
        }

        if (json.scale) {
          this.scale.fromArray(json.scale);
        }
      }
    }
  },
};
