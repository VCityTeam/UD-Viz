import { Game } from '@ud-viz/core';
import { Howl } from 'howler';
import { AssetManager } from '../Component';
const THREE = require('three');

/** @class */
export class AudioController extends Game.Component.Controller {
  /**
   * Audio component controller
   *
   * @param {Game.Component.Model} model - component model
   * @param {Game.Object3D} object3D - object3D of component
   * @param {AssetManager} assetManager - asset manager
   */
  constructor(model, object3D, assetManager) {
    super(model, object3D);

    /**
     * asset manager 
     *
      @type {AssetManager}*/
    this.assetManager = assetManager;

    /**
     * sounds of controller
     *
       @type {Object<string,Howl>} */
    this.sounds = {};
    // initialize this.sounds with asset manager
    this.model.getSoundsJSON().forEach((idS) => {
      this.sounds[idS] = this.assetManager.createSound(
        idS,
        this.model.getConf()
      );
    });
  }

  /**
   *
   * @param {string} id - id of the sound to play
   */
  play(id) {
    this.sounds[id].play();
  }

  /**
   *
   * @returns {Object<string,Howl>} - sounds controller
   */
  getSounds() {
    return this.sounds;
  }

  /**
   * Unload all Howl sounds
   */
  dispose() {
    for (const key in this.sounds) {
      this.sounds[key].unload();
      delete this.sounds[key];
    }
  }

  /**
   * Tick controller
   *
   * @param {THREE.Matrix4} cameraMatrixWorldInverse - camera matrix world inverse
   */
  tick(cameraMatrixWorldInverse) {
    for (const key in this.sounds) {
      const sound = this.sounds[key];

      if (sound.state() != 'loaded') continue;

      if (this.model.getConf().autoplay && !sound.playing()) sound.play();
      if (this.model.getConf().volume)
        sound.volume(this.model.getConf().volume);

      // https://github.com/goldfire/howler.js#documentation
      if (this.model.getConf().spatialized) {
        const worldPosition = new THREE.Vector3();
        this.object3D.matrixWorld.decompose(worldPosition);

        // in camera referential
        const positionAudio = worldPosition.applyMatrix4(
          cameraMatrixWorldInverse
        );
        sound.pos(positionAudio.x, positionAudio.y, positionAudio.z);
      }
    }
  }
}
