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
} from '@ud-viz/game_shared';
import { arrayEquals, objectOverWrite } from '@ud-viz/utils_shared';
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

    const state = states[states.length - 1]; // The more current of states

    // Update currentGameObject3D with the new states
    if (this.currentGameObject3D) {
      const object3DToRemove = [];
      // remove gameobject 3D that has been removed in game context
      this.currentGameObject3D.traverse((child) => {
        if (!child.isGameObject3D) return;
        const gameContextChild = state
          .getObject3D()
          .getObjectByProperty('uuid', child.uuid);
        if (!gameContextChild) {
          object3DToRemove.push(child);
        }
      });
      object3DToRemove.forEach((object3D) => {
        // Do not exist remove it
        object3D.removeFromParent();

        // external script event remove
        const scriptComponent = object3D.getComponent(
          ExternalScriptComponent.TYPE
        );
        if (scriptComponent) {
          scriptComponent.getController().execute(Context.EVENT.ON_REMOVE);
        }

        // Audio removal
        const audioComponent = object3D.getComponent(AudioComponent.TYPE);
        if (audioComponent) {
          audioComponent.getController().dispose();
        }

        // notify other that object3D is removed
        this.currentGameObject3D.traverse((otherGameObject) => {
          if (!otherGameObject.isGameObject3D) return;
          const externalComp = otherGameObject.getComponent(
            ExternalScriptComponent.TYPE
          );
          if (externalComp) {
            externalComp
              .getController()
              .execute(Context.EVENT.ON_GAMEOBJECT_REMOVED, [object3D]);
          }
        });

        delete this.currentUUID[object3D.uuid];
      });

      // update the others
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

            // visible
            child.visible = gameContextChild.visible;

            // Stack the same go of all states not consumed yet
            const bufferedGO = [];
            states.forEach((s) => {
              const bGO = s
                .getObject3D()
                .getObjectByProperty('uuid', child.uuid);
              if (bGO) bufferedGO.push(bGO);
            });

            const childRenderComp = child.getComponent(RenderComponent.TYPE);
            const childExternalScriptComp = child.getComponent(
              ExternalScriptComponent.TYPE
            );

            let renderCompHasChanged = false;
            for (let index = 0; index < bufferedGO.length; index++) {
              const gameContextGONotConsumned = bufferedGO[index];

              // Render comp
              if (childRenderComp) {
                const bufferedRenderComp =
                  gameContextGONotConsumned.getComponent(RenderComponent.TYPE);

                // Check if color change
                if (
                  !arrayEquals(
                    childRenderComp.model.color,
                    bufferedRenderComp.model.color
                  )
                ) {
                  childRenderComp
                    .getController()
                    .setColor(bufferedRenderComp.model.color);
                  renderCompHasChanged = true;
                }

                // Check if idRenderData change
                if (
                  childRenderComp.model.idRenderData !=
                  bufferedRenderComp.model.idRenderData
                ) {
                  childRenderComp
                    .getController()
                    .setIdRenderData(bufferedRenderComp.model.idRenderData);
                  renderCompHasChanged = true;
                }
              }

              if (childExternalScriptComp && renderCompHasChanged) {
                childExternalScriptComp
                  .getController()
                  .execute(Context.EVENT.ON_RENDER_COMPONENT_CHANGED);
              }

              // external script
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
                  .setVariables(bufferedExternalScriptComp.model.variables);

                // Launch event onOutdated
                childExternalScriptComp
                  .getController()
                  .execute(Context.EVENT.ON_OUTDATED);
              }
            }
          }
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

          const object3DToAdd = child.clone();

          parent.add(object3DToAdd);
          newGO.push(object3DToAdd);
          if (this.currentUUID[object3DToAdd.uuid]) {
            console.error('already in current uuid');
          }
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
    if (newGO.length && this.frame3D.sceneConfig) {
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

      // Tick external script
      const scriptComponent = child.getComponent(ExternalScriptComponent.TYPE);
      if (scriptComponent) {
        scriptComponent.getController().execute(Context.EVENT.TICK);
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
      let scripts = null;
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
          scripts = new Map();
          component.getModel().scriptParams.forEach((sParams) => {
            scripts.set(
              sParams.id,
              this.createInstanceOf(
                sParams.id,
                go,
                component.getModel().variables
              )
            );
          });

          scripts = new Map(
            [...scripts.entries()].sort((a, b) => {
              const aSParam = component
                .getModel()
                .scriptParams.filter((el) => el.id === a[0]);
              const bSParam = component
                .getModel()
                .scriptParams.filter((el) => el.id === b[0]);

              const aPrio = !isNaN(aSParam[0].priority)
                ? aSParam[0].priority
                : -Infinity;
              const bPrio = !isNaN(bSParam[0].priority)
                ? bSParam[0].priority
                : -Infinity;

              return bPrio - aPrio;
            })
          );
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

      const scripts = externalScriptComp.getController().scripts;
      if (scripts && scripts.has(id)) {
        result = scripts.get(id);
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
  ON_RENDER_COMPONENT_CHANGED: 'onRenderComponentChanged',
  ON_RESIZE: 'onResize',
};

export class ScriptBase extends THREE.EventDispatcher {
  /**
   * Skeleton of a game context script, different {@link Context.EVENT} are trigger by {@link Context}
   *
   * @param {Context} context - context of this script
   * @param {Object3D} object3D - object3D bind (attach) to this script
   * @param {object} variables - custom variables bind (attach) to this script
   */
  constructor(context, object3D, variables) {
    super();
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
     * @type {object}
     */
    this.variables = objectOverWrite(
      JSON.parse(JSON.stringify(this.constructor.DEFAULT_VARIABLES)),
      variables
    );
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
   * call when frame3D is disposed
   */
  dispose() {}
  /**
   * call when frame3D is resized
   */
  onResize() {}
  /**
   * call when the render component of the object has changed
   */
  onRenderComponentChanged() {}

  static get ID_SCRIPT() {
    console.error(this.name);
    throw new Error('this is abstract class you should override ID_SCRIPT');
  }

  /**
   *
   * @returns {object} - default variables of this script
   */
  static get DEFAULT_VARIABLES() {
    return {};
  }
}
