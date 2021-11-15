/** @format */
import WorldState from '../../Game/Shared/WorldState';

/**
 * StateComputer working with a distant server
 * Interpolate states received by server
 * Same system as described here (https://victorzhou.com/blog/build-an-io-game-part-1/#7-client-state)
 */
export class WorldStateInterpolator {
  constructor(config, localComputer) {
    this.config = config;

    //internal
    this.states = [];
    this.gameStart = 0;
    this.firstServerTimestamp = 0;

    //batch
    this._notConsumedStates = [];

    //DEBUG
    this.lastTimeState = 0;

    //local game optional (could work with a distant computer via websocket)
    this.localComputer = localComputer;
    if (localComputer) {
      //register itself in the localcomputer
      const _this = this;
      _this.onFirstState(localComputer.computeCurrentState());
      localComputer.addAfterTickRequester(function () {
        _this.onNewState(localComputer.computeCurrentState());
      });
    }
  }

  /**
   *
   * @returns {Number} delay with the server
   */
  _getDelay() {
    if (this.config && this.config.renderDelay) return this.config.renderDelay;
    return 0;
  }

  /**
   * Add a new state
   * @param {WorldState} state
   */
  onNewState(state, force = false) {
    if (!state) {
      throw new Error('no state');
    }

    //DEBUG
    let now = Date.now();
    let dState = now - this.lastTimeState;
    this.lastTimeState = now;
    // console.log('state received last one was ', dState, ' ms ago');
    if (dState > this._getDelay()) console.warn('Server delay');

    this.states.push(state);

    // Keep only one worldstate before the current server time
    let index;
    force
      ? (index = this._computeIndexBaseState())
      : (index = this.states.length - 1);

    if (index > 0) {
      const stateDeleted = this.states.splice(0, index);
      for (let iStateDel = 0; iStateDel < stateDeleted.length; iStateDel++) {
        const element = stateDeleted[iStateDel];
        if (!element.hasBeenConsumed()) this._notConsumedStates.push(element); //register states not consumed
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
   * @returns {Number} the current server time
   */
  _computeCurrentServerTime() {
    return (
      this.firstServerTimestamp + Date.now() - this.gameStart - this._getDelay()
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
   * @param {WorldStateDiff} diff
   */
  onNewDiff(diff) {
    let last = this._getLastStateReceived();
    if (!last) throw new Error('no last state');
    let newState = last.add(diff);
    this.onNewState(newState);
  }

  /**
   * Init the computer with a first state
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
}
