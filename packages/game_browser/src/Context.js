import { RenderController } from './RenderController';
import { AudioController } from './AudioController';
import { AssetManager } from './AssetManager';
import { InputManager } from './InputManager';

import * as THREE from 'three';
import { bindLightTransform } from '@ud-viz/utils_browser';
import {
  Command,
  Object3D,
  State,
  ExternalScriptComponent,
  AudioComponent,
  RenderComponent,
  ScriptController,
  constant,
} from '@ud-viz/game_shared';
import { arrayEquals } from '@ud-viz/utils_shared';
import * as frame3d from '@ud-viz/frame3d';

/** @class */
export class Context {
  /**
   * @memberof gameBrowser
   * Handle rendering {@link RenderController}, inputs of user {@link InputManager}, audio {@link AudioController}, trigger {@link ScriptBase} event
   * @param {frame3d.Base|frame3d.Planar} frame3D - frame3D view of the game
   * @param {AssetManager} assetManager - asset manager {@link AssetManager}
   * @param {InputManager} inputManager - input manager {@link InputManager}
   * @param {Object<string,ScriptBase>} externalGameScriptClass - custom external script {@link ScriptBase}
   * @param {object} options - options of context
   * @param {object} options.userData - user data of context
   * @param {object} options.socketIOWrapper - socket io wrapper if multi
   * @param {object} options.interpolator - interpolator
   */
  constructor(
    frame3D,
    assetManager,
    inputManager,
    externalGameScriptClass,
    options = {}
  ) {
    /**
     * delta time of context
     *
      @type {number}  */
    this.dt = 0;

    /**
     *
     * @returns {Object<string,ScriptBase>} - formated gamescript class
     */
    const formatExternalGameScriptClass = () => {
      const result = {};

      const parse = (object) => {
        for (const key in object) {
          const value = object[key];

          if (value.prototype instanceof ScriptBase) {
            if (result[value.ID_SCRIPT])
              throw new Error('no unique id ' + value.ID_SCRIPT);
            result[value.ID_SCRIPT] = value;
          } else if (value instanceof Object) {
            parse(value);
          } else {
            console.error(object, value, key, object.name);
            throw new Error(
              'wrong value type ' + typeof object + ' key ' + key
            );
          }
        }
      };

      parse(externalGameScriptClass);

      return result;
    };

    /**
     * custom {@link ScriptBase} that can be used by object3D
     *
      @type {Object<string,ScriptBase>}  */
    this.externalGameScriptClass = formatExternalGameScriptClass();

    /**
     * frame3D view of game
     *
      @type {frame3d.Base|frame3d.Planar}  */
    this.frame3D = null;

    /**
     * asset manager
     *
      @type {AssetManager}  */
    this.assetManager = assetManager;

    /**
     * input manager 
     *
      @type {InputManager}  */
    this.inputManager = inputManager;

    /**
     * socket io wrapper
     *  
      @type {import('../SocketIOWrapper')|null}  */
    this.socketIOWrapper = options.socketIOWrapper || null;

    /**
     * interpolator
     *  
      @type {object|null}  */
    this.interpolator = options.interpolator || null;

    /**
     * root object3D
     *
      @type {THREE.Object3D}  */
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'External_Game_Context_Object3D';

    /**
     * register uuid of object3D in context to identify new one incoming
     *
      @type {Object<string,boolean>} */
    this.currentUUID = {};

    /**
     * current root gameobject3D (child of this.object3D)
     *
      @type {Object3D} */
    this.currentGameObject3D = null;

    /**
     * user data context
     *
      @type {object}  */
    this.userData = options.userData || {};

    /**
     * record when a object3D external has been executed for the last time
     *
     * @type {object}
     */
    this._bufferLastTimeTickObject3D = new Map();

    this.initFrame3D(frame3D);
  }

  /**
   *
   *
   * @param {frame3d.Planar|frame3d.Base} frame3D - intialize frame3D of context
   */
  initFrame3D(frame3D) {
    if (this.frame3D) {
      this.frame3D.scene.remove(this.object3D);
    }

    this.frame3D = frame3D;

    // register listener
    this.frame3D.on(frame3d.Base.EVENT.DISPOSE, () => {
      if (this.currentGameObject3D) {
        this.currentGameObject3D.traverse(function (child) {
          if (!child.isGameObject3D) return;

          const scriptComponent = child.getComponent(
            ExternalScriptComponent.TYPE
          );
          if (scriptComponent) {
            scriptComponent.getController().execute(Context.EVENT.DISPOSE);
          }
          const audioComponent = child.getComponent(AudioComponent.TYPE);
          if (audioComponent) audioComponent.getController().dispose();
        });
      }
    });

    this.frame3D.on(frame3d.Base.EVENT.RESIZE, () => {
      if (this.currentGameObject3D) {
        this.currentGameObject3D.traverse(function (child) {
          if (!child.isGameObject3D) return;

          const scriptComponent = child.getComponent(
            ExternalScriptComponent.TYPE
          );
          if (scriptComponent) {
            scriptComponent.getController().execute(Context.EVENT.ON_RESIZE);
          }
        });
      }
    });

    this.frame3D.scene.add(this.object3D); // add it to the frame3D scene
  }

  /**
   * Reset context state and initialize the new frame3D
   *
   * @param {frame3d.Planar|frame3d.Base} newFrame3D - new frame3D to reset with
   */
  reset(newFrame3D) {
    if (this.currentGameObject3D) {
      this.object3D.remove(this.currentGameObject3D);
      this.currentGameObject3D = null;
    }
    this.currentUUID = {};

    this.initFrame3D(newFrame3D);
  }

  /**
   * Step context
   *
   * @param {number} dt - new delta time context
   * @param {Array<State>} states - new states to update context current gameobject3D
   */
  step(dt, states) {
    this.dt = dt; // ref it for external scripts

    /** @type {Object3D[]} */
    const newGO = [];

    /** @type {State} */
    const state = states[states.length - 1]; // The more current of states

    // Update currentGameObject3D with the new states
    if (this.currentGameObject3D) {
      this.currentGameObject3D.traverse((child) => {
        if (!child.isGameObject3D) return;

        const gameContextChild = state
          .getObject3D()
          .getObjectByProperty('uuid', child.uuid);
        if (gameContextChild) {
          // still present in game context
          if (child.hasGameContextUpdate()) {
            if (!child.isStatic()) {
              // if no static update transform
              child.position.copy(gameContextChild.position);
              child.scale.copy(gameContextChild.scale);
              child.rotation.copy(gameContextChild.rotation);
            }

            // Stack the same go of all states not consumed yet
            const bufferedGO = [];
            states.forEach((s) => {
              const bGO = s
                .getObject3D()
                .getObjectByProperty('uuid', child.uuid);
              if (bGO) bufferedGO.push(bGO);
            });

            // Update local component for bufferedGO
            let componentHasBeenUpdated = false; // Flag to know if a change of state occured

            const childRenderComp = child.getComponent(RenderComponent.TYPE);
            const childExternalScriptComp = child.getComponent(
              ExternalScriptComponent.TYPE
            );

            for (let index = 0; index < bufferedGO.length; index++) {
              const gameContextGONotConsumned = bufferedGO[index];

              // Render comp
              if (childRenderComp) {
                const bufferedRenderComp =
                  gameContextGONotConsumned.getComponent(RenderComponent.TYPE);

                // Check if color change
                if (
                  !arrayEquals(
                    childRenderComp.getModel().getColor(),
                    bufferedRenderComp.getModel().getColor()
                  )
                ) {
                  console.error('DEPRECATED');
                  childRenderComp.setColor(bufferedRenderComp.getColor());
                  componentHasBeenUpdated = true; // Notify change
                }

                // Check if idModel change
                if (
                  childRenderComp.getModel().getIdRenderData() !=
                  bufferedRenderComp.getModel().getIdRenderData()
                ) {
                  console.error('DEPRECATED');
                  childRenderComp
                    .getController()
                    .setIdRenderData(
                      bufferedRenderComp.getModel().getIdRenderData()
                    );

                  componentHasBeenUpdated = true;
                }
              }

              if (
                childExternalScriptComp &&
                gameContextGONotConsumned.isOutdated()
              ) {
                const bufferedExternalScriptComp =
                  gameContextGONotConsumned.getComponent(
                    ExternalScriptComponent.TYPE
                  );

                // Replace variables in external script
                childExternalScriptComp
                  .getController()
                  .setVariables(
                    bufferedExternalScriptComp.getModel().getVariables()
                  );

                // Launch event onOutdated
                componentHasBeenUpdated =
                  componentHasBeenUpdated ||
                  childExternalScriptComp
                    .getController()
                    .execute(Context.EVENT.ON_OUTDATED);
              }
            }

            if (componentHasBeenUpdated && childExternalScriptComp) {
              // Launch event onComponentUpdate
              childExternalScriptComp
                .getController()
                .execute(Context.EVENT.ON_COMPONENT_UPDATE);
            }
          }
        } else {
          // Do not exist remove it
          child.removeFromParent();

          // clean buffer
          this._bufferLastTimeTickObject3D.delete(child.uuid);

          // external script event remove
          const scriptComponent = child.getComponent(
            ExternalScriptComponent.TYPE
          );
          if (scriptComponent) {
            scriptComponent.getController().execute(Context.EVENT.ON_REMOVE);
          }

          // Audio removal
          const audioComponent = child.getComponent(AudioComponent.TYPE);
          if (audioComponent) {
            audioComponent.getController().dispose();
          }

          // notify other that child is removed
          this.currentGameObject3D.traverse((otherGameObject) => {
            if (!otherGameObject.isGameObject3D) return;
            const externalComp = otherGameObject.getComponent(
              ExternalScriptComponent.TYPE
            );
            if (externalComp) {
              externalComp
                .getController()
                .execute(Context.EVENT.ON_GAMEOBJECT_REMOVED, [child]);
            }
          });

          delete this.currentUUID[child.uuid];
        }
      });

      state.getObject3D().traverse((child) => {
        if (!child.isGameObject3D) return; // => this one should be useless since State should be only compose of GameObject3D

        const old = this.currentGameObject3D.getObjectByProperty(
          'uuid',
          child.uuid
        );
        if (!old) {
          // New one add it
          const parent = this.currentGameObject3D.getObjectByProperty(
            'uuid',
            child.parentUUID
          );

          parent.add(child);
        }

        if (!this.currentUUID[child.uuid]) {
          newGO.push(child);
        }
      });
    } else {
      // first state
      this.currentGameObject3D = state.getObject3D();
      // add object3D to the context
      this.object3D.add(this.currentGameObject3D);

      this.currentGameObject3D.traverse((child) => {
        if (!child.isGameObject3D) return; // => this one should be useless since State should be only compose of GameObject3D

        newGO.push(child);
      });
    }

    // Init Object3D component controllers of the new Object3D
    newGO.forEach((go) => {
      this.initComponentControllers(go);
      // update matrix world so even object.static have a correct since the autoupdate is disable
      go.updateMatrixWorld(true);
    });

    newGO.forEach((g) => {
      this.currentUUID[g.uuid] = true;

      const scriptComponent = g.getComponent(ExternalScriptComponent.TYPE);
      if (scriptComponent) {
        scriptComponent.getController().execute(Context.EVENT.INIT);
      }

      // Notify other go that a new go has been added
      this.currentGameObject3D.traverse((child) => {
        if (!child.isGameObject3D) return;

        const otherScriptComponent = child.getComponent(
          ExternalScriptComponent.TYPE
        );
        if (otherScriptComponent) {
          otherScriptComponent
            .getController()
            .execute(Context.EVENT.ON_NEW_GAMEOBJECT, [g]);
        }
      });
    });

    // Update matrixWorld
    this.object3D.updateMatrixWorld();

    // Update shadow
    if (newGO.length) {
      bindLightTransform(
        this.frame3D.sceneConfig.sky.sun_position.offset,
        this.frame3D.sceneConfig.sky.sun_position.phi,
        this.frame3D.sceneConfig.sky.sun_position.theta,
        this.object3D,
        this.frame3D.directionalLight
      );
    }

    this.currentGameObject3D.traverse((child) => {
      if (!child.isGameObject3D) return;

      // Tick local script
      const scriptComponent = child.getComponent(ExternalScriptComponent.TYPE);
      if (scriptComponent) {
        const mapTickRateMs =
          scriptComponent.model.variables[constant.SCRIPT.MAP_TICK_RATE_MS];

        if (mapTickRateMs) {
          // some script has a time rate

          const now = Date.now();

          const scripts = scriptComponent.getController().scripts;
          for (const idScript in scripts) {
            const scriptTickRateMs = mapTickRateMs[idScript];
            if (!isNaN(scriptTickRateMs)) {
              // this script has a tick rate

              // intialize object3d
              if (!this._bufferLastTimeTickObject3D.has(child.uuid)) {
                this._bufferLastTimeTickObject3D.set(child.uuid, new Map());
              }

              const bufferObject3D = this._bufferLastTimeTickObject3D.get(
                child.uuid
              );

              // initialize script
              if (!bufferObject3D.has(idScript)) {
                bufferObject3D.set(idScript, 0);
              }

              if (now - bufferObject3D.get(idScript) > scriptTickRateMs) {
                scriptComponent
                  .getController()
                  .executeScript(scripts[idScript], Context.EVENT.TICK);
                bufferObject3D.set(idScript, now);
              }
            } else {
              // no tick rate for this script
              scriptComponent
                .getController()
                .executeScript(scripts[idScript], Context.EVENT.TICK);
            }
          }
        } else {
          // no time rate
          scriptComponent.getController().execute(Context.EVENT.TICK);
        }
      }

      // Tick audio component
      const audioComp = child.getComponent(AudioComponent.TYPE);
      // Position in world referential
      if (audioComp) {
        const camera = this.frame3D.camera;
        const cameraMatWorldInverse = camera.matrixWorldInverse;
        audioComp.getController().tick(cameraMatWorldInverse);
      }

      // Render component
      const renderComp = child.getComponent(RenderComponent.TYPE);
      if (renderComp) renderComp.getController().tick(dt);
    });
  }

  /**
   *
   * @param {Object3D} go - gameobject3D to init controllers
   */
  initComponentControllers(go) {
    const components = go.getComponents();
    for (const type in components) {
      const component = go.getComponent(type);
      if (component.getController()) {
        throw new Error('controller already init ' + go.name);
      }
      const scripts = {};
      switch (type) {
        case AudioComponent.TYPE:
          component.initController(
            new AudioController(component.getModel(), go, this.assetManager)
          );
          break;
        case RenderComponent.TYPE:
          component.initController(
            new RenderController(component.getModel(), go, this.assetManager)
          );
          break;
        case ExternalScriptComponent.TYPE:
          component
            .getModel()
            .getIdScripts()
            .forEach((idScript) => {
              scripts[idScript] = this.createInstanceOf(
                idScript,
                go,
                component.getModel().getVariables()
              );
            });
          component.initController(
            new ScriptController(component.getModel(), go, scripts)
          );
          break;
        default:
        // no need to initialize controller for this component
      }
    }
  }

  /**
   * Create a class instance of external game script class for an object3D  given an id
   *
   * @param {string} id - id of the class
   * @param {Object3D} object3D - object3D that is going to use this instance
   * @param {object} modelVariables - custom variables associated to this instance
   * @returns {ScriptBase} - instance of the class bind with object3D and modelVariables
   */
  createInstanceOf(id, object3D, modelVariables) {
    const constructor = this.externalGameScriptClass[id];
    if (!constructor) {
      console.log('script loaded');
      for (const key in this.externalGameScriptClass) {
        console.log(this.externalGameScriptClass[key].name);
      }
      throw new Error('no script with id ' + id);
    }
    return new constructor(this, object3D, modelVariables);
  }

  /**
   *
   * @param {string} id - id of script
   * @param {Object3D} [object3D=this.object3D] - object3D to traverse to find the external script (default is the root game object3D)
   * @returns {ScriptBase|null} - first external script with id or null if none are found
   */
  findExternalScriptWithID(id, object3D = this.object3D) {
    let result = null;

    object3D.traverse(function (child) {
      if (!child.isGameObject3D) return;

      const externalScriptComp = child.getComponent(
        ExternalScriptComponent.TYPE
      );

      if (!externalScriptComp) return;

      const scripts = externalScriptComp.getController().getScripts();
      if (scripts && scripts[id]) {
        result = scripts[id];
        return true;
      }
      return false;
    });

    return result;
  }

  /**
   *
   * @param {string} id - id of script
   * @returns {Object3D|null} - first game object3D with external script id or null if none are found
   */
  findGameObjectWithExternalScriptID(id) {
    let result = null;
    this.object3D.traverse(function (child) {
      if (!child.isGameObject3D) return;

      const externalScriptComp = child.getComponent(
        ExternalScriptComponent.TYPE
      );

      if (!externalScriptComp) return;

      const scripts = externalScriptComp.getController().getScripts();
      if (scripts && scripts[id]) {
        result = child;
        return true;
      }
      return false;
    });

    return result;
  }

  /**
   * This method need to be implemented by user
   *
   * @param {Command[]} cmds - commands to send to game context
   */
  sendCommandsToGameContext(cmds) {
    console.log(cmds, ' cant be sent');
    console.error('this method has to be implement in your app template');
  }
}

/**
 * Event triggered by context to {@link ScriptBase}
 */
Context.EVENT = {
  INIT: 'init',
  TICK: 'tick',
  ON_NEW_GAMEOBJECT: 'onNewGameObject',
  ON_GAMEOBJECT_REMOVED: 'onGameObjectRemoved',
  ON_OUTDATED: 'onOutdated',
  DISPOSE: 'dispose',
  ON_REMOVE: 'onRemove',
  ON_COMPONENT_UPDATE: 'onComponentUpdate',
  ON_RESIZE: 'onResize',
};

export class ScriptBase {
  /**
   * Skeleton of a game context script, different {@link Context.EVENT} are trigger by {@link Context}
   *
   * @param {Context} context - context of this script
   * @param {Object3D} object3D - object3D bind (attach) to this script
   * @param {object} variables - custom variables bind (attach) to this script
   */
  constructor(context, object3D, variables) {
    /**
     * context of this script
     *
      @type {Context}  */
    this.context = context;
    /**
     * object3D attach to this script
     * 
     @type {Object3D}  */
    this.object3D = object3D;
    /**
     * custom variables attach to this script
     *
      @type {object}  */
    this.variables = variables;
  }
  /**
   * call after an object3D has been added to context
   */
  init() {}
  /**
   * call every step
   */
  tick() {}
  /**
   * call when a new gameobject3D have been added to context
   *
   * @param {Object3D} newGameObject - new gameobject3D
   */
  // eslint-disable-next-line no-unused-vars
  onNewGameObject(newGameObject) {}
  /**
   * call when a gameobject3D have been removed from context
   *
   * @param {Object3D} gameobject3DRemoved - gameobject3D removed
   */
  // eslint-disable-next-line no-unused-vars
  onGameObjectRemoved(gameobject3DRemoved) {}
  /**
   * call every time your game object3D model has changed
   */
  onOutdated() {}
  /**
   * call when this gameobject 3D is removed from context
   */
  onRemove() {}
  /**
   * call when an external script onOutdated return true
   */
  onComponentUpdate() {}
  /**
   * call when frame3D is disposed
   */
  dispose() {}
  /**
   * call when frame3D is resized
   */
  onResize() {}

  static get ID_SCRIPT() {
    console.error(this.name);
    throw new Error('this is abstract class you should override ID_SCRIPT');
  }
}
