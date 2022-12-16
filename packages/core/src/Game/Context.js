const { Collisions } = require('detect-collisions');
const Collider = require('./Object3D/Components/Collider');
const Script = require('./Object3D/Components/Script');
const Object3D = require('./Object3D/Object3D');
const State = require('./State');
const THREE = require('three');

/**
 * Context used to simulate a World
 */
const Context = class {
  constructor(object3DJSON, options = {}) {
    /** @type {Object3D} object3D of the world */
    this.object3D = new Object3D(object3DJSON);

    /** @type {Collisions} Collisions system {@link https://www.npmjs.com/package/detect-collisions}*/
    this.collisions = new Collisions();

    /**
     * @type {object} Buffer to handle collision events
     * @see {Context.EVENT}
     */
    this.collisionsBuffer = {};

    /** @type {object} Listeners of custom events */
    this.listeners = {};

    // Current delta time
    this.dt = 0;

    // Commands
    this.commands = [];

    // gamescript
    this.classScripts = {};
    if (options.classScripts) {
      options.classScripts.forEach((gS) => {
        this.classScripts[gS.name] = gS;
      });
    }
  }

  createInstanceOf(id, object3D, modelConf) {
    /** @type {ScriptBase} */
    const constructor = this.classScripts[id];
    if (!constructor) {
      console.log('script loaded');
      for (const id in this.classScripts) {
        console.log(this.classScripts[id]);
      }
      throw new Error('no script with id ' + id);
    }
    return new constructor(this, object3D, modelConf);
  }

  /**
   * Load its object3D
   *
   * @param {Function} onLoad callback called at the end of the load
   * @param {WorldContext} worldContext world context to initialize the object3D
   */
  load() {
    return this.loadObject3D(this.object3D);
  }

  loadObject3D(obj) {
    return new Promise((resolve) => {
      this.initComponentControllers(obj);

      // load object3D
      const promises = [];

      obj.traverse(function (child) {
        const scriptC = child.getComponent(Script.Component.TYPE);
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

        // init is trigger after controllers has been init
        this.dispatchScriptEvent(obj, Context.EVENT.INIT);

        resolve();
      });
    }).catch((error) => {
      console.error(error);
    });
  }

  step(dt) {
    this.dt = dt;

    this.dispatchScriptEvent(this.object3D, Context.EVENT.TICK);

    // collision trigger event
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

        // Notify onExit
        for (let i = buffer.length - 1; i >= 0; i--) {
          const uuid = buffer[i];
          if (!collidedObject3D.includes(uuid)) {
            // OnLeave
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
   * It will dispatch an event to all the world scripts in the object3D
   *
   * @param {Object3D} object3D - The object3D that you want to dispatch the event to.
   * @param {string} event - The name of the event to dispatch @see {Context.EVENT}.
   * @param {Array} params - The params to pass to the {@link WorldScriptController} @see {WorldScript.Controller}.
   */
  dispatchScriptEvent(object3D, event, params = []) {
    object3D.traverse(function (child) {
      const scriptComponent = child.getComponent(Script.Component.TYPE);
      if (scriptComponent) {
        scriptComponent.getController().execute(event, params);
      }
    });
  }

  /**
   *
   * @param {Object3D} obj
   * @returns
   */
  initComponentControllers(obj) {
    obj.traverse((child) => {
      const components = child.getComponents();
      for (const type in components) {
        const component = child.getComponent(type);
        if (component.getController())
          throw new Error('controller already init ' + child.name);
        switch (type) {
          case Script.Component.TYPE:
            component.initController(
              new Script.Controller(component.getModel(), child, this)
            );
            break;
          case Collider.Component.TYPE:
            component.initController(
              new Collider.Controller(component.getModel(), child, this)
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
   * @param {Object3D} go - The object3D to register
   */
  registerObject3DCollision(object3D) {
    object3D.traverse((child) => {
      if (this.collisionsBuffer[child.uuid]) return; // Already add

      this.collisionsBuffer[child.uuid] = [];

      const colliderComponent = child.getComponent(Collider.Component.TYPE);
      if (colliderComponent) {
        colliderComponent
          .getController()
          .getShapeWrappers()
          .forEach((wrapper) => {
            this.collisions.insert(wrapper.getShape());
          });
      }
    });
  }

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

    this.gameObject.traverse((child) => {
      if (child.isStatic()) return;
      const colliderComponent = child.getComponent(Collider.Model.TYPE);
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
                this.collisionsBuffer[g.getUUID()].push(
                  potentialObject3D.getUUID()
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
   * @param {GameObject} go - The gameobject to remove
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
   * Remove a gameobject from this world
   *
   * @param {string} uuid - The uuid of the gameobject to remove
   */
  removeObject3D(uuid) {
    console.log(uuid + ' remove from ', this.object3D.name);
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
   * @param {Array} params - Params to passed to listeners
   */
  dispatch(eventID, params) {
    if (!this.listeners[eventID]) {
      console.warn('no listener on event ', eventID);
    } else {
      this.listeners[eventID].forEach(function (cb) {
        cb(params);
      });
    }
  }

  decomposeInCollisionReferential(object3D) {
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    object3D.matrixWorld.decompose(position, quaternion, scale);

    position.sub(this.object3D.position);

    return [position, quaternion, scale];
  }

  /**
   *
   * @param {*} full
   * @returns {State}
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

  getObject3D() {
    return this.object3D;
  }

  /**
   *
   * @returns {number}
   */
  getDt() {
    return this.dt;
  }

  /**
   *
   * @returns {Array[Command]}
   */
  getCommands() {
    return this.commands;
  }
};

Context.EVENT = {
  TICK: 'tick', // Every tick
  INIT: 'init', // Every tick
  LOAD: 'load', // When loading
  ON_ENTER_COLLISION: 'onEnterCollision', // First collsion
  IS_COLLIDING: 'isColliding', // Is colliding
  ON_LEAVE_COLLISION: 'onLeaveCollision', // On leave collision
};

const ScriptBase = class {
  constructor(context, object3D, conf) {
    /** @type {Context} */
    this.context = context;
    this.object3D = object3D;
    this.conf = conf;
  }
  init() {}
  tick() {}
  load() {
    // return null by default
    return null;
  }
  onEnterCollision() {}
  isColliding() {}
  onLeaveCollision() {}
};

module.exports = {
  Context: Context,
  ScriptBase: ScriptBase,
};
