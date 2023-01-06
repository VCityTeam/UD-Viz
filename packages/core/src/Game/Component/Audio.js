const { Component, Model } = require('./Component');

/**
 * Audio object3D component
 */
const AudioComponent = class extends Component {};

AudioComponent.TYPE = 'Audio';

const AudioModel = class extends Model {
  /**
   * Audio model component
   *
   * @param {object} json - json object to configure model
   * @param {string} json.uuid - uuid model
   * @param {string[]=} json.sounds - array of sound id needed for this component
   * @param {object} json.conf - configuration of sounds
   */
  constructor(json) {
    super(json);

    /** @type {string[]} - array of sound id needed for this component */
    this.soundsJSON = json.sounds || [];

    /** @type {object} - configuration of sounds */
    this.conf = json.conf || {};
  }

  /**
   *
   * @returns {string[]} - sounds id model
   */
  getSoundsJSON() {
    return this.soundsJSON;
  }

  /**
   *
   * @returns {object} - configuration model
   */
  getConf() {
    return this.conf;
  }

  /**
   *
   * @returns {object} - export model to json object
   */
  toJSON() {
    return {
      uuid: this.uuid,
      sounds: this.soundsJSON,
      conf: this.conf,
      type: AudioModel.TYPE,
    };
  }
};

module.exports = { Component: AudioComponent, Model: AudioModel };
