const THREE = require('three');
const WorldState = require('./WorldState');
const { Collisions } = require('detect-collisions');
const GameObject = require('./GameObject/GameObject').GameObject;
const Collider = require('./GameObject/Components/Collider');
const WorldScript = require('./GameObject/Components/WorldScript');

// jsdoc import
const WorldContext = require('./WorldContext');

/**
 * @typedef {object} WorldOrigin
 * @property {number} lng - longitude coordinate of the origin.
 * @property {number} lat - latitude coordinate of the origin.
 * @property {number} alt - altitude coordinate of the origin.
 */

/**
 * Represent a world model and methods to simulated it given a {@link WorldContext}
 */
const World = class {
  /**
   *
   * @param {object|JSON} json - The json object that contains the world's data.
   * @param {object|JSON} json.gameObject - JSON to create the {@link GameObject} of the world.
   * @param {string} json.name - Name of the world. (optional)
   * @param {string} json.uuid - UUID of the world. (optional)
   * @param {WorldOrigin} json.origin - Origin of the world. (optional)
   */
  constructor(json) {
    if (arguments[1]) throw new Error('options is not used anymore');
    if (!json) throw new Error('no json');

    /** @type {string} UUID of the world */
    this.uuid = json.uuid || THREE.Math.generateUUID();

    /** @type {GameObject} GameObject of the world */
    this.gameObject = new GameObject(json.gameObject);

    /** @type {string} Name of the world */
    this.name = json.name || 'default_world_name';

    /** @type {WorldOrigin} Origin of the world */
    this.origin = json.origin || null;

    /** @type {Collisions} Collisions system {@link https://www.npmjs.com/package/detect-collisions}*/
    this.collisions = new Collisions();

    /**
     * @type {object} Buffer to handle collision events
     * @see {WorldScript.Controller.EVENT}
     */
    this.collisionsBuffer = {};

    /** @type {object} Listeners of custom events */
    this.listeners = {};
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

  /**
   * Load its gameobject
   *
   * @param {Function} onLoad callback called at the end of the load
   * @param {WorldContext} worldContext world context to initialize the gameobject
   */
  load(onLoad, worldContext) {
    this.addGameObject(this.gameObject, worldContext, null, onLoad);
  }

  /**
   * Compute all the promises of a gameobject needed at the load event of WorldScripts
   *
   * @param {GameObject} go the gameobject to compute load promises
   * @returns {Array[Promise]} An array containing all the promises
   */
  computePromisesLoad(go) {
    const promises = [];

    go.traverse(function (g) {
      const scriptC = g.getComponent(WorldScript.Model.TYPE);
      if (scriptC) {
        const scripts = scriptC.getController().getScripts();
        for (const idScript in scripts) {
          const result = scriptC
            .getController()
            .executeScript(
              scripts[idScript],
              WorldScript.Controller.EVENT.LOAD,
              []
            );
          if (result) promises.push(result);
        }
      }
    });

    return promises;
  }

  /**
   * It will dispatch an event to all the world scripts in the gameobject
   *
   * @param {GameObject} gameObject - The gameobject that you want to dispatch the event to.
   * @param {string} event - The name of the event to dispatch @see {WorldScript.Controller.EVENT}.
   * @param {Array} params - The params to pass to the {@link WorldScriptController} @see {WorldScript.Controller}.
   */
  dispatchWorldScriptEvent(gameObject, event, params = []) {
    gameObject.traverse(function (child) {
      const worldScriptGameComponent = child.getComponent(
        WorldScript.Model.TYPE
      );
      if (worldScriptGameComponent) {
        worldScriptGameComponent.getController().execute(event, params);
      }
    });
  }

  /**
   * Add a GameObject into this world
   * Then call a callback onLoad (optional)
   *
   * @param {GameObject} gameObject - The gameobject to add
   * @param {WorldContext} worldContext - The world context to initialize the gameobject
   * @param {GameObject} parent - The gameobject parent may be null
   * @param {Function} onLoad - Callback called when loaded (optional)
   */
  addGameObject(gameObject, worldContext, parent, onLoad = null) {
    const _this = this;

    worldContext
      .getAssetsManager()
      .initGameObject(gameObject, true, { worldContext: worldContext });

    if (parent) {
      parent.addChild(gameObject);
    } else {
      _this.gameObject = gameObject;
    }

    this.dispatchWorldScriptEvent(
      gameObject,
      WorldScript.Controller.EVENT.INIT
    );

    Promise.all(this.computePromisesLoad(gameObject)).then(function () {
      _this.registerGOCollision(gameObject);
      if (onLoad) onLoad();
    });
  }

  /**
   * Add a gameobject into the collision system
   *
   * @param {GameObject} go - The gameobject to register
   */
  registerGOCollision(go) {
    const collisions = this.collisions;

    go.traverse((child) => {
      if (this.collisionsBuffer[child.getUUID()]) return; // Already add

      this.collisionsBuffer[child.getUUID()] = [];

      const colliderComponent = child.getComponent(Collider.Model.TYPE);
      if (colliderComponent) {
        colliderComponent
          .getController()
          .getShapeWrappers()
          .forEach(function (wrapper) {
            collisions.insert(wrapper.getShape());
          });
      }
    });
  }

  /**
   * Update the collision buffer
   */
  updateCollisionBuffer() {
    const collisions = this.collisions;
    this.gameObject.traverse(function (g) {
      const colliderComponent = g.getComponent(Collider.Model.TYPE);
      if (colliderComponent) colliderComponent.getController().update();
    });
    collisions.update();

    const _this = this;

    this.gameObject.traverse(function (g) {
      if (g.isStatic()) return;
      const colliderComponent = g.getComponent(Collider.Model.TYPE);
      if (colliderComponent) {
        colliderComponent
          .getController()
          .getShapeWrappers()
          .forEach(function (wrapper) {
            const shape = wrapper.getShape();
            const potentials = shape.potentials();
            const result = collisions.createResult();
            for (const p of potentials) {
              /** In {@link ShapeWrapper} shape are link to gameObject*/
              const potentialG = p.getGameObject();
              if (!potentialG.isStatic()) continue;
              if (shape.collides(p, result)) {
                _this.collisionsBuffer[g.getUUID()].push(potentialG.getUUID());
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
  unregisterGOCollision(go) {
    const _this = this;

    go.traverse(function (child) {
      const comp = child.getComponent(Collider.Model.TYPE);
      if (comp) {
        comp
          .getController()
          .getShapeWrappers()
          .forEach(function (wrapper) {
            wrapper.getShape().remove();
          });

        // Delete from buffer
        delete _this.collisionsBuffer[child.getUUID()];
        for (const id in _this.collisionsBuffer) {
          const index = _this.collisionsBuffer[id].indexOf(go.getUUID());
          if (index >= 0) _this.collisionsBuffer[id].splice(index, 1); // Remove from the other
        }
      }
    });
  }

  /**
   * Remove a gameobject from this world
   *
   * @param {string} uuid - The uuid of the gameobject to remove
   */
  removeGameObject(uuid) {
    console.log(uuid + ' remove from ', this.name);
    const go = this.gameObject.find(uuid);
    if (!go) throw new Error(uuid, ' not found in ', this.gameObject);
    go.removeFromParent();
    this.unregisterGOCollision(go);
  }

  /**
   * Simulate one step of the world simulation
   */
  tick() {
    const _this = this;

    this.dispatchWorldScriptEvent(
      this.gameObject,
      WorldScript.Controller.EVENT.TICK
    );

    const collisions = this.collisions;
    this.gameObject.traverse(function (g) {
      const colliderComponent = g.getComponent(Collider.Model.TYPE);
      if (colliderComponent) colliderComponent.getController().update();
    });
    collisions.update();

    this.gameObject.traverse(function (g) {
      if (g.isStatic()) return;
      const colliderComponent = g.getComponent(Collider.Model.TYPE);
      if (colliderComponent) {
        const collidedGO = [];
        const buffer = _this.collisionsBuffer[g.getUUID()];

        colliderComponent
          .getController()
          .getShapeWrappers()
          .forEach(function (wrapper) {
            const shape = wrapper.getShape();
            const potentials = shape.potentials();
            const result = collisions.createResult();
            for (const p of potentials) {
              /** In {@link ShapeWrapper} shape are link to gameObject */
              const potentialG = p.getGameObject();
              if (!potentialG.isStatic()) continue;
              if (shape.collides(p, result)) {
                collidedGO.push(potentialG.getUUID());

                // G collides with potentialG
                if (buffer.includes(potentialG.getUUID())) {
                  // Already collided
                  _this.dispatchWorldScriptEvent(
                    g,
                    WorldScript.Controller.EVENT.IS_COLLIDING,
                    [result]
                  );
                } else {
                  // OnEnter
                  buffer.push(potentialG.getUUID()); // Register in buffer
                  _this.dispatchWorldScriptEvent(
                    g,
                    WorldScript.Controller.EVENT.ON_ENTER_COLLISION,
                    [result]
                  );
                }
              }
            }
          });

        // Notify onExit
        for (let i = buffer.length - 1; i >= 0; i--) {
          const uuid = buffer[i];
          if (!collidedGO.includes(uuid)) {
            // OnLeave
            _this.dispatchWorldScriptEvent(
              g,
              WorldScript.Controller.EVENT.ON_LEAVE_COLLISION,
              [uuid]
            );
            buffer.splice(i, 1); // Remove from buffer
          }
        }
      }
    });
  }

  /**
   * @param {boolean} withWorldComponent - If true, the world component will be included in the world state
   * @returns {WorldState} - The current world state
   */
  computeWorldState(withWorldComponent = true) {
    const result = new WorldState({
      worldUUID: this.getUUID(),
      gameObject: this.gameObject.toJSON(withWorldComponent),
      timestamp: Date.now(),
      origin: this.origin,
    });

    // Everything is not outdated yet
    this.getGameObject().traverse(function (g) {
      g.setOutdated(false);
    });

    return result;
  }

  /**
   * @returns {GameObject} - The root gameobject of this world
   */
  getGameObject() {
    return this.gameObject;
  }

  /**
   * @returns {Collisions} - The collision system
   */
  getCollisions() {
    return this.collisions;
  }

  /**
   * @returns {string} - The uuid of this world
   */
  getUUID() {
    return this.uuid;
  }

  /**
   * @returns {string} - The name of this world
   */
  getName() {
    return this.name;
  }

  /**
   * @returns {this} - A clone of this
   */
  clone() {
    return new World(this.toJSON());
  }

  /**
   * Compute this to JSON
   *
   * @returns {object|JSON} object serialized in JSON
   */
  toJSON() {
    return {
      gameObject: this.gameObject.toJSON(true),
      name: this.name,
      origin: this.origin,
      type: World.TYPE,
      uuid: this.uuid,
    };
  }
};

World.TYPE = 'World';

module.exports = World;
