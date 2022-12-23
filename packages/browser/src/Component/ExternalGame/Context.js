import * as proj4 from 'proj4';
const THREE = require('three');
import * as THREEUtil from '../THREEUtil';
import { AssetManager, Frame3D, InputManager } from '../Component';
import { Game } from '@ud-viz/core';

/**
 * Context pass to the GameObject BrowserScript to work (TODO this class is relevant ? all attributes could be in gameview class)
 */
export class Context {
  /**
   *
   * @param {Frame3D} frame3D - could be a Frame3DBase or a Frame3DPlanar
   * @param {AssetManager} assetsManager
   * @param {InputManager} inputManager
   */
  constructor(frame3D, assetsManager, inputManager) {
    /** @type {number} */
    this.dt = 0;

    /** @type {Frame3D} */
    this.frame3D = frame3D;

    /** @type {AssetManager} */
    this.assetsManager = assetsManager;

    /** @type {InputManager} */
    this.inputManager = inputManager;

    /** @type {THREE.Object3D} */
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'External_Game_Context_Object3D';

    /** @type {object} */
    this.currentUUID = {};

    /** @type {Game.State} */
    this.lastState = null;
  }

  init(gameView) {
    this.gameView = gameView;

    //Register requesters in gameview
    this.gameView.addResizeRequester(() => {
      // Notify localscript
      if (this.lastState) {
        this.lastState.getObject3D().traverse(function (g) {
          const scriptComponent = g.getComponent(
            GameObject.BrowserScript.Model.TYPE
          );
          if (scriptComponent) {
            scriptComponent
              .getController()
              .execute(BrowserScript.Controller.EVENT.ON_RESIZE);
          }
        });
      }
    });

    this.gameView.addOnDisposeRequester(() => {
      // Notify localscript dispose
      if (this.lastState) {
        this.lastState.getObject3D().traverse(function (g) {
          const scriptComponent = g.getComponent(
            GameObject.BrowserScript.Model.TYPE
          );
          if (scriptComponent) {
            scriptComponent
              .getController()
              .execute(BrowserScript.Controller.EVENT.DISPOSE);
          }
          const audioComponent = g.getComponent(GameObject.Audio.Model.TYPE);
          if (audioComponent) audioComponent.getController().dispose();
        });
      }
    });

    const firstState = this.interpolator.computeCurrentState();
    if (!firstState) throw 'Interpolator has no state';

    // Place its object3D in world
    let x = 0;
    let y = 0;
    let z = 0;
    const o = firstState.getOrigin();
    if (o) {
      [x, y] = proj4.default(this.gameView.projection).forward([o.lng, o.lat]);
      z = o.alt;
    }
    this.object3D.position.x = x;
    this.object3D.position.y = y;
    this.object3D.position.z = z;

    return firstState;
  }

  getAssetsManager() {
    return this.assetsManager;
  }

  /**
   *
   * @param {number} dt - delta time
   * @param {Game.State[]} states - new states to update to
   * @param {boolean} updateGameObject
   */
  step(dt, states, updateGameObject = true) {
    this.dt = dt; // ref it for external scripts

    const newGO = [];
    const state = states[states.length - 1]; // The more current of states

    // Update lastState with the new one
    if (this.lastState) {
      const lastGO = this.lastState.getObject3D();

      if (updateGameObject) {
        // Update lastGO

        lastGO.traverse((g) => {
          const uuid = g.getUUID();
          const current = state.getObject3D().find(uuid);
          if (current) {
            // Local update
            if (!current.getFreeze() && !current.hasNoLocalUpdate()) {
              // Not freeze and has local update

              // if no static update transform
              if (!current.isStatic()) {
                // Update transform of the local go
                g.setTransformFromGO(current);
              }

              // Stack the same go of all states not consumed yet
              const bufferedGO = [];
              states.forEach((s) => {
                const bGO = s.getObject3D().find(uuid);
                if (bGO) bufferedGO.push(bGO);
              });

              // Update local component for bufferedGO
              let componentHasBeenUpdated = false; // Flag to know if a change of state occured

              const gRenderComp = g.getComponent(GameObject.Render.Model.TYPE);
              const gBrowserScriptComp = g.getComponent(
                GameObject.BrowserScript.Model.TYPE
              );

              for (let index = 0; index < bufferedGO.length; index++) {
                const element = bufferedGO[index];

                // Render comp
                if (gRenderComp) {
                  const bufferedRenderComp = element.getComponent(
                    GameObject.Render.Model.TYPE
                  );

                  // Check if color change
                  if (
                    !gRenderComp
                      .getModel()
                      .getColor()
                      .equals(bufferedRenderComp.getModel().getColor())
                  ) {
                    console.error('DEPRECATED');
                    gRenderComp.setColor(bufferedRenderComp.getColor());
                    componentHasBeenUpdated = true; // Notify change
                  }

                  // Check if idModel change
                  if (
                    gRenderComp.getModel().getIdRenderData() !=
                    bufferedRenderComp.getModel().getIdRenderData()
                  ) {
                    gRenderComp
                      .getController()
                      .setIdRenderData(
                        bufferedRenderComp.getModel().getIdRenderData()
                      );

                    componentHasBeenUpdated = true;
                  }
                }

                if (gBrowserScriptComp && element.isOutdated()) {
                  const bufferedBrowserScriptComp = element.getComponent(
                    GameObject.BrowserScript.Model.TYPE
                  );

                  // Replace conf in browserScript
                  gBrowserScriptComp
                    .getController()
                    .setConf(bufferedBrowserScriptComp.getModel().getConf());

                  // Launch event onOutdated
                  componentHasBeenUpdated =
                    componentHasBeenUpdated ||
                    gBrowserScriptComp
                      .getController()
                      .execute(BrowserScript.Controller.EVENT.ON_OUTDATED);
                }
              }

              if (componentHasBeenUpdated && gBrowserScriptComp) {
                // Launch event onComponentUpdate
                gBrowserScriptComp
                  .getController()
                  .execute(BrowserScript.Controller.EVENT.ON_COMPONENT_UPDATE);
              }
            }
          } else {
            // Do not exist remove it
            g.removeFromParent();

            // Render removal
            g.getObject3D().parent.remove(g.getObject3D());

            // BrowserScript removal
            const scriptComponent = g.getComponent(
              GameObject.BrowserScript.Model.TYPE
            );
            if (scriptComponent) {
              scriptComponent
                .getController()
                .execute(BrowserScript.Controller.EVENT.ON_REMOVE);
            }

            // Audio removal
            const audioComponent = g.getComponent(GameObject.Audio.Model.TYPE);
            if (audioComponent) {
              audioComponent.getController().dispose();
            }

            delete this.currentUUID[g.getUUID()];
          }
        });

        state.getObject3D().traverse((g) => {
          const uuid = g.getUUID();
          const old = lastGO.find(uuid);
          if (!old) {
            // New one add it
            const parent = lastGO.find(g.getParentUUID());
            parent.addChild(g);
          }

          if (!this.currentUUID[g.getUUID()]) {
            newGO.push(g);
          }
        });
      }

      state.setGameObject(lastGO); // Set it
    } else {
      state.getObject3D().traverse((g) => {
        newGO.push(g);
      });
    }

    // Bufferize
    this.lastState = state;

    // Init assets new GO
    newGO.forEach((go) => {
      this.assetsManager.initGameObject(go, false, {
        browserContext: this,
      });
    });

    const go = state.getObject3D();

    // Localscript event INIT + ON_NEW_GAMEOBJECT
    newGO.forEach((g) => {
      // Console.log('New GO => ', g.name);
      this.currentUUID[g.getUUID()] = true;

      // Init newGO localscript
      const scriptComponent = g.getComponent(
        GameObject.BrowserScript.Model.TYPE
      );
      if (scriptComponent) {
        scriptComponent
          .getController()
          .execute(BrowserScript.Controller.EVENT.INIT);
      }

      // Notify other go that a new go has been added
      go.traverse((child) => {
        const scriptComponent = child.getComponent(
          GameObject.BrowserScript.Model.TYPE
        );
        if (scriptComponent) {
          scriptComponent
            .getController()
            .execute(BrowserScript.Controller.EVENT.ON_NEW_GAMEOBJECT, [g]);
        }
      });
    });

    // rebuild object
    this.object3D.children.length = 0;
    this.object3D.add(this.computeObject3D(go));
    // Update matrix
    this.gameView.scene.updateMatrixWorld();

    // Update shadow
    if (newGO.length) {
      //TODO maybe do getter on gameview
      THREEUtils.bindLightTransform(
        10,
        this.gameView.config.gameView.scene.sky.sun_position.phi,
        this.gameView.config.gameView.scene.sky.sun_position.theta,
        this.object3D,
        this.gameView.directionalLight
      );
    }

    // TODO updateGameObject ??? refacto editor
    if (updateGameObject) {
      go.traverse((child) => {
        // Tick local script
        const scriptComponent = child.getComponent(
          GameObject.BrowserScript.Model.TYPE
        );
        if (scriptComponent) {
          scriptComponent
            .getController()
            .execute(BrowserScript.Controller.EVENT.TICK);
        }

        // Tick audio component
        const audioComp = child.getComponent(GameObject.Audio.Model.TYPE);
        const camera = this.gameView.getCamera();
        // Position in world referential
        const cameraMatWorldInverse = camera.matrixWorldInverse;
        if (audioComp)
          audioComp
            .getController()
            .tick(cameraMatWorldInverse, this.getObject3D().position);

        // Render component
        const renderComp = child.getComponent(GameObject.Render.Model.TYPE);
        if (renderComp) renderComp.getController().tick(dt);
      });
    }
  }

  computeObject3D(go) {
    const obj = go.getObject3D();

    // Clear children object
    obj.children.length = 0;

    const renderComponent = go.getComponent(GameObject.Render.Model.TYPE);
    if (renderComponent) {
      const renderController = renderComponent.getController();
      const rObj = renderController.getObject3D();
      if (!rObj) throw new Error('no renderController object3D');
      obj.add(rObj);
    }

    // Add children if recursive
    go.getChildren().forEach((child) => {
      obj.add(this.computeObject3D(child));
    });

    return obj;
  }

  /**
   *
   * @returns {number}
   */
  getDt() {
    return this.dt;
  }

  getRootGameObject() {
    return this.lastState.getObject3D().computeRoot();
  }

  /**
   * Return the first localscript found with the id passed
   *
   * @param {*} id id of the localscript
   * @returns the first localscript found with id
   */
  findBrowserScriptWithID(id) {
    let result = null;
    this.getRootGameObject().traverse(function (child) {
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
   * Return the first go found with the id of the localscript passed
   *
   * @param {*} id id of the localscript
   * @returns the first go
   */
  findGOWithBrowserScriptID(id) {
    let result = null;
    this.getRootGameObject().traverse(function (child) {
      const scripts = child.fetchBrowserScripts();
      if (scripts && scripts[id]) {
        result = child;
        return true;
      }
      return false;
    });

    return result;
  }

  getObject3D() {
    return this.object3D;
  }
}
