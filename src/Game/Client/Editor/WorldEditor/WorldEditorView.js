/** @format */

import './WorldEditor.css';
import RenderComponent from '../../../Shared/GameObject/Components/RenderComponent';
import { GameView } from '../../GameView/GameView';

const THREE = require('three');

export class WorldEditorView {
  constructor(config, assetsManager) {
    this.config = config;

    //where ui is append
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('root_WorldEditorView');

    //where html
    this.ui = document.createElement('div');
    this.ui.classList.add('ui_WorldEditorView');
    this.rootHtml.appendChild(this.ui);

    this.pause = false;

    //game
    this.gameView = null;

    //assets
    this.assetsManager = assetsManager;

    //json
    this.worldsJSON = null;

    //html
    this.input = null;
    this.worldsList = null;
    this.canvasCollision = null;
    this.stopButton = null;
    this.imgHeightmap = null;
  }

  setPause(value) {
    this.pause = value;
  }

  html() {
    return this.rootHtml;
  }

  renderCanvasCollision() {
    requestAnimationFrame(this.renderCanvasCollision.bind(this));

    if (!this.gameView || this.pause) return;
    const world = this.gameView.getWorld();
    if (!world) return;
    const go = world.getGameObject();
    if (!go.getObject3D()) return;
    const bb = go.getComponent(RenderComponent.TYPE).computeBoundingBox();

    const w = bb.max.x - bb.min.x;
    const h = bb.max.y - bb.min.y;

    this.canvasCollision.width = w;
    this.canvasCollision.height = h;

    const ctx = this.canvasCollision.getContext('2d');
    ctx.clearRect(
      0,
      0,
      this.canvasCollision.width,
      this.canvasCollision.height
    );
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    world.getCollisions().draw(ctx);
    ctx.stroke();
  }

  initCallbacks() {
    const _this = this;
    this.stopButton.onclick = this.stopGame.bind(this);
  }

  stopGame() {
    if (this.gameView) {
      this.gameView.dispose();
      this.gameView = null;
    }
  }

  initUI() {
    //preview
    const canvasCollision = document.createElement('canvas');
    canvasCollision.classList.add('canvas_preview');
    this.ui.appendChild(canvasCollision);
    this.canvasCollision = canvasCollision;

    const stopButton = document.createElement('div');
    stopButton.innerHTML = 'Stop Game';
    stopButton.classList.add('button_Editor');
    this.ui.appendChild(stopButton);
    this.stopButton = stopButton;

    const imgDiv = document.createElement('img');
    this.ui.appendChild(imgDiv);
    this.imgHeightmap = imgDiv;
  }

  load() {
    const _this = this;
    return new Promise((resolve, reject) => {
      _this.initUI();

      _this.initCallbacks();

      _this.renderCanvasCollision();

      resolve();
    });
  }

  onWorld(newWorld) {
    this.stopGame();

    const _this = this;
    newWorld.getGameObject().traverse(function (g) {
      const s = g.getScripts();
      //TODO ce code connait Map.js le mettre ailleurs ou non ?
      if (s && s['map']) {
        const path = s['map'].data.heightmap_path;
        _this.imgHeightmap.src = path;
      }
    });

    this.gameView = new GameView({
      assetsManager: this.assetsManager,
      isLocal: true,
      config: this.config,
    });
    this.gameView.setWorld(newWorld);

    this.gameView.load().then(function () {
      const htmlView = _this.gameView.html();
      htmlView.style.display = 'inline-block';
      htmlView.style.position = 'absolute';
      _this.rootHtml.appendChild(htmlView);
    });
  }
}
