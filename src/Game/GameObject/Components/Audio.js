/** @format */

const THREE = require('three');

/**
 *  Component used to handle the 3D Audio of the GameObject
 */
const AudioModule = class Audio {
  constructor(parent, json) {
    // Gameobject of this component
    this.parent = parent;
    // Uuid
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();

    this.soundsJSON = json.sounds || [];
    this.sounds = {};

    this.conf = json.conf || {};
  }

  getSounds() {
    return this.sounds;
  }

  /**
   * This component cant run on server side
   *
   * @returns {boolean}
   */
  isServerSide() {
    return false;
  }

  dispose() {
    for (const key in this.sounds) {
      this.sounds[key].unload();
    }
  }

  /**
   * Add dynamically a sound to the comp
   *
   * @param {string} id
   * @param {AssetsManager} assetsManager
   */
  addSound(id, assetsManager) {
    if (this.soundsJSON.includes(id)) {
      console.warn(id, ' already in audio comp');
      return;
    }

    this.soundsJSON.push(id);
    this.sounds[id] = assetsManager.createSound(id, this.conf);
  }

  /**
   * Remove all sounds of the comp
   */
  reset() {
    this.dispose();
    this.soundsJSON = [];
    this.sounds = {};
  }

  /**
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    return {
      uuid: this.uuid,
      sounds: this.soundsJSON,
      conf: this.conf,
      type: AudioModule.TYPE,
    };
  }

  /**
   * Initialize
   *
   * @param {AssetsManager} assetsManager local assetsManager
   */
  initAssets(assetsManager) {
    const _this = this;
    this.soundsJSON.forEach(function (idS) {
      _this.sounds[idS] = assetsManager.createSound(idS, _this.conf);
    });
  }

  tick(cameraMatrixWorldInverse, refOrigin) {
    for (const key in this.sounds) {
      const sound = this.sounds[key];

      if (sound.state() != 'loaded') continue;

      if (this.conf.autoplay && !sound.playing()) sound.play();
      if (this.conf.volume) sound.volume(this.conf.volume);

      // https://github.com/goldfire/howler.js#documentation
      if (this.conf.spatialized) {
        const goPos = this.parent.getPosition().clone();
        goPos.add(refOrigin);
        const positionAudio = goPos
          .clone()
          .applyMatrix4(cameraMatrixWorldInverse);

        sound.pos(positionAudio.x, positionAudio.y, positionAudio.z);
      }
    }
  }

  getUUID() {
    return this.uuid;
  }
};

AudioModule.TYPE = 'Audio';

module.exports = AudioModule;
