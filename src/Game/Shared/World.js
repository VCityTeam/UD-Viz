/**
 * Object with all information about a persistant world
 * each step can export a WorldState
 *
 * @format
 */
const GameObject = require('./GameObject/GameObject');
const WorldScriptComponent = require('./GameObject/Components/WorldScript');
const ColliderComponent = require('./GameObject/Components/Collider');
const THREE = require('three');
const WorldState = require('./WorldState');
const { Collisions } = require('detect-collisions');

/**
 * Parent Object of GameObjects, handle simulation and store extradata like the geographic origin
 */
const WorldModule = class World {
  constructor(json, options) {
    if (!json) throw new Error('no json');
    options = options || {};

    //collisions system of detect-collisions npm package
    this.collisions = new Collisions();
    /**
     * ON_ENTER_COLLISION: 'onEnterCollision', //first collsion
     * IS_COLLIDING: 'isColliding', //is colliding
     * ON_LEAVE_COLLISION: 'onLeaveCollision', //on leave collision
     */
    this.collisionsBuffer = {}; //to handle event above

    //uuid
    this.uuid = json.uuid || THREE.Math.generateUUID();

    //gameobject
    if (json.gameObject) {
      this.gameObject = new GameObject(json.gameObject);
    } else {
      throw new Error('no go in world');
    }

    //name of the world
    this.name = json.name || 'default_world';

    //origin
    this.origin = json.origin || { lat: 0, lng: 0, alt: 0 };

    /******************INTERNAL***********************/

    //is running on webpage or node app
    this.isServerSide = options.isServerSide || false;
    this.modules = options.modules || {};
    this.listeners = {};
  }

  /**
   * Register a custom event
   * @param {String} eventID id of the event
   * @param {Function} cb callback to be called when the event is dispatched
   */
  on(eventID, cb) {
    if (!this.listeners[eventID]) this.listeners[eventID] = [];
    this.listeners[eventID].push(cb);
  }

  /**
   * Notify that a custom event occured
   * @param {String} eventID id of the event to dispatch
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
   * @param {Function} onLoad callback called at the end of the load
   * @param {WorldContext} worldContext this world context
   */
  load(onLoad, worldContext) {
    this.addGameObject(this.gameObject, worldContext, null, onLoad);
  }

  /**
   * Compute all the promises of a gameobject needed at the load event of WorldScripts
   * @param {GameObject} go the gameobject to compute load promises
   * @param {WorldContext} worldContext this world context
   * @returns {Array[Promise]} An array containing all the promises
   */
  computePromisesLoad(go, worldContext) {
    //load GameObject
    const promises = [];
    let params = [worldContext, this.isServerSide, this.modules];

    go.traverse(function (g) {
      const scriptC = g.getComponent(WorldScriptComponent.TYPE);
      if (scriptC) {
        for (let idScript in scriptC.getScripts()) {
          const result = scriptC.executeScript(
            idScript,
            WorldScriptComponent.EVENT.LOAD,
            params
          );
          if (result) promises.push(result);
        }
      }
    });

    return promises;
  }

  /**
   * Add a GameObject into this world
   * Init Assets components
   * Load GameObject
   * Init when loaded
   * Register into the collision system
   * Then call a callback onLoad
   * @param {GameObject} gameObject the gameobject to add
   * @param {WorldContext} worldContext this world context
   * @param {GameObject} parent the gameobject parent may be null
   * @param {Function} onLoad callback called when loaded
   */
  addGameObject(gameObject, worldContext, parent, onLoad = null) {
    const _this = this;

    gameObject.initAssetsComponents(
      worldContext.getAssetsManager(),
      worldContext.getSharedModule(),
      _this.isServerSide
    );

    Promise.all(this.computePromisesLoad(gameObject, worldContext)).then(
      function () {
        if (parent) {
          parent.addChild(gameObject);
        } else {
          _this.gameObject = gameObject;
        }

        //TODO init can be trigger several time FIXME maybe with a flag in worldscript component
        gameObject.traverse(function (g) {
          g.executeWorldScripts(WorldScriptComponent.EVENT.INIT, [worldContext]);
        });

        _this.registerGOCollision(gameObject);

        console.log(
          gameObject.name,
          gameObject.getUUID() + ' loaded in ',
          _this.name
        );

        if (onLoad) onLoad();
      }
    );
  }

  /**
   * Add a gameobject into the collision system
   * @param {GameObject} go the gameobject to register
   */
  registerGOCollision(go) {
    const _this = this;

    //collisions
    const collisions = this.collisions;
    go.traverse(function (child) {
      if (_this.collisionsBuffer[child.getUUID()]) return; //already add

      _this.collisionsBuffer[child.getUUID()] = [];

      const colliderComponent = child.getComponent(ColliderComponent.TYPE);
      if (colliderComponent) {
        colliderComponent.getShapeWrappers().forEach(function (wrapper) {
          collisions.insert(wrapper.getShape());
        });
      }
    });
  }

  /**
   * Check gameobject transform and update this.collisionsBuffer
   */
  updateCollisionBuffer() {
    //collisions
    const collisions = this.collisions;
    this.gameObject.traverse(function (g) {
      const colliderComponent = g.getComponent(ColliderComponent.TYPE);
      if (colliderComponent) colliderComponent.update();
    });
    collisions.update();

    const _this = this;

    this.gameObject.traverse(function (g) {
      if (g.isStatic()) return;
      const colliderComponent = g.getComponent(ColliderComponent.TYPE);
      if (colliderComponent) {
        colliderComponent.getShapeWrappers().forEach(function (wrapper) {
          const shape = wrapper.getShape();
          const potentials = shape.potentials();
          let result = collisions.createResult();
          for (const p of potentials) {
            //in ShapeWrapper shape are link to gameObject
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
   * @param {GameObject} go the gameobject to remove
   */
  unregisterGOCollision(go) {
    const _this = this;

    //collisions
    go.traverse(function (child) {
      const body = child.getComponent(ColliderComponent.TYPE);
      if (body) {
        body.getShapeWrappers().forEach(function (wrapper) {
          wrapper.getShape().remove();
        });

        //delete from buffer
        delete _this.collisionsBuffer[child.getUUID()];
        for (let id in _this.collisionsBuffer) {
          const index = _this.collisionsBuffer[id].indexOf(go.getUUID());
          if (index >= 0) _this.collisionsBuffer[id].splice(index, 1); //remove from the other
        }
      }
    });
  }

  /**
   * Remove a gameobject from this world
   * @param {String} uuid the uuid of the gameobject to remove
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
   * @param {WorldContext} worldContext
   */
  tick(worldContext) {
    const _this = this;

    //Tick GameObject
    this.gameObject.traverse(function (g) {
      g.executeWorldScripts(WorldScriptComponent.EVENT.TICK, [worldContext]);
    });

    //collisions
    const collisions = this.collisions;
    this.gameObject.traverse(function (g) {
      const colliderComponent = g.getComponent(ColliderComponent.TYPE);
      if (colliderComponent) colliderComponent.update();
    });
    collisions.update();

    this.gameObject.traverse(function (g) {
      if (g.isStatic()) return;
      const colliderComponent = g.getComponent(ColliderComponent.TYPE);
      if (colliderComponent) {
        const collidedGO = [];
        const buffer = _this.collisionsBuffer[g.getUUID()];

        colliderComponent.getShapeWrappers().forEach(function (wrapper) {
          const shape = wrapper.getShape();
          const potentials = shape.potentials();
          let result = collisions.createResult();
          for (const p of potentials) {
            //in ShapeWrapper shape are link to gameObject
            const potentialG = p.getGameObject();
            if (!potentialG.isStatic()) continue;
            if (shape.collides(p, result)) {
              collidedGO.push(potentialG.getUUID());

              //g collides with potentialG
              if (buffer.includes(potentialG.getUUID())) {
                //already collided
                g.traverse(function (child) {
                  child.executeWorldScripts(
                    WorldScriptComponent.EVENT.IS_COLLIDING,
                    [result, worldContext]
                  );
                });
              } else {
                //onEnter
                buffer.push(potentialG.getUUID()); //register in buffer
                g.traverse(function (child) {
                  child.executeWorldScripts(
                    WorldScriptComponent.EVENT.ON_ENTER_COLLISION,
                    [result, worldContext]
                  );
                });
              }
            }
          }
        });

        //notify onExit
        for (let i = buffer.length - 1; i >= 0; i--) {
          const uuid = buffer[i];
          if (!collidedGO.includes(uuid)) {
            g.traverse(function (child) {
              child.executeWorldScripts(
                WorldScriptComponent.EVENT.ON_LEAVE_COLLISION,
                [worldContext]
              );
            });
            buffer.splice(i, 1); //remove from buffer
          }
        }
      }
    });
  }

  /**
   * Return the current world state
   * @returns {WorldState}
   */
  computeWorldState() {
    const result = new WorldState({
      gameObject: this.gameObject.toJSON(true),
      timestamp: Date.now(),
      origin: this.origin,
    });

    return result;
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
   * @returns {Collisions}
   */
  getCollisions() {
    return this.collisions;
  }

  /**
   * Return the uuid of this world
   * @returns {String}
   */
  getUUID() {
    return this.uuid;
  }

  /**
   * Return a clone of this
   * @returns {World}
   */
  clone() {
    return new World(this.toJSON());
  }

  /**
   * Compute this to JSON
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
