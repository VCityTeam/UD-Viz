/** @format */

const THREE = require('three');

const LocalScriptModule = class LocalScript {
  constructor(parent, json) {
    this.parent = parent;
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
    this.idScripts = json.idScripts || [];
    this.type = json.type || LocalScriptModule.TYPE;
    this.conf = json.conf || {};

    //internal
    this.scripts = {};
  }

  getConf() {
    return this.conf;
  }

  initAssets(assetsManager, udvShared) {
    const _this = this;
    this.idScripts.forEach(function (id) {
      const constructor = assetsManager.fetchLocalScript(id);
      _this.scripts[id] = new constructor(_this.conf, udvShared);
    });
  }

  execute(event, params) {
    const _this = this;

    this.idScripts.forEach(function (idScript) {
      _this.executeScript(idScript, event, params);
    });
  }

  executeScript(id, event, params) {
    let s = this.scripts[id];

    if (s[event]) {
      return s[event].apply(s, [this.parent].concat(params));
    } else {
      return null;
    }
  }

  getScripts() {
    return this.scripts;
  }

  isServerSide() {
    return false;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      idScripts: this.idScripts,
      conf: this.conf,
      type: LocalScriptModule.TYPE,
    };
  }
};

LocalScriptModule.TYPE = 'LocalScript';
LocalScriptModule.EVENT = {
  INIT: 'init', //Before first tick
  TICK: 'tick', //every tick
  ON_NEW_GAMEOBJECT: 'onNewGameObject', //when a go is added
  UPDATE: 'update', //when component need to be updated with newer localScript component
};

module.exports = LocalScriptModule;
