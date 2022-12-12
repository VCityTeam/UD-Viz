/**
 * Object with all information about a persistant world
 * each step can export a WorldState
 *
 * @format
 */

const THREE = require('three');
const WorldState = require('./WorldState');
const { Collisions } = require('detect-collisions');

const GameObject = require('./GameObject/GameObject').GameObject;
const Collider = require('./GameObject/Components/Collider');
const WorldScript = require('./GameObject/Components/WorldScript');

/**
 * Parent Object of GameObjects, handle simulation and store extradata like the geographic origin
 */
const WorldModule = class World {
  constructor(json, options) {
    if (!json) throw new Error('no json');

    // Update json format
    json = WorldModule.parseJSON(json);

    options = options || {};

    // Collisions system of detect-collisions npm package
    this.collisions = new Collisions();
    /**
     * ON_ENTER_COLLISION: 'onEnterCollision', //first collsion
     * IS_COLLIDING: 'isColliding', //is colliding
     * ON_LEAVE_COLLISION: 'onLeaveCollision', //on leave collision
     */
    this.collisionsBuffer = {}; // To handle event above

    // uuid
    this.uuid = json.uuid || THREE.Math.generateUUID();

    // Gameobject
    this.gameObject = new GameObject(json.gameObject);

    // Name of the world
    this.name = json.name || 'default_world';

    // Origin
    this.origin = json.origin || null;

    /** ****************INTERNAL*/

    // is running on webpage or node app
    if (options.isServerSide != undefined)
      console.error('no isServerSide should be passed');
    if (options.modules) console.error('no modules should be passed');
    this.modules = options.modules || {};
    this.listeners = {};
  }

  /**
   * Register a custom event
   *
   * @param {string} eventID id of the event
   * @param {Function} cb callback to be called when the event is dispatched
   */
  on(eventID, cb) {
    if (!this.listeners[eventID]) this.listeners[eventID] = [];
    this.listeners[eventID].push(cb);
  }

  /**
   * Notify that a custom event occured
   *
   * @param {string} eventID id of the event to dispatch
   * @param {Array} params params to passed to callbacks
   */
  notify(eventID, params) {
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
   * @param {WorldContext} worldContext this world context
   */
  load(onLoad, worldContext) {
    this.addGameObject(this.gameObject, worldContext, null, onLoad);
  }

  /**
   * Compute all the promises of a gameobject needed at the load event of WorldScripts
   *
   * @param {GameObject} go the gameobject to compute load promises
   * @param {WorldContext} worldContext this world context
   * @returns {Array[Promise]} An array containing all the promises
   */
  computePromisesLoad(go) {
    // Load GameObject
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
   * Init Assets components
   * Load GameObject
   * Init when loaded
   * Register into the collision system
   * Then call a callback onLoad
   *
   * @param {GameObject} gameObject the gameobject to add
   * @param {WorldContext} worldContext this world context
   * @param {GameObject} parent the gameobject parent may be null
   * @param {Function} onLoad callback called when loaded
   */
  addGameObject(gameObject, worldContext, parent, onLoad = null) {
    const _this = this;

    worldContext
      .getAssetsManager()
      .initGameObject(gameObject, true, { worldContext: worldContext });

    // INIT EVENT TRIGGER
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
   * @param {GameObject} go the gameobject to register
   */
  registerGOCollision(go) {
    const _this = this;

    // Collisions
    const collisions = this.collisions;
    go.traverse(function (child) {
      if (_this.collisionsBuffer[child.getUUID()]) return; // Already add

      _this.collisionsBuffer[child.getUUID()] = [];

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
   * Check gameobject transform and update this.collisionsBuffer
   */
  updateCollisionBuffer() {
    // Collisions
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
              // In ShapeWrapper shape are link to gameObject
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
   * @param {GameObject} go the gameobject to remove
   */
  unregisterGOCollision(go) {
    const _this = this;

    // Collisions
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
   * @param {string} uuid the uuid of the gameobject to remove
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
   *
   */
  tick() {
    const _this = this;

    // Tick GameObject
    this.dispatchWorldScriptEvent(
      this.gameObject,
      WorldScript.Controller.EVENT.TICK
    );

    // Collisions
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
              // In ShapeWrapper shape are link to gameObject
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
   * Return the current world state
   *
   * @param withWorldComponent
   * @returns {WorldState}
   */
  computeWorldState(withWorldComponent = true) {
    const result = new WorldState({
      worldUUID: this.getUUID(),
      gameObject: this.gameObject.toJSON(withWorldComponent),
      timestamp: Date.now(),
      origin: this.origin,
    });

    // Everything is not outadted yet
    this.getGameObject().traverse(function (g) {
      g.setOutdated(false);
    });

    return result;
  }

  /**
   * This function sets the gameObject property of the current object to the gameObject parameter.
   *
   * @param {GameObject} gameObject - The game object that this component is attached to.
   */
  setGameObject(gameObject) {
    this.gameObject = gameObject; // TODO : not to this at runtime when world is being simulated.
  }

  /**
   *
   * @returns {GameObject}
   */
  getGameObject() {
    return this.gameObject;
  }

  /**
   * Return the collision system
   *
   * @returns {Collisions}
   */
  getCollisions() {
    return this.collisions;
  }

  /**
   * Return the uuid of this world
   *
   * @returns {string}
   */
  getUUID() {
    return this.uuid;
  }

  /**
   *
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Return a clone of this
   *
   * @returns {World}
   */
  clone() {
    return new World(this.toJSON());
  }

  /**
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    return {
      gameObject: this.gameObject.toJSON(true),
      name: this.name,
      origin: this.origin,
      type: WorldModule.TYPE,
      uuid: this.uuid,
    };
  }
};

WorldModule.TYPE = 'World';

module.exports = WorldModule;

// Update json data of the world

// return true if version1 < version2
// const versionIsInferior = function (version1, version2) {
//   const numbers1 = version1.split('.');
//   const numbers2 = version2.split('.');

//   for (let index = 0; index < numbers1.length; index++) {
//     const version1Number = parseInt(numbers1[index]);
//     const version2Number = parseInt(numbers2[index]);
//     if (version1Number < version2Number) return true;
//   }
//   return false;
// };

WorldModule.parseJSON = function (worldJSON) {
  return worldJSON; // For now no patch

  // const version = worldJSON.version;
  // if (!version) return worldJSON;

  // let newJSON = null;
  // if (versionIsInferior(version, '2.33.7')) {
  //   newJSON = from2337To2338(worldJSON); //example of a patch
  // } else {
  //   return worldJSON; //if it is up to date
  // }

  // return WorldModule.parseJSON(newJSON);
};
