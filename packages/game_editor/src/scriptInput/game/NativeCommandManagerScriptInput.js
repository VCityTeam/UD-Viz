import { createLabelInput } from '@ud-viz/utils_browser';
import { ScriptInput } from '../..';
import { NativeCommandManager } from '@ud-viz/game_shared_template';

export class NativeCommandManagerScriptInput extends ScriptInput {
  init() {
    const angleMin = createLabelInput('Angle min: ', 'range');
    this.domElement.appendChild(angleMin.parent);
    angleMin.input.min = -Math.PI;
    angleMin.input.max = Math.PI;
    angleMin.input.step = 'any';
    angleMin.input.value = this.variables.angleMin;
    angleMin.input.oninput = () => {
      this.variables.angleMin = angleMin.input.valueAsNumber;
    };

    const angleMax = createLabelInput('Angle max: ', 'range');
    this.domElement.appendChild(angleMax.parent);
    angleMax.input.min = -Math.PI;
    angleMax.input.max = Math.PI;
    angleMax.input.step = 'any';
    angleMax.input.value = this.variables.angleMax;
    angleMax.input.oninput = () => {
      this.variables.angleMax = angleMax.input.valueAsNumber;
    };

    const speedRotate = createLabelInput('Default speed rotate: ', 'number');
    this.domElement.appendChild(speedRotate.parent);
    speedRotate.input.step = 0.00001;
    speedRotate.input.value = this.variables.defaultSpeedRotate;
    speedRotate.input.oninput = () => {
      this.variables.defaultSpeedRotate = speedRotate.input.valueAsNumber;
    };

    const speedTranslate = createLabelInput(
      'Default speed translate: ',
      'number'
    );
    this.domElement.appendChild(speedTranslate.parent);
    speedTranslate.input.step = 0.01;
    speedTranslate.input.value = this.variables.defaultSpeedTranslate;
    speedTranslate.input.oninput = () => {
      this.variables.defaultSpeedTranslate = speedTranslate.input.valueAsNumber;
    };
  }

  static get ID_EDIT_SCRIPT() {
    return NativeCommandManager.ID_SCRIPT;
  }
}
