/** @format */
import WorldState from '../../Shared/WorldState';

//compute/interpolate state working with a server

export class WorldStateInterpolator {
  constructor(config) {
    this.config = config;

    //internal
    this.states = [];
    this.gameStart = 0;
    this.firstServerTimestamp = 0;

    //DEBUG
    this.lastTimeState = 0;
  }

  _getDelay() {
    if (this.config && this.config.renderDelay) return this.config.renderDelay;
    return 0;
  }

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

    // Keep only one worldstate before the current server time
    const index = this._computeIndexBaseState();
    if (index > 0) {
      this.states.splice(0, index);
    }
  }

  _getLastStateReceived() {
    return this.states[this.states.length - 1];
  }

  _computeCurrentServerTime() {
    return (
      this.firstServerTimestamp + Date.now() - this.gameStart - this._getDelay()
    );
  }

  //return the index of the first worldstate before server time
  _computeIndexBaseState() {
    const serverTime = this._computeCurrentServerTime();
    for (let i = this.states.length - 1; i >= 0; i--) {
      if (this.states[i].getTimestamp() <= serverTime) {
        return i;
      }
    }
    return -1;
  }
  //INTERFACE
  onNewDiff(diff) {
    let last = this._getLastStateReceived();
    if (!last) throw new Error('no last state');
    let newState = last.add(diff);
    this._onNewState(newState);
  }

  onFirstState(state) {
    this.firstServerTimestamp = state.getTimestamp();
    this.gameStart = Date.now();
    this.states.length = 0;
    this._onNewState(state);
  }

  //StateComputer INTERFACE
  computeCurrentState() {
    if (!this.firstServerTimestamp) {
      return null;
    }

    const index = this._computeIndexBaseState();
    const serverTime = this._computeCurrentServerTime();

    // If base is the most recent update we have, use its state.
    // Otherwise, interpolate between its state and the state of (base + 1).
    if (index < 0 || index === this.states.length - 1) {
      // console.log('Last state !!');
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
}
