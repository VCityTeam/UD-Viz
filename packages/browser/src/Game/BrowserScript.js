import { Controller } from '@ud-viz/core/src/Game/GameObject/Components/Component';

const BrowserScriptControllerModule = class BrowserScriptController extends Controller {
  constructor(assetsManager, model, parentGO, browserContext) {
    super(assetsManager, model, parentGO);

    this.scripts = {};
    model.getIdScripts().forEach((idScript) => {
      const constructor = assetsManager.fetchBrowserScript(idScript);
      this.scripts[idScript] = new constructor(
        model.getConf(),
        browserContext,
        parentGO
      ); // TODO create a parent class assetsmanager
    });
  }

  setConf(conf) {
    this.model.setConf(conf);
    for (const id in this.scripts) {
      this.scripts[id].setConf(conf);
    }
  }

  /**
   * Execute all scripts for a particular event
   *
   * @param {BrowserScript.EVENT} event the event trigger
   * @param {Array} params parameters pass to scripts
   */
  execute(event, params) {
    let result = false;

    for (const id in this.scripts) {
      result = result || this.executeScript(this.scripts[id], event, params);
    }

    return result;
  }

  /**
   * Execute script with id for a particular event
   *
   * @param {string} id id of the script executed
   * @paBrowserBaseModule
BrowserBaseModuleram {BrowserScript.EVENT} event event trigger
   * @param event
   * @param {Array} params parameters pass to the script function
   * @returns {object} result of the script execution
   */
  executeScript(script, event, params) {
    return script[event].apply(script, params);
  }

  /**
   *
   * @returns {object}
   */
  getScripts() {
    return this.scripts;
  }
};

BrowserScriptControllerModule.EVENT = {
  INIT: 'init', // Before first tick
  TICK: 'tick', // Every tick
  ON_NEW_GAMEOBJECT: 'onNewGameObject', // When a go is added
  ON_OUTDATED: 'onOutdated', // Call when outdated is raised
  DISPOSE: 'dispose', // Gameview is disposed
  ON_REMOVE: 'onRemove', // Object is remove from parent
  ON_COMPONENT_UPDATE: 'onComponentUpdate', // Component updated smthg
  ON_RESIZE: 'onResize', // On resize window
};

/**
 *
 * @param {*} conf
 * @param {*} context
 */
const BrowserScriptBase = class BrowserBase {
  constructor(conf, context, parentGO) {
    this.conf = conf;
    this.parentGameObject = parentGO;
    this.context = context;
  }

  setConf(conf) {
    this.conf = conf;
  }
};

// Fill the class with the different BrowserControllerModule.EVENT method
for (const event in BrowserScriptControllerModule.EVENT) {
  const eventValue = BrowserScriptControllerModule.EVENT[event];
  BrowserScriptBase.prototype[eventValue] = () => {
    // empty method override it for custm behavior
  };
}

export {
  BrowserScriptControllerModule as Controller,
  BrowserScriptBase as Base,
};
