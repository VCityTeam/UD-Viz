const { Component, Model } = require('./Component');

/**
 * Audio object3D component
 *
 * @see module:Audio
 * @class
 */
const AudioComponent = class extends Component {};

AudioComponent.TYPE = 'Audio';

/**
 * Audio object3D ModelComponent
 *
 * @see module:Audio
 * @class
 */
const AudioModel = class extends Model {
  /**
   * Audio model component
   *
   * @param {object} json - json object to configure model
   * @param {string} json.uuid - uuid model
   * @param {string[]} [json.sounds] - array of sound id needed for this component
   * @param {object} json.conf - configuration of sounds
   */
  constructor(json) {
    super(json);

    /**
     * array of sound id needed for this component
     *
     * @type {string[]}
     */
    this.soundsJSON = json.sounds || [];

    /**
     * configuration of sounds
     *
     * @type {object}
     */
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

/**
 * `MODULE` Audio
 *
 * @exports Audio
 */
module.exports = {
  /** @see AudioComponent */
  Component: AudioComponent,
  /** @see AudioModel */
  Model: AudioModel,
};
