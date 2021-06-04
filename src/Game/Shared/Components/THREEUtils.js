/** @format */

const THREE = require('three');

//TODO create an object Transform with a clone method

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

    setFromJSON(json) {
      if (json) {
        if (json.position) {
          this.position.x = json.position.x;
          this.position.y = json.position.y;
          this.position.z = json.position.z;
        }

        if (json.rotation) {
          this.rotation.x = json.rotation.x;
          this.rotation.y = json.rotation.y;
          this.rotation.z = json.rotation.z;
        }

        if (json.scale) {
          this.scale.x = json.scale.x;
          this.scale.y = json.scale.y;
          this.scale.z = json.scale.z;
        }
      }
    }
  },
};
