/** @format */

import './Editor.css';
import { GOEditorView } from './GOEditor/GOEditorView';
import { WorldEditorView } from './WorldEditor/WorldEditorView';
import World from '../../Shared/World';
import { AssetsManager } from '../AssetsManager';

export class Editor {
  constructor(config) {
    this.config = config;

    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('root_Editor');

    //assets
    this.assetsManager = new AssetsManager();

    //views
    this.goView = new GOEditorView(config, this.assetsManager);
    this.worldView = new WorldEditorView(config, this.assetsManager);

    //id current world
    this.currentWorld = null;

    //internal
    this.pathDirectory = '';

    //html
    this.switchView = null;
    this.input = null;
    this.worldsList = null;
    this.saveGOButton = null;
    this.saveButton = null;
  }

  initUI() {
    //open a world
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    this.rootHtml.appendChild(input);
    this.input = input; //ref

    const worldsList = document.createElement('ul');
    this.rootHtml.appendChild(worldsList);
    this.worldsList = worldsList;

    //flex parent
    const parentFlex = document.createElement('div');
    parentFlex.style.display = 'flex';
    this.rootHtml.appendChild(parentFlex);

    //switch view
    const switchView = document.createElement('div');
    switchView.classList.add('button_Editor');
    switchView.innerHTML = 'Switch View';
    parentFlex.appendChild(switchView);
    this.switchView = switchView;

    const saveButton = document.createElement('div');
    saveButton.classList.add('button_Editor');
    saveButton.innerHTML = 'Save Worlds';
    parentFlex.appendChild(saveButton);
    this.saveButton = saveButton;

    const saveGOButton = document.createElement('div');
    saveGOButton.classList.add('button_Editor');
    saveGOButton.innerHTML = 'Save Gameobject';
    parentFlex.appendChild(saveGOButton);
    this.saveGOButton = saveGOButton;
  }

  initCallbacks() {
    const _this = this;

    //input
    this.input.addEventListener(
      'change',
      this.readSingleFile.bind(this),
      false
    );

    //callbacks
    let wView = true;
    this.rootHtml.appendChild(this.worldView.html());
    this.switchView.onclick = function () {
      wView = !wView;
      if (wView) {
        _this.goView.setPause(true);
        _this.rootHtml.removeChild(_this.goView.html());

        _this.worldView.setPause(false);
        _this.rootHtml.appendChild(_this.worldView.html());
      } else {
        _this.worldView.setPause(true);
        _this.rootHtml.removeChild(_this.worldView.html());

        _this.goView.setPause(false);
        _this.rootHtml.appendChild(_this.goView.html());
      }
      window.dispatchEvent(new Event('resize'));
    };

    //save
    //TODO put this function in udv demo helper
    const downloadObjectAsJson = function (exportObj, exportName) {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(exportObj));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', exportName + '.json');
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    };
    this.saveGOButton.onclick = function () {
      const model = _this.goView.getModel();
      if (model && model.getGameObject()) {
        const go = model.getGameObject();
        const goJSON = go.toJSON(true);
        _this.worldsJSON.forEach(function (w) {
          if (w.uuid == _this.currentWorld.getUUID()) {
            w.gameObject = goJSON;
            _this.onWorldJSON(w);
          }
        });
      }
    };

    this.saveButton.onclick = function () {
      if (!_this.currentWorld) return;
      _this.currentWorld.getGameObject().traverse(function (g) {
        const s = g.getScripts();
        //TODO ce code connait Map.js le mettre ailleurs
        if (s && s['map']) {
          const path = s['map'].data.heightmap_path;
          const index = path.indexOf('/assets');
          s['map'].data.heightmap_path =
            _this.pathDirectory + path.slice(index);
        }
      });
      _this.worldsJSON.forEach(function (w) {
        if (w.uuid == _this.currentWorld.getUUID()) {
          w.gameObject = _this.currentWorld.getGameObject();
        }
      });
      downloadObjectAsJson(_this.worldsJSON, 'worlds');
    };
  }

  readSingleFile(e) {
    try {
      var file = e.target.files[0];
      if (!file) {
        return;
      }
      const _this = this;
      var reader = new FileReader();
      reader.onload = function (e) {
        const json = JSON.parse(e.target.result);
        console.log('Worlds = ', json);
        _this.onWorlds(json);
      };

      reader.readAsText(file);
    } catch (e) {
      throw new Error(e);
    }
  }

  onWorlds(json) {
    if (!json) throw new Error('wrong json');
    this.worldsJSON = json;
    this.updateUI();
  }

  updateUI() {
    //clean worlds list and rebuild it
    const list = this.worldsList;
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
    const _this = this;
    this.worldsJSON.forEach(function (w) {
      const li = document.createElement('li');
      li.innerHTML = w.name;
      li.onclick = _this.onWorldJSON.bind(_this, w);
      list.appendChild(li);
    });
  }

  onWorldJSON(json) {
    const world = new World(json, { isServerSide: false });
    const _this = this;
    world.gameObject.traverse(function (g) {
      const s = g.getScripts();
      //TODO ce code connait Map.js le mettre ailleurs
      if (s && s['map']) {
        const path = s['map'].data.heightmap_path;
        const index = path.indexOf('/assets');
        _this.pathDirectory = path.slice(0, index);
        s['map'].data.heightmap_path = '..' + path.slice(index);
      }
    });
    this.currentWorld = world;

    this.worldView.onWorld(world);
    this.goView.onGameObject(world.getGameObject().clone());
  }

  load() {
    const _this = this;
    return new Promise((resolve, reject) => {
      _this.assetsManager
        .loadFromConfig(_this.config.assetsManager)
        .then(_this.goView.load.bind(_this.goView))
        .then(_this.worldView.load.bind(_this.worldView))
        .then(function () {
          _this.initUI();
          _this.initCallbacks();

          resolve();
        });
    });
  }

  html() {
    return this.rootHtml;
  }
}
