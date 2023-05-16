import * as itownsWidget from 'itowns/widgets';
import { createLabelInput } from '../HTMLUtil';

const DEFAULT_OPTIONS = {
  position: 'top-right', // should be deprecated https://github.com/iTowns/itowns/issues/2005
};

const zoomFactorMin = 0.05;
const zoomFactorMax = 6;

export class PlanarControls extends itownsWidget.Widget {
  constructor(view, options = {}) {
    super(view, options, DEFAULT_OPTIONS);

    const zoomInFactor = createLabelInput('Zoom in factor', 'range');
    this.domElement.appendChild(zoomInFactor.parent);

    zoomInFactor.input.min = 1 + zoomFactorMin;
    zoomInFactor.input.max = zoomFactorMax;
    zoomInFactor.input.step = 0.01;
    zoomInFactor.input.value = view.controls.zoomInFactor;

    zoomInFactor.input.onchange = () => {
      view.controls.zoomInFactor = zoomInFactor.input.valueAsNumber;
    };

    const zoomOutFactor = createLabelInput('Zoom out factor', 'range');
    this.domElement.appendChild(zoomOutFactor.parent);

    zoomOutFactor.input.min = 1 / zoomFactorMax;
    zoomOutFactor.input.max = 1 / (1 + zoomFactorMin);
    zoomOutFactor.input.step = 0.01;
    zoomOutFactor.input.value = view.controls.zoomOutFactor;

    zoomOutFactor.input.onchange = () => {
      // inverse min and max since its more intuitive when input value is increasing to inscrease zoom speed
      const intuitiveValue =
        -zoomOutFactor.input.valueAsNumber +
        parseFloat(zoomOutFactor.input.min) +
        parseFloat(zoomOutFactor.input.max);

      view.controls.zoomOutFactor = intuitiveValue;
    };
  }
}
