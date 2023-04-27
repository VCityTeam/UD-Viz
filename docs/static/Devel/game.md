# Game

This document give an overview of how the game part works. Here are some differents implementations of the game part:

## Creating a simple game

The goal of this section is to learn how to set a simple game structure (you can see the final result [here](../../../examples/SimpleGame.html) to check where every code sample should be added):

You can see [here](./todo) how to import @ud-viz/browser framework

**Create a scene**

Initialize a `Frame3DPlanar` which create a [itowns PlanarView](http://www.itowns-project.org/itowns/docs/#api/View/PlanarView).

```js
// Define geographic extent: CRS, min/max X, min/max Y
const extent = new udvizBrowser.itowns.Extent(
  'EPSG:4326',
  1837816.94334,
  1847692.32501,
  5170036.4587,
  5178412.82698
);

const frame3DPlanar = new udvizBrowser.Frame3DPlanar(extent, {
  hasItownsControls: true,
});

```

**Create a `udvizBrowser.Game.External.SinglePlanarProcess`**

Initialize a `SinglePlanarProcess`, gameObject3D define your game model and `SinglePlanarProcess` is stepping your game over time.

```js
const gameObject3D = new udvizBrowser.Shared.Game.Object3D({
  static: true,
});

const game = new udvizBrowser.Game.External.SinglePlanarProcess(
  gameObject3D,
  frame3DPlanar,
  new udvizBrowser.AssetManager(),
  new udvizBrowser.InputManager()
);

game.start();
```

**Add two type of script to your `udvizBrowser.Shared.Game.Object3D`**

A game is composed of two context `udvizBrowser.Shared.Game.Context` (handle collisions, add/remove gameobject3D, process commands, trigger `udvizBrowser.Shared.Game.ScriptBase` event, ...) and `udvizBrowser.Game.External.Context` (handle rendering, inputs of user, audio, trigger `udvizBrowser.Game.External.ScriptBase` event, ...)

>The game part is divided into two context to handle a multiplayer game. Typically the game external context is running on the client side and the game context is running on the server side. In this example both context are running on the client side (ie your web browser) 

```js
const GameContextScript = class extends udvizBrowser.Shared.Game
.ScriptBase {
  init() {
    console.log('hello from game context');
  }
  static get ID_SCRIPT() {
    return 'game_context_script';
  }
};

const GameExternalContextScript = class extends udvizBrowser.Game.External
.ScriptBase {
  init() {
    console.log('hello from game external context ');
  }
  static get ID_SCRIPT() {
    return 'game_external_context_script_id';
  }
};

const gameObject3D = new udvizBrowser.Shared.Game.Object3D({
  static: true,
  components: {
    GameScript: {
      idScripts: [GameContextScript.ID_SCRIPT],
    },
    ExternalScript: {
      idScripts: [GameExternalContextScript.ID_SCRIPT],
    },
  },
});

const game = new udvizBrowser.Game.External.SinglePlanarProcess(
  gameObject3D,
  frame3DPlanar,
  new udvizBrowser.AssetManager(),
  new udvizBrowser.InputManager(),
  {
    gameScriptClass: [GameContextScript],
    externalGameScriptClass: [GameExternalContextScript],
  }
);
```

**Spawn cubes**

In the `init` of `GameContextScript` add these lines

```js
this.goCubes = [];
const extentCenter = extent.center();
setInterval(() => {
  const newGOCube = new udvizBrowser.Shared.Game.Object3D({
    components: {
      Render: {
        idRenderData: 'cube',
        color: [Math.random(), Math.random(), Math.random(), 1],
      },
    },
  });

  newGOCube.position.set(extentCenter.x, extentCenter.y, 100);
  const size = Math.random() * 200 + 50;
  newGOCube.scale.set(size, size, size);
  this.goCubes.push(newGOCube);
  this.context.addObject3D(newGOCube);
}, 3000);
```

**Move cubes and remove them**

Add a `tick` method to your `GameContextScript`

```js
tick() {
  for (let index = this.goCubes.length - 1; index >= 0; index--) {
    const cube = this.goCubes[index];
    cube.position.z += 0.1 * this.context.dt;
    cube.setOutdated(true);// notify game external context that this gameobject need update 

    // sky is the limit
    if (cube.position.z > 2000) {
      this.context.removeObject3D(cube.uuid);
      this.goCubes.splice(index, 1);
    }
  }
}
```

**Send command**

Add in the `init` of `GameExternalContextScript` the following code

```js
this.context.inputManager.addMouseCommand(
  'command_id',
  'click',
  () => {
    return new udvizBrowser.Shared.Command({
      type: 'toggle_pause',
    });
  }
);
```

This send a command on the mouse click to `udvizBrowser.Shared.Game.Context`. Then in the `init` of `GameContextScript` add these lines:

```js
this.pause = false;
setInterval(() => {
  if (this.pause) return;
  ...
```

And in the `tick` of `GameContextScript`

```js
tick() {
  this.context.commands.forEach((command) => {
    if (command.type === 'toggle_pause') this.pause = !this.pause;
  });

  if (this.pause) return;
  ...
```

Now you have learned how to build a simple game. To go further you can find other game examples in the next section.
 

## Examples

Singleplayer one: 

* [ZeppelinGame](../../../examples/ZeppelinGame.html)
* [AvatarGame](../../../examples/AvatarGame.html)
* [DragAndDropAvatar](../../../examples/DragAndDropAvatar.html)
* [AvatarGameShader](../../../examples/AvatarGameShader.html)

These examples require some knowledge of [@ud-viz/shared game](./ud_viz_shared/shared_game.md) and [@ud-viz/browser game](./ud_viz_browser/browser_game.md)

Multiplayer one:

* [MultiPlanarProcess](../../../examples/MultiPlanarProcess.html)

This example require same knowledge as singleplayer plus [@ud-viz/node game](./ud_viz_node/node_game.md)