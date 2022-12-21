import { Controller } from '@ud-viz/core/src/Game/GameObject/Components/Component';

export class AudioController extends Controller {
  constructor(assetsManager, model, parentGo) {
    super(assetsManager, model, parentGo);

    this.sounds = {};
    this.model.getSoundsJSON().forEach((idS) => {
      this.sounds[idS] = this.assetsManager.createSound(
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

  tick(cameraMatrixWorldInverse, refOrigin) {
    for (const key in this.sounds) {
      const sound = this.sounds[key];

      if (sound.state() != 'loaded') continue;

      if (this.model.getConf().autoplay && !sound.playing()) sound.play();
      if (this.model.getConf().volume)
        sound.volume(this.model.getConf().volume);

      // https://github.com/goldfire/howler.js#documentation
      if (this.model.getConf().spatialized) {
        const goPos = this.parentGameObject.getPosition().clone();
        goPos.add(refOrigin);
        const positionAudio = goPos
          .clone()
          .applyMatrix4(cameraMatrixWorldInverse);
        sound.pos(positionAudio.x, positionAudio.y, positionAudio.z);
      }
    }
  }
}
