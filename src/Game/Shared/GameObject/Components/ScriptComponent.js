/** @format */

const Avatar = require('./Scripts/Avatar');
const Map = require('./Scripts/Map');
const THREE = require('three');

const ScriptComponentModule = class ScriptComponent {
  constructor(parent, json) {
    this.parent = parent;
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
    this.idScripts = json.idScripts;
    this.type = json.type;
    this.data = json.data;

    //dynamic
    const scripts = {};
    this.idScripts.forEach(function (id) {
      switch (id) {
        case Avatar.ID:
          scripts[Avatar.ID] = new Avatar(json.data);
          break;
        case Map.ID:
          scripts[Map.ID] = new Map(json.data);
          break;
        default:
          throw new Error('unknown script ' + id);
      }
    });
    this.scripts = scripts;
  }

  getData() {
    return this.data;
  }

  execute(event, params) {
    const _this = this;

    this.idScripts.forEach(function (idScript) {
      _this.executeScript(idScript, event, params);
    });
  }

  executeScript(id, event, params) {
    const s = this.scripts[id];
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
    return true;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      idScripts: this.idScripts,
      data: this.data,
      type: ScriptComponentModule.TYPE,
    };
  }
};

ScriptComponentModule.TYPE = 'ScriptComponent';
ScriptComponentModule.EVENT = {
  TICK: 'tick', //every tick
  LOAD: 'load', //at world load return promises
};

module.exports = ScriptComponentModule;
