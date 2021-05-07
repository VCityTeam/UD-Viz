/**
 * Object with all information about a persistant world
 * each step can export a WorldState
 *
 * @format
 */
const GameObject = require('./GameObject/GameObject');
const ScriptComponent = require('./GameObject/Components/Script');
const ColliderComponent = require('./GameObject/Components/Collider');
const THREE = require('three');
const WorldState = require('./WorldState');
const { Collisions } = require('detect-collisions');

const WorldModule = class World {
  constructor(json, options) {
    if (!json) throw new Error('no json');
    options = options || {};

    //collisions system
    this.collisions = new Collisions();
    this.collisionsBuffer = {}; //to handle onEnter on onExit

    /******************DATA***************************/

    //id
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
    this.origin = json.origin || { lat: 0, lng: 0 };

    /******************INTERNAL***********************/

    //is running on webpage or node app
    this.isServerSide = options.isServerSide || false;
    this.modules = options.modules || {};
    this.listeners = {};

    //DEBUG
    this.firstTick = true;
  }

  //custom event
  on(eventID, cb) {
    if (!this.listeners[eventID]) this.listeners[eventID] = [];
    this.listeners[eventID].push(cb);
  }

  notify(eventID, params) {
    if (!this.listeners[eventID]) this.listeners[eventID] = [];
    this.listeners[eventID].forEach(function (cb) {
      cb(params);
    });
  }

  load(onLoad, gCtx) {
    //load gameobject
    this.addGameObject(this.gameObject, gCtx, null, onLoad);
  }

  computePromisesLoad(go, gCtx) {
    //load GameObject
    const promises = [];
    let params = [gCtx, this.isServerSide, this.modules];

    go.traverse(function (g) {
      const scriptC = g.getComponent(ScriptComponent.TYPE);
      if (scriptC) {
        for (let idScript in scriptC.getScripts()) {
          const result = scriptC.executeScript(
            idScript,
            ScriptComponent.EVENT.LOAD,
            params
          );
          if (result) promises.push(result);
        }
      }
    });

    return promises;
  }

  addGameObject(gameObject, gCtx, parent, onLoad = null) {
    const _this = this;

    gameObject.initAssetsComponents(
      gCtx.assetsManager,
      gCtx.UDVShared,
      _this.isServerSide
    );

    Promise.all(this.computePromisesLoad(gameObject, gCtx)).then(function () {
      if (parent) {
        parent.addChild(gameObject);
      } else {
        _this.gameObject = gameObject;
      }

      gameObject.traverse(function (g) {
        g.executeScripts(ScriptComponent.EVENT.INIT, [gCtx]);
      });

      _this.registerGOCollision(gameObject);

      console.log(gameObject.name + ' loaded');

      if (onLoad) onLoad();
    });
  }

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

    this.updateCollisionBuffer();
  }

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
              debugger;
            }
          }
        });
      }
    });

    // console.log(this.name);
    console.log(this.collisionsBuffer);
    // console.log(this.collisions);

    //TODO WHEN transfert world this buffer is wrongly computed and its bugging
  }

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

  removeGameObject(uuid) {
    const go = this.gameObject.find(uuid);
    go.removeFromParent();
    this.unregisterGOCollision(go);
  }

  tick(gCtx) {
    if (this.firstTick) {
      this.firstTick = false;
      debugger;
    }

    const _this = this;

    //Tick GameObject
    this.gameObject.traverse(function (g) {
      g.executeScripts(ScriptComponent.EVENT.TICK, [gCtx]);
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
                  child.executeScripts(ScriptComponent.EVENT.IS_COLLIDING, [
                    result,
                    gCtx,
                  ]);
                });
              } else {
                //onEnter
                buffer.push(potentialG.getUUID()); //register in buffer
                g.traverse(function (child) {
                  child.executeScripts(
                    ScriptComponent.EVENT.ON_ENTER_COLLISION,
                    [result, gCtx]
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
              child.executeScripts(ScriptComponent.EVENT.ON_LEAVE_COLLISION, [
                gCtx,
              ]);
            });
            buffer.splice(i, 1); //remove from buffer
          }
        }
      }
    });
  }

  computeWorldState() {
    const result = new WorldState({
      gameObject: null,
      timestamp: Date.now(),
      origin: this.origin,
    });

    //share same gameobject to avoid gameobject.toJSON then instanciate a new one
    result.setGameObject(this.gameObject);

    return result;
  }

  getGameObject() {
    return this.gameObject;
  }

  getCollisions() {
    return this.collisions;
  }

  getUUID() {
    return this.uuid;
  }

  clone() {
    return new World(this.toJSON());
  }

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
