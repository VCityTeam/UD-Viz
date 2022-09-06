/** @format */
const WorldState = require('./WorldState');

/**
 * StateComputer working with a distant server
 * Interpolate states received by server
 * Same system as described here (https://victorzhou.com/blog/build-an-io-game-part-1/#7-client-state)
 */
module.exports = class WorldStateInterpolator {
  constructor(renderDelay, localComputer) {
    //Delay between state received and state computed
    this.renderDelay = renderDelay;

    //Internal
    this.states = [];
    this.gameStart = 0;
    this.firstServerTimestamp = 0;

    //Batch
    this._notConsumedStates = [];

    //Ping attr computation
    this.lastTimeState = 0; //Buffer
    this.ping = 0; //Time between two new state

    //local game optional (could work with a distant computer via websocket)
    this.localComputer = localComputer;
    if (localComputer) {
      //Register itself in the localcomputer
      const _this = this;
      _this.onFirstState(localComputer.computeCurrentState());
      localComputer.addAfterTickRequester(function () {
        _this.onNewState(localComputer.computeCurrentState());
      });
    }
  }

  /**
   *
   * @returns {number} delay with the server
   */
  getRenderDelay() {
    return this.renderDelay;
  }

  //Time between two new state
  getPing() {
    return this.ping;
  }

  /**
   * Add a new state
   *
   * @param {WorldState} state
   */
  onNewState(state) {
    if (!state) {
      throw new Error('no state');
    }

    //Compute ping
    const now = Date.now();
    this.ping = now - this.lastTimeState;
    this.lastTimeState = now;

    this.states.push(state);

    // Keep only one worldstate before the current server time
    const index = this._computeIndexBaseState();

    if (index > 0) {
      const stateDeleted = this.states.splice(0, index);
      for (let iStateDel = 0; iStateDel < stateDeleted.length; iStateDel++) {
        const element = stateDeleted[iStateDel];
        if (!element.hasBeenConsumed()) this._notConsumedStates.push(element); //Register states not consumed
      }
    }
  }

  /**
   *
   * @returns {WorldState} the last state received by the server
   */
  _getLastStateReceived() {
    return this.states[this.states.length - 1];
  }

  /**
   *
   * @returns {number} the current server time
   */
  _computeCurrentServerTime() {
    return (
      this.firstServerTimestamp +
      Date.now() -
      this.gameStart -
      this.getRenderDelay()
    );
  }

  /**
   *
   * @returns {Integer} the index of the first worldstate before server time
   */
  _computeIndexBaseState() {
    const serverTime = this._computeCurrentServerTime();
    for (let i = this.states.length - 1; i >= 0; i--) {
      if (this.states[i].getTimestamp() <= serverTime) {
        return i;
      }
    }
    return -1;
  }

  //PUBLIC METHODS

  //local computer wrapper methods

  getLocalComputer() {
    return this.localComputer;
  }

  getWorldContext() {
    return this.localComputer.getWorldContext();
  }

  addAfterTickRequester(cb) {
    return this.localComputer.addAfterTickRequester(cb);
  }

  onCommands(cmds) {
    return this.localComputer.onCommands(cmds);
  }

  /**
   * Add a new diff to compute a new state
   *
   * @param {WorldStateDiff} diff
   */
  onNewDiff(diff) {
    const last = this._getLastStateReceived();
    if (!last) throw new Error('no last state');
    const newState = last.add(diff);
    this.onNewState(newState);
  }

  /**
   * Init the computer with a first state
   *
   * @param {WorldState} state the first state received
   */
  onFirstState(state) {
    this.firstServerTimestamp = state.getTimestamp();
    this.gameStart = Date.now();
    this.states.length = 0;
    this.lastTimeState = 0;
    this.onNewState(state);
  }

  //StateComputer INTERFACE

  /**
   * stop localcomputer if one
   */
  stop() {
    if (this.localComputer) this.localComputer.stop();
  }

  /**
   * Compute the current world state
   *
   * @returns {WorldState}
   */
  computeCurrentState() {
    if (!this.firstServerTimestamp) {
      return null;
    }

    let result;

    const index = this._computeIndexBaseState();

    const serverTime = this._computeCurrentServerTime();

    // If base is the most recent update we have, use its state.
    // Otherwise, interpolate between its state and the state of (base + 1).
    if (index < 0 || index === this.states.length - 1) {
      result = this._getLastStateReceived();
      result.setConsumed(true);
    } else {
      const baseState = this.states[index];
      baseState.setConsumed(true);
      const nextState = this.states[index + 1];
      const ratio =
        (serverTime - baseState.getTimestamp()) /
        (nextState.getTimestamp() - baseState.getTimestamp());
      result = WorldState.interpolate(baseState, nextState, ratio);
    }

    return result;
  }

  //When a view need the current it's called this function
  computeCurrentStates() {
    const result = this._notConsumedStates;
    this._notConsumedStates = [];
    result.push(this.computeCurrentState());
    return result;
  }
};
