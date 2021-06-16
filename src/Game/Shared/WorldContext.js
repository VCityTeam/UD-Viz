/** @format */

module.exports = class WorldContext {
  constructor(params) {
    this.assetsManager = params.assetsManager;
    this.world = params.world;
    this.dt = 0;
    this.commands = [];
    this.Shared = params.Shared;
  }

  getAssetsManager() {
    return this.assetsManager;
  }

  getWorld() {
    return this.world;
  }

  setWorld(world) {
    this.world = world;
  }

  getDt() {
    return this.dt;
  }

  setDt(value) {
    this.dt = value;
  }

  getCommands() {
    return this.commands;
  }

  setCommands(value) {
    this.commands = value;
  }

  getSharedModule() {
    return this.Shared;
  }
};
