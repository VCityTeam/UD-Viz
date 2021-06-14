/** @format */

const THREE = require('three');

module.exports = {
  textureEncoding: THREE.RGBDEncoding,

  addLights(scene) {
    //lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(100, 100, 500);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.updateMatrixWorld();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    return { directionalLight, ambientLight };
  },

  initRenderer(renderer, skyColor, clear = false) {
    // Set sky color to blue
    renderer.setClearColor(skyColor, 1);
    renderer.autoClear = clear;
    renderer.autoClearColor = clear;

    renderer.outputEncoding = this.textureEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    // to antialias the shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // renderer.toneMapping = THREE.ReinhardToneMapping;
    // renderer.toneMappingExposure = 1;
  },

  bindLightTransform(offset, phi, theta, obj, dirLight) {
    // computing boundingSphere
    const bb = new THREE.Box3().setFromObject(obj);
    const center = bb.getCenter(new THREE.Vector3());
    const bsphere = bb.getBoundingSphere(new THREE.Sphere(center));
    const sphericalPoint = new THREE.Spherical(
      bsphere.radius + offset,
      phi,
      theta
    );

    // set the light's target
    dirLight.target.position.copy(center);
    dirLight.target.updateMatrixWorld();

    // convert spherical coordinates in cartesian
    const vecLightPos = new THREE.Vector3();
    vecLightPos.setFromSpherical(sphericalPoint);
    vecLightPos.add(dirLight.target.position);

    // place directionnal lights
    dirLight.position.copy(vecLightPos);
    dirLight.updateMatrixWorld();

    // set up camera that computes the shadow map
    const cameraShadow = dirLight.shadow.camera;
    cameraShadow.near = offset;
    cameraShadow.far = offset + bsphere.radius * 2;
    cameraShadow.top = bsphere.radius;
    cameraShadow.right = bsphere.radius;
    cameraShadow.left = -bsphere.radius;
    cameraShadow.bottom = -bsphere.radius;
    cameraShadow.updateProjectionMatrix();
  },

  Transform: class Transform {
    constructor(position, rotation, scale) {
      this.position = position || new THREE.Vector3();
      this.rotation = rotation || new THREE.Vector3();
      this.scale = scale || new THREE.Vector3(1, 1, 1);
    }

    getPosition() {
      return this.position;
    }

    setPosition(position) {
      this.position = position;
    }

    getRotation() {
      return this.rotation;
    }

    setRotation(rotation) {
      this.rotation = rotation;
    }

    getScale() {
      return this.scale;
    }

    setScale(scale) {
      this.scale = scale;
    }

    clone() {
      return new Transform(
        this.position.clone(),
        this.rotation.clone(),
        this.scale.clone()
      );
    }

    lerp(transform, ratio) {
      this.position.lerp(transform.getPosition(), ratio);
      this.rotation.lerp(transform.getRotation(), ratio);
      this.scale.lerp(transform.getScale(), ratio);
    }

    toJSON() {
      return {
        position: this.position.toArray(),
        rotation: this.rotation.toArray(),
        scale: this.scale.toArray(),
      };
    }

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
