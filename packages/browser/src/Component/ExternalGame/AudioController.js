import { Game } from '@ud-viz/core';
const THREE = require('three');

export class AudioController extends Game.Component.Controller {
  constructor(model, object3D, assetManager) {
    super(model, object3D);

    this.assetManager = assetManager;

    this.sounds = {};
    this.model.getSoundsJSON().forEach((idS) => {
      this.sounds[idS] = this.assetManager.createSound(
        idS,
        this.model.getConf()
      );
    });
  }

  play(id) {
    this.sounds[id].play();
  }

  getSounds() {
    return this.sounds;
  }

  dispose() {
    for (const key in this.sounds) {
      this.sounds[key].unload();
      delete this.sounds[key];
    }
  }

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
