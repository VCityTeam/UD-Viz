/**
 * Object with all information about a persistant world
 * each step can export a WorldState
 *
 * @format
 */
const GameObject = require('./GameObject/GameObject');
const ScriptComponent = require('./GameObject/Components/ScriptComponent');
const BodyComponent = require('./GameObject/Components/BodyComponent');
const THREE = require('three');
const WorldState = require('./WorldState');
const { Collisions } = require('detect-collisions');

const WorldModule = class World {
  constructor(json, options) {
    if (!json) throw new Error('no json');
    options = options || {};

    //collisions system
    this.collisions = new Collisions();

    /******************DATA***************************/

    //id
    this.uuid = json.uuid || THREE.Math.generateUUID();

    //gameobject
    if (json.gameObject) {
      this.addGameObject(new GameObject(json.gameObject));
    }

    //name of the world
    this.name = json.name || 'default_world';

    //origin
    this.origin = json.origin || { lat: 0, lng: 0 };

    /******************INTERNAL***********************/

    //is running on webpage or node app
    this.isServerSide = options.isServerSide || false;
    this.modules = options.modules || {};
  }

  load(onLoad) {
    //load GameObject
    const promises = [];
    let params;
    if (this.isServerSide) {
      params = [this.isServerSide, this.modules.gm, this.modules.PNG];
    } else {
      params = [this.isServerSide];
    }
    this.gameObject.traverse(function (g) {
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
    Promise.all(promises).then(onLoad);
  }

  addGameObject(gameObject) {
    if (!this.gameObject) {
      this.gameObject = gameObject;
    } else {
      this.gameObject.addChild(gameObject);
    }

    //collisions
    const collisions = this.collisions;
    let changed = false;
    gameObject.traverse(function (child) {
      const body = child.getComponent(BodyComponent.TYPE);
      if (body) {
        changed = true;
        body.getBodies().forEach(function (b) {
          collisions.insert(b);
        });
      }
    });
    if (changed) collisions.update();

    //init
    gameObject.executeScripts(ScriptComponent.EVENT.INIT, []);
  }

  removeGameObject(uuid) {
    let goRemoved = null;
    this.gameObject.traverse(function (g) {
      if (g.getUUID() == uuid) {
        g.removeFromParent();
        goRemoved = g;
      }
    });

    //collisions
    let changed = false;
    goRemoved.traverse(function (child) {
      const body = child.getComponent(BodyComponent.TYPE);
      if (body) {
        changed = true;
        body.getBodies().forEach(function (b) {
          b.remove();
        });
      }
    });
    if (changed) this.collisions.update();

    if (this.gameObject.find(uuid)) throw new Error('not deleted');
  }

  tick(commands, dt) {
    //Tick GameObject
    this.gameObject.traverse(function (g) {
      g.executeScripts(ScriptComponent.EVENT.TICK, [commands, dt]);
    });

    //collisions
    const collisions = this.collisions;
    this.gameObject.traverse(function (g) {
      const bC = g.getComponent(BodyComponent.TYPE);
      if (bC) bC.update(); //TODO créer une classe parent pour accéder au go
    });
    collisions.update();

    this.gameObject.traverse(function (g) {
      if (g.isStatic()) return;
      const bC = g.getComponent(BodyComponent.TYPE);
      if (bC) {
        //TODO seulement collider les non static avec les static
        bC.getBodies().forEach(function (body) {
          const potentials = body.potentials();
          let result = collisions.createResult();
          for (const p of potentials) {
            if (body.collides(p, result)) {
              bC.onCollision(result);
            }
          }
        });
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
