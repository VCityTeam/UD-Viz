import { ExternalScriptBase, Context } from '../Context';
import * as THREE from 'three';
import { Command, Game, Data } from '@ud-viz/core';
const itowns = require('itowns');

/**
 * @typedef UpdateZWithElevationLayerVariables
 * @property {string} nameGO2UpdateZ - name of the game object3D to update z with elevation layer
 * @property {string} updateZCrs - projection used to compute elevation with itowns.DEMUtils.getElevationValueAt
 */

/** @type {UpdateZWithElevationLayerVariables} - default variables */
const defaultVariables = {
  nameGO2UpdateZ: null,
  updateZCrs: 'EPSG:3946',
};

export class UpdateZWithElevationLayer extends ExternalScriptBase {
  /**
   * Send command to game context to update z position with an itowns elevation layer
   *
   * @param {Context} context - external game context
   * @param {Game.Object3D} object3D - object3D of this script
   * @param {UpdateZWithElevationLayerVariables} variables - variables {@link UpdateZWithElevationLayerVariables}
   */
  constructor(context, object3D, variables) {
    // Overwrite variables
    const overWriteVariables = JSON.parse(JSON.stringify(defaultVariables));
    Data.objectOverWrite(overWriteVariables, variables);
    super(context, object3D, overWriteVariables);
  }

  /**
   * Compute relative z position of object3D identify by nameGO2UpdateZ and send command Game.CONSTANT.Z_UPDATE with the elevation
   */
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

    this.context.sendCommandToGameContext([
      new Command({
        type: Game.CONSTANT.Z_UPDATE,
        data: elevation - parentGOWorldPos.z,
      }),
    ]);
  }
}
