import { Controller } from '@ud-viz/core/src/Game/GameObject/Components/Component';

const BrowserScriptControllerModule = class BrowserScriptController extends Controller {
  constructor(assetsManager, model) {
    super(assetsManager, model);

    // Map of scripts
    this.scripts = {};
  }

  /**
   * Initialize scripts
   *
   * @param {AssetsManager} assetsManager local assetsManager
   * @param {Library} bundles set of bundle library used by script
   */
  initAssets(assetsManager, bundles) {
    console.error('DEPRECATED');
    const _this = this;
    this.idScripts.forEach(function (id) {
      const constructor = assetsManager.fetchBrowserScript(id);
      _this.scripts[id] = new constructor(_this.conf, bundles.udviz);
    });
  }

  /**
   * Execute all scripts for a particular event
   *
   * @param {BrowserScript.EVENT} event the event trigger
   * @param {Array} params parameters pass to scripts
   */
  execute(event, params) {
    console.error('DEPRECATED');
    const _this = this;
    let result = false;

    this.idScripts.forEach(function (idScript) {
      result = result || _this.executeScript(idScript, event, params);
    });

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
  executeScript(id, event, params) {
    console.error('DEPRECATED');
    const s = this.scripts[id];

    if (s[event]) {
      return s[event].apply(s, [this.parent].concat(params));
    }
    return false;
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
