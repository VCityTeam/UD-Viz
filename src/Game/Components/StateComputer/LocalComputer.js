/** @format */

export class LocalComputer {
  constructor(world) {
    this.world = world;
    this.currentState = world.computeWorldState();
  }

  //API
  computeCurrentState() {
    return this.currentState;
  }
}
