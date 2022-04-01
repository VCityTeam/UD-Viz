/** @format */

const Game = require('../Game/Game');

/**
 * Poll system (https://en.wikipedia.org/wiki/Polling_(computer_science))
 * Inputs state is stored asynchronously then state is access synchronously by user
 * Handle keys state TODO CREATE class KeyState like MousState but handle keys instead of mouse
 * Handle mouse state with the MouseState object
 */
export class InputManager {
  constructor() {
    //mouse commands
    this.mouseCommands = {};

    //mouse state
    this.mouseState = new MouseState();

    //to know what command have been done yet (avoid doublon)
    this.commandsBuffer = {};

    //internal (KeyState)
    this.keyMap = {};
    this.keyMapKeyDown = []; //buffer key down
    this.keyMapKeyUp = []; //buffer key up
    this.keyCommands = {};
    this.listeners = [];
    this.element = null;

    //flag
    this.pause = false;
  }

  isKeyDown(key) {
    return this.keyMapKeyDown.includes(key);
  }

  isKeyUp(key) {
    return this.keyMapKeyUp.includes(key);
  }

  /**
   * Disable/Enable this inputManager
   * @param {Boolean} pause if true command and input are not processed
   */
  setPause(pause) {
    this.pause = pause;
  }

  /**
   * Used this if a key has not been register in addKeyCommand and you need to know if it's isPressed
   * @param {Array[String]} keys ids of the key to listen to
   */
  listenKeys(keys) {
    const _this = this;
    keys.forEach(function (k) {
      _this.keyMap[k] = false;
    });
  }

  /**
   * Return true if the key is pressed, dont forget to listenKeys if no addKeyCommand has been used for this key
   * @param {String} key id of the key
   * @returns {Boolean} true if pressed, false otherwise
   */
  isPressed(key) {
    return this.keyMap[key];
  }

  /**
   * Register a callback for a particular key and event
   * @param {String} key id of the key if null every key trigger the event
   * @param {String} eventID id of the event (keyup, keydown)
   * @param {Function} cb callback called for this event
   */
  addKeyInput(key, eventID, cb) {
    const _this = this;
    const listener = function (event) {
      if ((key == event.key || key == null) && !_this.pause) cb();
    };
    window.addEventListener(eventID, listener);
    //register to dispose it
    this.listeners.push({
      element: window,
      cb: cb, //keep it to make easier the remove
      id: eventID,
      listener: listener,
    });
  }

  /**
   * Add a command for severals keys
   * @param {Command.TYPE} commandID Type of the command
   * @param {Array[String]} keys keys assigned
   * @param {Function} cb callback called for must return a Command
   */
  addKeyCommand(commandID, keys, cb) {
    const _this = this;
    this.commandsBuffer[commandID] = false; //avoid to stack multiple commands if two key of keys are pressedplo
    keys.forEach(function (key) {
      if (_this.keyCommands[key] != undefined) {
        console.error(key, ' is already assign');
        return;
      }

      //init keymap
      if (_this.keyMap[key] == undefined) _this.keyMap[key] = false;

      _this.keyCommands[key] = function () {
        if (_this.commandsBuffer[commandID]) {
          return null;
        }
        const cmd = cb(); //the callback must return a command
        if (cmd) {
          _this.commandsBuffer[commandID] = true;
          return cmd;
        }
        return null;
      };
    });
  }

  /**
   *
   * @param {Command.TYPE} commandID
   * @param {Array[String]} keys
   */
  removeKeyCommand(commandID, keys) {
    delete this.commandsBuffer[commandID];
    const _this = this;
    keys.forEach(function (key) {
      delete _this.keyCommands[key];
      delete _this.keyMap[key];
    });
  }

  /**
   * Add a command for a mouse input
   * @param {String} eventID id of the mouse to listen to
   * @param {Function} cb  must return a Command and take MouseState as first argument
   */
  addMouseCommand(eventID, cb) {
    this.mouseCommands[eventID] = cb;
  }

  /**
   *
   * @param {String} eventID
   */
  removeMouseCommand(eventID) {
    delete this.mouseCommands[eventID];
  }

  /**
   * Register a callback for a particular mouse event
   * @param {HTMLElement} element element listened
   * @param {String} eventID id of the event (mousedown, mouseup, mousemove)
   * @param {Function} cb callback called for this event
   */
  addMouseInput(element, eventID, cb) {
    const _this = this;

    const listener = function (event) {
      if (!_this.pause) {
        cb(event);
      }
    };

    element.addEventListener(eventID, listener);
    //register to dispose it
    this.listeners.push({
      element: element,
      cb: cb, //keep it to make easier the remove
      id: eventID,
      listener: listener,
    });
  }

  /**
   * Start listening
   * @param {HTMLElement} element the element listened
   */
  startListening(element) {
    const _this = this;
    this.element = element;

    //start listening key state
    const keydown = function (event) {
      if (_this.keyMap[event.key] == false) {
        _this.keyMap[event.key] = true;
        _this.keyMapKeyDown.push(event.key);
      }
    };
    window.addEventListener('keydown', keydown);
    this.listeners.push({ element: window, cb: keydown, id: 'keydown' });

    const keyup = function (event) {
      if (_this.keyMap[event.key] == true) {
        _this.keyMap[event.key] = false;
        _this.keyMapKeyUp.push(event.key);
      }
    };
    window.addEventListener('keyup', keyup);
    this.listeners.push({ element: window, cb: keyup, id: 'keyup' });

    //start listening mouse state
    this.mouseState.startListening(element);

    this.initPointerLock();
  }

  /**
   * register pointerLock management
   */
  initPointerLock() {
    this.element.requestPointerLock =
      this.element.requestPointerLock || this.element.mozRequestPointerLock;
    document.exitPointerLock =
      document.exitPointerLock || document.mozExitPointerLock;

    //gesture require to enter the pointerLock mode are click mousemove keypress keyup
    const _this = this;
    const checkPointerLock = function () {
      if (_this.pointerLock && _this.element) {
        try {
          //enter pointerLock
          _this.element.requestPointerLock();
        } catch (error) {
          console.error('cant request pointer lock');
        }
      }
    };
    //
    this.addKeyInput(null, 'keypress', checkPointerLock);
    this.addKeyInput(null, 'keyup', checkPointerLock);
    this.addMouseInput(this.element, 'click', checkPointerLock);
  }

  /**
   * If value is true pointerLock mode is activated else it's exited
   * @param {Boolean} value
   */
  setPointerLock(value) {
    this.pointerLock = value;
    if (!value) document.exitPointerLock(); //exit since this not require a gesture
  }

  /**
   * return true if pointerLock is enabled or not
   * @returns {Boolean}
   */
  getPointerLock() {
    return this.pointerLock;
  }

  /**
   * identify the listener to remove with its callback and remove it of the listening web api
   * @param {Object} listener
   */
  removeInputListener(listener) {
    for (let index = 0; index < this.listeners.length; index++) {
      const o = this.listeners[index];
      if (o.cb == listener) {
        o.element.removeEventListener(o.id, o.listener);
        this.listeners.splice(index, 1);
        break;
      }
    }
  }

  /**
   * Remove listeners and reset variables
   */
  dispose() {
    this.listeners.forEach(function (l) {
      l.element.removeEventListener(l.id, l.cb);
    });
    this.mouseState.dispose();

    //reset variables
    this.keyMap = {};
    this.keyCommands = {};
    this.mouseCommands = {};
    this.commandsBuffer = {};
    this.listeners = [];
    this.element = null;
  }

  /**
   * Reset Commands buffer
   */
  resetCommandsBuffer() {
    for (let id in this.commandsBuffer) {
      this.commandsBuffer[id] = false;
    }
  }

  /**
   * Compute Commands with the last state of keys and mouse
   * @returns {Array[Command]} commands computed
   */
  computeCommands() {
    if (this.pause) return []; //if pause no command should be return

    const result = [];

    //compute key commands
    for (let id in this.keyCommands) {
      //notify on down press and up
      if (this.keyMap[id] || this.isKeyUp(id)) {
        const cmd = this.keyCommands[id]();
        if (cmd) result.push(cmd);
      }
    }

    //compute mouse commands
    for (let eventID in this.mouseCommands) {
      if (this.mouseState.isTrigger(eventID)) {
        const cmd = this.mouseCommands[eventID].apply(this.mouseState, []);
        if (cmd) result.push(cmd);
      }
    }

    //reset
    this.mouseState.reset();
    this.resetCommandsBuffer();

    //reset event key down and key up
    this.keyMapKeyDown.length = 0;
    this.keyMapKeyUp.length = 0;

    return result;
  }

  /**
   * Compute commands and send them to a server
   * @param {WebSocketService} websocketService
   */
  sendCommandsToServer(websocketService) {
    const cmds = this.computeCommands();
    const cmdsJSON = [];
    cmds.forEach(function (cmd) {
      cmdsJSON.push(cmd.toJSON());
    });
    websocketService.emit(
      Game.Components.Constants.WEBSOCKET.MSG_TYPES.COMMANDS,
      cmdsJSON
    );
  }

  /**
   *
   * @returns {HTML}
   */
  getElement() {
    return this.element;
  }
}

/**
 * List of mouse event handle by MouseState
 */
const MOUSE_STATE_EVENTS = {
  MOUSE_UP: 'mouseup',
  MOUSE_DOWN: 'mousedown',
  MOUSE_MOVE: 'mousemove',
  MOUSE_CLICK: 'click',
};

/**
 * Poll system (https://en.wikipedia.org/wiki/Polling_(computer_science))
 * Listen to the MOUSE_STATE_EVENTS and store the mouse state to then be access synchronously
 */
export class MouseState {
  constructor() {
    this.mouseMap = {};
    this.mouseEvent = {};
    this.dragging = false;
    this.listeners = [];
  }

  /**
   *
   * @returns {Boolean} true if the mouse is dragging, false otherwise
   */
  isDragging() {
    return this.dragging;
  }

  /**
   * Remove listeners and reset variables
   */
  dispose() {
    //reset variables
    this.mouseMap = {};
    this.mouseEvent = {};
    this.dragging = false;
    this.listeners = [];

    this.listeners.forEach(function (l) {
      l.element.removeEventListener(l.id, l.cb);
    });
  }

  /**
   * Start listening to mouse event on the element
   * @param {HTMLElement} element the element where to catch events
   */
  startListening(element) {
    for (let id in MOUSE_STATE_EVENTS) {
      this.listeners.push({
        element: element,
        cb: this.addEvent(element, MOUSE_STATE_EVENTS[id]),
        id: MOUSE_STATE_EVENTS[id],
      });
    }
  }

  /**
   * Add a listener for a particular event on element
   * @param {HTMLElement} element element to listen to
   * @param {String} idEvent mouse events
   * @returns {Function} Callback call for this event
   */
  addEvent(element, idEvent) {
    const _this = this;
    const listener = function (event) {
      if (idEvent === MOUSE_STATE_EVENTS.MOUSE_DOWN) {
        _this.dragging = true;
      } else if (idEvent === MOUSE_STATE_EVENTS.MOUSE_UP)
        _this.dragging = false;
      _this.mouseMap[idEvent] = true; //is trigger
      _this.mouseEvent[idEvent] = event;
    };
    element.addEventListener(idEvent, listener);
    this.mouseMap[idEvent] = false;

    return listener;
  }

  /**
   * Access the last Event for eventID
   * @param {String} eventID id of the mouse event
   * @returns {Event} The last event store for this event
   */
  event(eventID) {
    return this.mouseEvent[eventID];
  }

  /**
   * Return true if this event has been triggered on the last poll
   * @param {String} eventID
   * @returns {Boolean} true if the eventID has been triggered
   */
  isTrigger(eventID) {
    return this.mouseMap[eventID];
  }

  /**
   * Reset Event triggered
   */
  reset() {
    //reset trigger mousemap
    for (let idEvent in this.mouseMap) {
      this.mouseMap[idEvent] = false;
    }
  }
}
