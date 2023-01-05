const { Collisions } = require('detect-collisions');
const Collider = require('./Component/Collider');
const Script = require('./Component/Script');
const GameScript = require('./Component/GameScript');
const Object3D = require('./Object3D');
const State = require('./State/State');
const Command = require('../Command');

const Context = class {
  /**
   * Handle Game collisions + {@link ScriptBase}
   *
   * @param {Object<string,ScriptBase>} gameScriptClass - map of class extended {@link ScriptBase}
   * @param {Object3D} object3D - root game object3D
   */
  constructor(gameScriptClass, object3D) {
    /** @type {Object<string,ScriptBase>} - class that can be reference by {@link GameScript} of an object3D */
    this.gameScriptClass = gameScriptClass;

    /** @type {Object3D} root game object3D */
    this.object3D = object3D;

    /** @type {Collisions} Collisions system {@link https://www.npmjs.com/package/detect-collisions}*/
    this.collisions = new Collisions();

    /** @type {Object<string,string>} Buffer to handle collision events {@link Context.EVENT} */
    this.collisionsBuffer = {};

    /** @type {Object<string,Function[]} Listeners of custom events */
    this.listeners = {};

    /** @type {number} delta time */
    this.dt = 0;

    /** @type {Command[]} buffer of commands to apply at the next step */
    this.commands = [];
  }

  /**
   * Create a class instance of game script class for an object3D  given an id
   *
   * @param {string} id - id of the class
   * @param {Object3D} object3D - object3D that is going to use this instance
   * @param {object} modelVariables - custom variables associated to this instance
   * @returns {ScriptBase} - instance of the class bind with object3D and modelVariables
   */
  createInstanceOf(id, object3D, modelVariables) {
    const constructor = this.gameScriptClass[id];
    if (!constructor) {
      console.log('script loaded');
      for (const id in this.gameScriptClass) {
        console.log(this.gameScriptClass[id]);
      }
      throw new Error('no script with id ' + id);
    }
    return new constructor(this, object3D, modelVariables);
  }

  /**
   * Load its object3D
   *
   * @returns {Promise} - promise resolving at the end of the load
   */
  load() {
    return this.loadObject3D(this.object3D);
  }

  /**
   * Load an object3D into context
   *
   * @param {Object3D} obj - object3D to load
   * @returns {Promise} - promise resolving at the end of the load
   */
  loadObject3D(obj) {
    return new Promise((resolve) => {
      // init game component controllers of object3D
      this.initComponentControllers(obj);

      // compute promises
      const promises = [];

      obj.traverse(function (child) {
        const scriptC = child.getComponent(GameScript.Component.TYPE);
        if (scriptC) {
          const scripts = scriptC.getController().getScripts();
          for (const idScript in scripts) {
            const result = scriptC
              .getController()
              .executeScript(scripts[idScript], Context.EVENT.LOAD);
            if (result) promises.push(result);
          }
        }
      });

      Promise.all(promises).then(() => {
        this.registerObject3DCollision(obj);

        // trigger Context.EVENT.INIT
        this.dispatchScriptEvent(obj, Context.EVENT.INIT);

        resolve();
      });
    }).catch((error) => {
      console.error(error);
    });
  }

  /**
   * Step context
   *
   * @param {number} dt - new delta time of step
   */
  step(dt) {
    this.dt = dt;

    this.dispatchScriptEvent(this.object3D, Context.EVENT.TICK);

    this.updateCollision();

    this.object3D.traverse((child) => {
      if (child.isStatic()) return;
      const colliderComponent = child.getComponent(Collider.Component.TYPE);
      if (colliderComponent) {
        const collidedObject3D = [];
        const buffer = this.collisionsBuffer[child.uuid];

        colliderComponent
          .getController()
          .getShapeWrappers()
          .forEach((wrapper) => {
            const shape = wrapper.getShape();
            const potentials = shape.potentials();
            const result = this.collisions.createResult();
            for (const p of potentials) {
              /** In {@link ShapeWrapper} shape are link to object3D */
              const potentialObject3D = p.getObject3D();
              if (!potentialObject3D.isStatic()) continue;
              if (shape.collides(p, result)) {
                collidedObject3D.push(potentialObject3D.uuid);

                // child collides with potentialObject3D
                if (buffer.includes(potentialObject3D.uuid)) {
                  // Already collided
                  this.dispatchScriptEvent(child, Context.EVENT.IS_COLLIDING, [
                    result,
                  ]);
                } else {
                  // OnEnter
                  buffer.push(potentialObject3D.uuid); // Register in buffer
                  this.dispatchScriptEvent(
                    child,
                    Context.EVENT.ON_ENTER_COLLISION,
                    [result]
                  );
                }
              }
            }
          });

        // Notify onLeave
        for (let i = buffer.length - 1; i >= 0; i--) {
          const uuid = buffer[i];
          if (!collidedObject3D.includes(uuid)) {
            this.dispatchScriptEvent(child, Context.EVENT.ON_LEAVE_COLLISION, [
              uuid,
            ]);
            buffer.splice(i, 1); // Remove from buffer
          }
        }
      }
    });

    this.commands.length = 0; // Clear commands
  }

  /**
   * It will dispatch an event to all {@link ScriptBase} in object3D
   *
   * @param {Object3D} object3D - object3D that you want to dispatch the event to.
   * @param {string} event - name of the event to dispatch see possible value in {@link Context.EVENT}
   * @param {*[]} params - params to pass to {@link ScriptBase}
   */
  dispatchScriptEvent(object3D, event, params = []) {
    object3D.traverse(function (child) {
      const scriptComponent = child.getComponent(GameScript.Component.TYPE);
      if (scriptComponent) {
        scriptComponent.getController().execute(event, params);
      }
    });
  }

  /**
   * Initialize controllers used in context
   *
   * @param {Object3D} obj - object3D to initialize controllers
   */
  initComponentControllers(obj) {
    obj.traverse((child) => {
      const components = child.getComponents();
      for (const type in components) {
        const component = child.getComponent(type);
        if (component.getController())
          throw new Error('controller already init ' + child.name);
        const scripts = {};
        switch (type) {
          case GameScript.Component.TYPE:
            component
              .getModel()
              .getIdScripts()
              .forEach((idScript) => {
                scripts[idScript] = this.createInstanceOf(
                  idScript,
                  child,
                  component.getModel().getVariables()
                );
              });
            component.initController(
              new Script.Controller(component.getModel(), child, scripts)
            );
            break;
          case Collider.Component.TYPE:
            component.initController(
              new Collider.Controller(component.getModel(), child)
            );
            break;
          default:
          // no need to initialize controller for this component
        }
      }
    });
  }

  /**
   * Add a object3D into the collision system
   *
   * @param {Object3D} object3D - object3D to register
   */
  registerObject3DCollision(object3D) {
    object3D.traverse((child) => {
      if (this.collisionsBuffer[child.uuid]) return; // Already add
      this.collisionsBuffer[child.uuid] = [];

      const colliderComponent = child.getComponent(Collider.Component.TYPE);
      if (colliderComponent) {
        colliderComponent
          /** @type {Context} */ .getController()
          .getShapeWrappers()
          .forEach((wrapper) => {
            this.collisions.insert(wrapper.getShape());
          });
      }
    });

    this.updateCollisionBuffer();
    // console.log(this.collisionsBuffer);
  }

  /**
   * Update root object3D collider controller + update collisions system
   */
  updateCollision() {
    this.object3D.traverse((child) => {
      const colliderComponent = child.getComponent(Collider.Component.TYPE);
      if (colliderComponent) colliderComponent.getController().update();
    });
    this.collisions.update();
  }

  /**
   * Update the collision buffer
   */
  updateCollisionBuffer() {
    this.updateCollision();

    this.object3D.traverse((child) => {
      if (child.isStatic()) return;
      const colliderComponent = child.getComponent(Collider.Component.TYPE);
      if (colliderComponent) {
        colliderComponent
          .getController()
          .getShapeWrappers()
          .forEach((wrapper) => {
            const shape = wrapper.getShape();
            const potentials = shape.potentials();
            const result = this.collisions.createResult();
            for (const p of potentials) {
              /** In {@link ShapeWrapper} shape are link to gameObject*/
              const potentialObject3D = p.getObject3D();
              if (!potentialObject3D.isStatic()) continue;
              if (shape.collides(p, result)) {
                if (
                  !this.collisionsBuffer[child.uuid].includes(
                    potentialObject3D.uuid
                  )
                )
                  this.collisionsBuffer[child.uuid].push(
                    potentialObject3D.uuid
                  );
              }
            }
          });
      }
    });
  }

  /**
   * Remove a GameObject from the collision system
   *
   * @param {Object3D} object3D - object3D to remove
   */
  unregisterObject3DCollision(object3D) {
    object3D.traverse((child) => {
      const comp = child.getComponent(Collider.Component.TYPE);
      if (comp) {
        comp
          .getController()
          .getShapeWrappers()
          .forEach((wrapper) => {
            wrapper.getShape().remove();
          });

        // Delete from buffer
        delete this.collisionsBuffer[child.uuid];
        for (const id in this.collisionsBuffer) {
          const index = this.collisionsBuffer[id].indexOf(object3D.uuid);
          if (index >= 0) this.collisionsBuffer[id].splice(index, 1); // Remove from the other
        }
      }
    });
  }

  /**
   * Add an object3D in context. If a parentUUID is specifed it will be add to its, root otherwise
   *
   * @param {Object3D} obj - object3D to add
   * @param {string=} parentUUID - uuid of parent object3D
   * @returns {Promise} - promise resolving when add
   */
  addObject3D(obj, parentUUID = null) {
    if (parentUUID) {
      const parent = this.object3D.getObjectByProperty('uuid', parentUUID);
      parent.add(obj);
    } else {
      this.object3D.add(obj);
    }

    return this.loadObject3D(obj);
  }

  /**
   * Remove a object3D of context
   *
   * @param {string} uuid - uuid of the object3D to remove
   */
  removeObject3D(uuid) {
    const object3D = this.object3D.getObjectByProperty('uuid', uuid);
    object3D.removeFromParent();
    this.unregisterObject3DCollision(object3D);
  }

  /**
   * Register a custom event
   *
   * @param {string} eventID - Id of the event
   * @param {Function} cb - Callback to be called when the event is dispatched
   */
  on(eventID, cb) {
    if (!this.listeners[eventID]) this.listeners[eventID] = [];
    this.listeners[eventID].push(cb);
  }

  /**
   * Dispatch custom event to listeners
   *
   * @param {string} eventID - Id of the event to dispatch
   * @param {Array} args - Params to passed to listeners
   */
  dispatch(eventID, args) {
    if (!this.listeners[eventID]) {
      console.warn('no listener on event ', eventID);
    } else {
      this.listeners[eventID].forEach(function (cb) {
        cb(args);
      });
    }
  }

  /**
   * Pass new commands to apply at the next step
   *
   * @param {Command[]} cmds - new commands to apply at the next step
   */
  onCommand(cmds) {
    cmds.forEach((cmd) => {
      this.commands.push(cmd);
    });
  }

  /**
   * Convert context root object3D to {@link State} and reset outdated attributes of all object3D
   *
   * @param {boolean} full - model of object3D with controllers should be export
   * @returns {State} - current state of context
   */
  toState(full = true) {
    const result = new State({
      object3DJSON: this.object3D.toJSON(full),
      timestamp: Date.now(),
    });

    // Everything is not outdated yet
    this.object3D.traverse(function (child) {
      child.setOutdated(false);
    });

    return result;
  }

  /**
   *
   * @returns {Object3D} - context root object3D
   */
  getObject3D() {
    return this.object3D;
  }

  /**
   *
   * @returns {number} - context delta time
   */
  getDt() {
    return this.dt;
  }

  /**
   *
   * @returns {Command[]} - context buffer commands
   */
  getCommands() {
    return this.commands;
  }
};

/**
 * Events triggered by context to {@link ScriptBase}
 */
Context.EVENT = {
  LOAD: 'load',
  INIT: 'init',
  TICK: 'tick',
  ON_ENTER_COLLISION: 'onEnterCollision',
  IS_COLLIDING: 'isColliding',
  ON_LEAVE_COLLISION: 'onLeaveCollision',
};

const ScriptBase = class {
  /**
   * Skeleton of a game context script, different {@link Context.EVENT} are trigger by {@link Context}
   *
   * @param {Context} context - context of this script
   * @param {Object3D} object3D - object3D bind (attach) to this script
   * @param {object} variables - custom variables bind (attach) to this script
   */
  constructor(context, object3D, variables) {
    /** @type {Context} - context of this script */
    this.context = context;
    /** @type {Object3D} - object3D attach to this script */
    this.object3D = object3D;
    /** @type {object} - custom variables attach to this script */
    this.variables = variables;
  }
  /**
   * call after object3D controllers initialized
   *
   * @returns {Promise=} - promise when object3D has loaded
   */
  load() {
    // return null by default
    return null;
  }
  /**
   * call after object3D load and register in collision system
   */
  init() {}
  /**
   * call every step
   */
  tick() {}
  /**
   * call if object3D is not static and first collide a static object3D (object3D must have {@link Collider})
   */
  onEnterCollision() {}
  /**
   * call if object3D is not static and is colliding a static object3D (object3D must have {@link Collider})
   */
  isColliding() {}
  /**
   * call if object3D is not static and was colliding a static object3D (object3D must have {@link Collider})
   */
  onLeaveCollision() {}
};

module.exports = {
  Context: Context,
  ScriptBase: ScriptBase,
};
