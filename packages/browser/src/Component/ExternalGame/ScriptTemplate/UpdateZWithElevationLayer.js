import { ExternalScriptBase } from '../Context';
import * as THREE from 'three';
import { Command, Game, JSONUtil } from '@ud-viz/core';
const itowns = require('itowns');

const defaultVariables = {
  nameGO2UpdateZ: null,
  updateZCrs: 'EPSG:3946', // this is used to project avatar on elevation layer
};

export class UpdateZWithElevationLayer extends ExternalScriptBase {
  constructor(context, object3D, variables) {
    // Overwrite variables
    const overWriteVariables = JSON.parse(JSON.stringify(defaultVariables));
    JSONUtil.overWrite(overWriteVariables, variables);
    super(context, object3D, overWriteVariables);
  }

  tick() {
    const go = this.context.object3D.getObjectByProperty(
      'name',
      this.variables.nameGO2UpdateZ
    );

    if (!go) throw 'no go to update';

    if (!this.context.frame3D.itownsView)
      throw new Error('need a frame3D planar');

    const parentGOWorldPos = new THREE.Vector3();
    go.parent.matrixWorld.decompose(
      parentGOWorldPos,
      new THREE.Quaternion(),
      new THREE.Vector3()
    );
    const goWorldPos = new THREE.Vector3();
    go.matrixWorld.decompose(
      goWorldPos,
      new THREE.Quaternion(),
      new THREE.Vector3()
    );
    const elevation = itowns.DEMUtils.getElevationValueAt(
      this.context.frame3D.itownsView.tileLayer,
      new itowns.Coordinates(this.variables.updateZCrs, goWorldPos),
      1 // PRECISE_READ_Z
    );

    // Add commands to the computer directly because not produce by the inputmanager
    this.context.sendCommandToGameContext([
      new Command({
        type: Game.CONSTANT.Z_UPDATE,
        data: elevation - parentGOWorldPos.z,
      }),
    ]);
  }
}
