import { createLabelInput } from '@ud-viz/utils_browser';
import { NativeCommandManager } from '@ud-viz/game_shared_template';
import { ObjectInput } from '../../..';

export class NativeCommandManagerVariablesInput extends ObjectInput {
  init() {
    const angleMin = createLabelInput('Angle min: ', 'range');
    this.domElement.appendChild(angleMin.parent);
    angleMin.input.min = -Math.PI;
    angleMin.input.max = Math.PI;
    angleMin.input.step = 'any';
    angleMin.input.value =
      this.object.angleMin != undefined
        ? this.object.angleMin
        : NativeCommandManager.DEFAULT_VARIABLES.angleMin;
    angleMin.input.oninput = () => {
      this.object.angleMin = angleMin.input.valueAsNumber;
    };

    const angleMax = createLabelInput('Angle max: ', 'range');
    this.domElement.appendChild(angleMax.parent);
    angleMax.input.min = -Math.PI;
    angleMax.input.max = Math.PI;
    angleMax.input.step = 'any';
    angleMax.input.value =
      this.object.angleMax != undefined
        ? this.object.angleMax
        : NativeCommandManager.DEFAULT_VARIABLES.angleMax;
    angleMax.input.oninput = () => {
      this.object.angleMax = angleMax.input.valueAsNumber;
    };

    const speedRotate = createLabelInput('Default speed rotate: ', 'number');
    this.domElement.appendChild(speedRotate.parent);
    speedRotate.input.step = 0.00001;
    speedRotate.input.value =
      this.object.defaultSpeedRotate != undefined
        ? this.object.defaultSpeedRotate
        : NativeCommandManager.DEFAULT_VARIABLES.defaultSpeedRotate;
    speedRotate.input.oninput = () => {
      this.object.defaultSpeedRotate = speedRotate.input.valueAsNumber;
    };

    const speedTranslate = createLabelInput(
      'Default speed translate: ',
      'number'
    );
    this.domElement.appendChild(speedTranslate.parent);
    speedTranslate.input.step = 0.01;
    speedTranslate.input.value =
      this.object.defaultSpeedTranslate != undefined
        ? this.object.defaultSpeedTranslate
        : NativeCommandManager.DEFAULT_VARIABLES.defaultSpeedTranslate;
    speedTranslate.input.oninput = () => {
      this.object.defaultSpeedTranslate = speedTranslate.input.valueAsNumber;
    };
  }

  static condition(id) {
    return id == NativeCommandManager.ID_SCRIPT;
  }
}
