const { Model } = require('./Component');

/**
 *  Component used to handle the 3D Audio of the GameObject
 */
const AudioModelModule = class AudioModel extends Model {
  constructor(json) {
    super(json);

    this.soundsJSON = json.sounds || [];

    this.conf = json.conf || {};
  }

  getSoundsJSON() {
    return this.soundsJSON;
  }

  getConf() {
    return this.conf;
  }

  /**
   * This component cant run on server side
   *
   * @returns {boolean}
   */
  isWorldComponent() {
    return false;
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
      type: AudioModelModule.TYPE,
    };
  }
};

AudioModelModule.TYPE = 'Audio';

module.exports = { Model: AudioModelModule };
