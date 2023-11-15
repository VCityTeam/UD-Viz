import { Context, Object3D } from '@ud-viz/game_shared';
import { Context as ExternalContext } from '@ud-viz/game_browser';
import { Planar } from '@ud-viz/frame3d';

export class Editor {
  constructor(gameScripts, externalScripts) {
    this.gameScripts = gameScripts;
    this.externalScripts = externalScripts;
  }

  /**
   *
   * @param {import("itowns").Extent} extent - extent
   * @param {object} gameObject3DJSON - a game object as json
   */
  async load(extent, gameObject3DJSON) {
    console.log('editor open ', gameObject3DJSON);

    const gameContext = new Context(
      this.gameScripts,
      new Object3D(gameObject3DJSON)
    );

    await gameContext.load();

    const externalContext = new ExternalContext(
      new Planar(extent, {
        domElementClass: 'full_screen',
        hasItownsControls: false,
      })
    );
  }
}
