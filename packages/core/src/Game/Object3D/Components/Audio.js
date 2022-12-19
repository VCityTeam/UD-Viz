const { Component, ModelComponent } = require('./Component');

const AudioComponent = class extends Component {};

AudioComponent.TYPE = 'Audio';

/**
 *  Component used to handle the 3D Audio of the GameObject
 */
const AudioModel = class extends ModelComponent {
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
   * Compute this to JSON
   *
   * @returns {JSON}
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
