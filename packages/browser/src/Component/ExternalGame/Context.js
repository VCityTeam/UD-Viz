const THREE = require('three');
import { AssetManager, InputManager, THREEUtil } from '../Component';
import { Game, Data, Command } from '@ud-viz/core';
import { RenderController } from './RenderController';
import { AudioController } from './AudioController';
import { Frame3DBase, Frame3DPlanar } from '../Frame3D/Frame3D';

/**
 * @typedef SceneConfig
 * @property {number} shadowMapSize - size of shadow map
 * @property {object} sky - sky property
 * @property {{r:number,g:number,b:number}} sky.color - rgb color (value are between [0,1])
 * @property {{offset:number,phi:number,theta:number}} sky.sun_position - position of the sun in sheprical coord (phi theta) + an offset {@link THREEUtil.bindLightTransform}
 */

/**
 * @type {SceneConfig} Default scene 3D config
 */
const defaultConfigScene = {
  shadowMapSize: 2046,
  sky: {
    color: {
      r: 0.4,
      g: 0.6,
      b: 0.8,
    },
    sun_position: {
      offset: 10,
      phi: 1,
      theta: 0.3,
    },
  },
};

export class Context {
  /**
   * Handle {@link RenderController} + external script {@link Game.Component.ScriptController} + {@link AudioController}
   *
   * @param {Frame3DBase|Frame3DPlanar} frame3D - frame3D view of the game
   * @param {AssetManager} assetManager - asset manager {@link AssetManager}
   * @param {InputManager} inputManager - input manager {@link InputManager}
   * @param {Object<string,ExternalScriptBase>} externalGameScriptClass - custom external script {@link ExternalScriptBase}
   * @param {object} options - options of context
   * @param {object} options.userData - user data of context
   * @param {SceneConfig} options.sceneConfig - config of the scene 3D
   */
  constructor(
    frame3D,
    assetManager,
    inputManager,
    externalGameScriptClass,
    options = {}
  ) {
    /** @type {number} - delta time of context */
    this.dt = 0;

    /** @type {Object<string,ExternalScriptBase>} - custom {@link ExternalScriptBase} that can be used by object3D */
    this.externalGameScriptClass = externalGameScriptClass;

    /** @type {Frame3DBase|Frame3DPlanar} - frame3D view of game */
    this.frame3D = frame3D;

    /** @type {AssetManager} - asset manager */
    this.assetManager = assetManager;

    /** @type {InputManager} - input manager */
    this.inputManager = inputManager;

    /** @type {THREE.Object3D} - root object3D */
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'External_Game_Context_Object3D';
    this.frame3D.scene.add(this.object3D); // add it to the frame3D scene

    /** @type {Object<string,boolean>} - register uuid of object3D in context to identify new one incoming*/
    this.currentUUID = {};

    /** @type {Game.Object3D} - current root gameobject3D (child of this.object3D) */
    this.currentGameObject3D = null;

    /** @type {object} - user data context */
    this.userData = options.userData || {};

    // Overwrite conf
    const overWriteConf = JSON.parse(JSON.stringify(defaultConfigScene));
    Data.objectOverWrite(overWriteConf, options.sceneConfig || {});
    /** @type {SceneConfig} - config of scene 3D */
    this.configScene = overWriteConf;
    /** @type {THREE.DirectionalLight} - directional light of scene 3D */
    this.directionalLight = null;
    this.initScene();

    // register listener
    this.frame3D.on(Frame3DBase.EVENT.DISPOSE, () => {
      if (this.currentGameObject3D) {
        this.currentGameObject3D.traverse(function (child) {
          if (!child.isGameObject3D) return;

          const scriptComponent = child.getComponent(
            Game.Component.ExternalScript.TYPE
          );
          if (scriptComponent) {
            scriptComponent.getController().execute(Context.EVENT.DISPOSE);
          }
          const audioComponent = child.getComponent(Game.Component.Audio.TYPE);
          if (audioComponent) audioComponent.getController().dispose();
        });
      }
    });

    this.frame3D.on(Frame3DBase.EVENT.RESIZE, () => {
      if (this.currentGameObject3D) {
        this.currentGameObject3D.traverse(function (child) {
          if (!child.isGameObject3D) return;

          const scriptComponent = child.getComponent(
            Game.Component.ExternalScript.TYPE
          );
          if (scriptComponent) {
            scriptComponent.getController().execute(Context.EVENT.ON_RESIZE);
          }
        });
      }
    });
  }

  /**
   * Init scene 3D with this.configScene {@link SceneConfig}
   */
  initScene() {
    // Init renderer
    THREEUtil.initRenderer(
      this.frame3D.getRenderer(),
      new THREE.Color(
        this.configScene.sky.color.r,
        this.configScene.sky.color.g,
        this.configScene.sky.color.b
      )
    );

    // Add lights
    const { directionalLight } = THREEUtil.addLights(this.frame3D.getScene());
    this.directionalLight = directionalLight;

    // Configure shadows based on a config files
    this.directionalLight.shadow.mapSize = new THREE.Vector2(
      this.configScene.shadowMapSize,
      this.configScene.shadowMapSize
    );
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.bias = -0.0005;

    if (this.configScene.sky.paths) {
      THREEUtil.addCubeTexture(
        this.configScene.sky.paths,
        this.frame3D.getScene()
      );
    }
  }

  /**
   * Step context
   *
   * @param {number} dt - new delta time context
   * @param {Game.State[]} states - new states to update context current gameobject3D
   * @param {boolean} [updateGameObject=true] - if false controllers are not going to tick
   * @todo remove updateGameObject
   */
  step(dt, states, updateGameObject = true) {
    this.dt = dt; // ref it for external scripts

    /** @type {Game.Object3D[]} */
    const newGO = [];
    const state = states[states.length - 1]; // The more current of states

    // Update currentGameObject3D with the new states
    if (this.currentGameObject3D) {
      if (updateGameObject) {
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

              const childRenderComp = child.getComponent(
                Game.Component.Render.TYPE
              );
              const childExternalScriptComp = child.getComponent(
                Game.Component.ExternalScript.TYPE
              );

              for (let index = 0; index < bufferedGO.length; index++) {
                const gameContextGONotConsumned = bufferedGO[index];

                // Render comp
                if (childRenderComp) {
                  const bufferedRenderComp =
                    gameContextGONotConsumned.getComponent(
                      Game.Component.Render.TYPE
                    );

                  // Check if color change
                  if (
                    !childRenderComp
                      .getModel()
                      .getColor()
                      .equals(bufferedRenderComp.getModel().getColor())
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
                      Game.Component.ExternalScript.TYPE
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

            // external script event remove
            const scriptComponent = child.getComponent(
              Game.Component.ExternalScript.TYPE
            );
            if (scriptComponent) {
              scriptComponent.getController().execute(Context.EVENT.ON_REMOVE);
            }

            // Audio removal
            const audioComponent = child.getComponent(
              Game.Component.Audio.TYPE
            );
            if (audioComponent) {
              audioComponent.getController().dispose();
            }

            // notify other that child is removed
            this.currentGameObject3D.traverse((otherGameObject) => {
              if (!otherGameObject.isGameObject3D) return;
              const externalComp = otherGameObject.getComponent(
                Game.Component.ExternalScript.TYPE
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
          if (!child.isGameObject3D) return; // => this one should be useless since Game.State should be only compose of GameObject3D

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
      }
    } else {
      // first state
      this.currentGameObject3D = state.getObject3D();
      // add object3D to the context
      this.object3D.add(this.currentGameObject3D);

      this.currentGameObject3D.traverse((child) => {
        if (!child.isGameObject3D) return; // => this one should be useless since Game.State should be only compose of GameObject3D

        newGO.push(child);
      });
    }

    // Init Game.Object3D component controllers of the new Game.Object3D
    newGO.forEach((go) => {
      this.initComponentControllers(go);
      // update matrix world so even object.static have a correct since the autoupdate is disable
      go.updateMatrixWorld(true);
    });

    newGO.forEach((g) => {
      this.currentUUID[g.uuid] = true;

      const scriptComponent = g.getComponent(
        Game.Component.ExternalScript.TYPE
      );
      if (scriptComponent) {
        scriptComponent.getController().execute(Context.EVENT.INIT);
      }

      // Notify other go that a new go has been added
      this.currentGameObject3D.traverse((child) => {
        if (!child.isGameObject3D) return;

        const otherScriptComponent = child.getComponent(
          Game.Component.ExternalScript.TYPE
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
      THREEUtil.bindLightTransform(
        this.configScene.sky.sun_position.offset,
        this.configScene.sky.sun_position.phi,
        this.configScene.sky.sun_position.theta,
        this.object3D,
        this.directionalLight
      );
    }

    // TODO updateGameObject ??? refacto editor
    if (updateGameObject) {
      this.currentGameObject3D.traverse((child) => {
        if (!child.isGameObject3D) return;

        // Tick local script
        const scriptComponent = child.getComponent(
          Game.Component.ExternalScript.TYPE
        );
        if (scriptComponent) {
          scriptComponent.getController().execute(Context.EVENT.TICK);
        }

        // Tick audio component
        const audioComp = child.getComponent(Game.Component.Audio.TYPE);
        // Position in world referential
        if (audioComp) {
          const camera = this.frame3D.getCamera();
          const cameraMatWorldInverse = camera.matrixWorldInverse;
          audioComp.getController().tick(cameraMatWorldInverse);
        }

        // Render component
        const renderComp = child.getComponent(Game.Component.Render.TYPE);
        if (renderComp) renderComp.getController().tick(dt);
      });
    }
  }

  /**
   *
   * @param {Game.Object3D} go - gameobject3D to init controllers
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
        case Game.Component.Audio.TYPE:
          component.initController(
            new AudioController(component.getModel(), go, this.assetManager)
          );
          break;
        case Game.Component.Render.TYPE:
          component.initController(
            new RenderController(component.getModel(), go, this.assetManager)
          );
          break;
        case Game.Component.ExternalScript.TYPE:
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
            new Game.Component.ScriptController(
              component.getModel(),
              go,
              scripts
            )
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
   * @param {Game.Object3D} object3D - object3D that is going to use this instance
   * @param {object} modelVariables - custom variables associated to this instance
   * @returns {ExternalScriptBase} - instance of the class bind with object3D and modelVariables
   */
  createInstanceOf(id, object3D, modelVariables) {
    const constructor = this.externalGameScriptClass[id];
    if (!constructor) {
      console.log('script loaded');
      for (const id in this.externalGameScriptClass) {
        console.log(this.externalGameScriptClass[id]);
      }
      throw new Error('no script with id ' + id);
    }
    return new constructor(this, object3D, modelVariables);
  }

  /**
   *
   * @param {string} id - id of script
   * @returns {ExternalScriptBase|null} - first external script with id or null if none are found
   * @todo need refacto
   */
  findBrowserScriptWithID(id) {
    let result = null;
    this.object3D.traverse(function (child) {
      if (!child.isGameObject3D) return;
      const scripts = child.fetchBrowserScripts();
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
   * @returns {Game.Object3D|null} - first game object3D with external script id or null if none are found
   * @todo need refacto
   */
  findGOWithBrowserScriptID(id) {
    let result = null;
    this.object3D.traverse(function (child) {
      if (!child.isGameObject3D) return;

      const scripts = child.fetchBrowserScripts();
      if (scripts && scripts[id]) {
        result = child;
        return true;
      }
      return false;
    });

    return result;
  }

  /**
   * @todo need refacto
   */
  forceUpdate() {
    console.error('DEPRECATED');
    // let states = [];
    // if (!state) {
    //   const computer = this.interpolator.getLocalComputer();
    //   if (computer) {
    //     states = [computer.computeCurrentState()];
    //   } else {
    //     throw new Error('no local computer');
    //   }
    // } else states = [state];

    // const old = this.updateGameObject;
    // this.updateGameObject = true;
    // this.update(states);
    // this.updateGameObject = old;
  }

  /**
   * This method need to be implemented by user
   *
   * @param {Command[]} cmds - commands to send to game context
   */
  sendCommandToGameContext(cmds) {
    console.log(cmds, ' cant be sent');
    console.error('this method has to be implement in your app template');
  }
}

/**
 * Event triggered by context to {@link ExternalScriptBase}
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

export class ExternalScriptBase {
  /**
   * Skeleton of a game context script, different {@link Context.EVENT} are trigger by {@link Context}
   *
   * @param {Context} context - context of this script
   * @param {Game.Object3D} object3D - object3D bind (attach) to this script
   * @param {object} variables - custom variables bind (attach) to this script
   */
  constructor(context, object3D, variables) {
    /** @type {Context} - context of this script */
    this.context = context;
    /** @type {Game.Object3D} - object3D attach to this script */
    this.object3D = object3D;
    /** @type {object} - custom variables attach to this script */
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
   * @param {Game.Object3D} newGameObject - new gameobject3D
   */
  // eslint-disable-next-line no-unused-vars
  onNewGameObject(newGameObject) {}
  /**
   * call when a gameobject3D have been removed from context
   *
   * @param {Game.Object3D} gameobject3DRemoved - gameobject3D removed
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
}
