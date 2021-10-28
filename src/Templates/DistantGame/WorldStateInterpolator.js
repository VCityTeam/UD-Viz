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

    //DEBUG
    this.lastTimeState = 0;

    //local game
    this.localComputer = localComputer;
    if (localComputer) {
      //register itself in the localcomputer
      const _this = this;
      _this.onFirstState(localComputer.computeCurrentState());
      localComputer.addAfterTickRequester(function () {
        _this._onNewState(localComputer.computeCurrentState());
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
  _onNewState(state) {
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

    /*state.getGameObject().traverse(function (g) {
      if (g.name == 'ButterflyArea') {
        
        console.log(g.getComponent("LocalScript").conf);
      }
    });*/

    // Keep only one worldstate before the current server time
    const index = this._computeIndexBaseState();
    if (index > 0) {
      this.states.splice(0, index);
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
    this._onNewState(newState);
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
    this._onNewState(state);
  }

  //StateComputer INTERFACE

  /**
   * wrapper function
   */
  stop() {}

  /**
   * Compute the current world state
   * @returns {WorldState}
   */
  computeCurrentState() {
    if (!this.firstServerTimestamp) {
      return null;
    }

    const index = this._computeIndexBaseState();

    const serverTime = this._computeCurrentServerTime();

    // If base is the most recent update we have, use its state.
    // Otherwise, interpolate between its state and the state of (base + 1).
    if (index < 0 || index === this.states.length - 1) {
      return this._getLastStateReceived();
    } else {
      const baseState = this.states[index];
      const nextState = this.states[index + 1];
      const ratio =
        (serverTime - baseState.getTimestamp()) /
        (nextState.getTimestamp() - baseState.getTimestamp());
      return WorldState.interpolate(baseState, nextState, ratio);
    }
  }

  computeCurrentStates(){

  }
}
