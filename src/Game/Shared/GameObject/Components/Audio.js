/** @format */

// https://github.com/goldfire/howler.js#documentation
const Howler = require('howler');
const THREE = require('three');

/**
 * TODO import once the sound and clone it woth assetsmanager
 */

/**
 *  Component used to handle the 3D Audio of the GameObject
 */
const AudioModule = class Audio {
  constructor(parent, json) {
    //gameobject of this component
    this.parent = parent;
    //uuid
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();

    this.soundsJSON = json.sounds || [];
    this.sound = null;
  }

  createSounds() {
    this.sound = new Howler.Howl({ src: this.soundsJSON });
  }

  getSound() {
    return this.sound;
  }

  /**
   * This component cant run on server side
   * @returns {Boolean}
   */
  isServerSide() {
    return false;
  }

  /**
   * Compute this to JSON
   * @returns {JSON}
   */
  toJSON() {
    return {
      uuid: this.uuid,
      sounds: this.soundsJSON,
      type: AudioModule.TYPE,
    };
  }

  /**
   * Initialize
   * @param {AssetsManager} assetsManager local assetsManager
   * @param {Shared} udvShared ud-viz/Game/Shared module
   */
  initAssets(assetsManager, udvShared) {
    this.createSounds();
  }

  getUUID() {
    return this.uuid;
  }
};

AudioModule.TYPE = 'Audio';

module.exports = AudioModule;
