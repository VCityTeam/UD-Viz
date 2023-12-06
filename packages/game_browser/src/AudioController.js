import { AssetManager } from './AssetManager';

import { Model, Object3D, Controller } from '@ud-viz/game_shared';
import { Howl } from 'howler';
import { Vector3, Quaternion } from 'three';

const _quaternion = new Quaternion();
const _scale = new Vector3();

/** @class */
export class AudioController extends Controller {
  /**
   * Audio component controller
   *
   * @param {Model} model - component model
   * @param {Object3D} object3D - object3D of component
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
      if (!isNaN(this.model.getConf().volume))
        this.sounds[idS].volume(this.model.getConf().volume);
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
      if (this.sounds[key].state() == 'loaded') {
        this.sounds[key].unload();
      }
      delete this.sounds[key];
    }
  }

  /**
   * Tick controller
   *
   * @param {Vector3} cameraWorldPosition - camera World Position
   */
  tick(cameraWorldPosition) {
    for (const key in this.sounds) {
      /** @type {Howl} */
      const sound = this.sounds[key];

      if (sound.state() != 'loaded') continue;

      if (this.model.getConf().autoplay && !sound.playing()) sound.play();

      // https://github.com/goldfire/howler.js#documentation
      if (this.model.getConf().spatialized) {
        // compute world position
        const worldPosition = new Vector3();
        this.object3D.matrixWorld.decompose(worldPosition, _quaternion, _scale);
        // in camera referential
        const positionAudio = worldPosition.sub(cameraWorldPosition);
        console.log(positionAudio);
        sound.pos(positionAudio.x, positionAudio.y, positionAudio.z);
      }
    }
  }
}
