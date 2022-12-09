import { Controller } from '@ud-viz/core/src/Game/GameObject/Components/Component';

export class RenderController extends Controller {
  constructor(
    assetsManager,
    model,
    object3D,
    animations,
    animationMixer,
    actions
  ) {
    super(assetsManager, model);

    /** @type {THREE.Object3D} */
    this.object3D = object3D;

    /** @type {THREE.AnimationClip[]} */
    this.animations = animations;

    /** @type {THREE.AnimationMixer} */
    this.animationMixer = animationMixer;

    // map
    this.actions = actions;
  }

  tick(dt) {
    if (this.animationMixer) {
      this.animationMixer.update(dt * 0.001);
    }
  }

  setIdRenderData(idRenderData) {
    console.log('TODO');
    gRenderComp.initAssets(_this.getAssetsManager());
  }
}
