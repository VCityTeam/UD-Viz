# Game

This document gives an overview of how the game part works. Here are some different implementations of the game part:

## Prerequisites

- Run a back-end in node.js with express. See [MDN DOC](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction).
- See [here](../../packages/browser/Readme.md#how-to-use-it-in-your-demo) how to import @ud-viz/browser framework.

## Creating a singleplayer simple game 

The goal of this section is to learn how to set a singleplayer simple game structure:

You can see the final result of this tutorial ?todo to check where every code sample should be added (this example import @ud-viz/browser with bundle). <== WIP


**Create a scene**

Initialize a `Frame3DPlanar` which creates a [itowns PlanarView](http://www.itowns-project.org/itowns/docs/#api/View/PlanarView).

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

Initialize a `SinglePlanarProcess`, gameObject3D defines your game model and `SinglePlanarProcess` is stepping your game over time.

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

**Add two types of script to your `udvizBrowser.Shared.Game.Object3D`**

A game is composed of two contexts `udvizBrowser.Shared.Game.Context` (handle collisions, add/remove gameobject3D, process commands, trigger `udvizBrowser.Shared.Game.ScriptBase` event, ...) and `udvizBrowser.Game.External.Context` (handle rendering, inputs of user, audio, trigger `udvizBrowser.Game.External.ScriptBase` event, ...)

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
    return 'game_external_context_script';
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
    gameOrigin: { x: extent.center().x, y: extent.center().y, z: 100}
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

This sends a command on the mouse click to `udvizBrowser.Shared.Game.Context`. Then in the `init` of `GameContextScript` add these lines:

```js
this.pause = false;
setInterval(() => {
  if (this.pause) return;
  ...
```

In the `tick` of `GameContextScript`

```js
tick() {
  if (this.pause) return;
  ...
```

And finally add `onCommand` method:

```js
onCommand(type) {
  if (type === 'toggle_pause') this.pause = !this.pause;
}
```

Now you have learned how to build a singleplayer simple game, let's see how to modify it to make a multiplayer one. 


## Create a multiplayer simple game (WIP)

1 Create a backend
import udviz node with require
as before run an express app running a http server
Final result backend WIP

import game part of shared
create a socket service by passsing the http server
load gameobject3D where gameobject3D is the same one as the previous example
the both script are unknown 
hard coded value of ids *to keep it simple*
create another file gamethreadchild
ok now you have to give the entry point to your thread
the game script is the one running backend side copy paste it to your gamethread
you have to give him the game script because he is going to run there
replace udvizBrowser.Shared.Game by Game
ouais backend okay

front end
create a new html file base on previous one
delete game script
delete gameobject 3D
Replace singleprocess by multiprocess
create a socket io wrapper + connect it
run enjoy

## Examples

Singleplayer one: 

* [ZeppelinGame](../../examples/ZeppelinGame.html)
* [AvatarGame](../../examples/AvatarGame.html)
* [DragAndDropAvatar](../../examples/DragAndDropAvatar.html)
* [AvatarGameShader](../../examples/AvatarGameShader.html)

These examples require some knowledge of [@ud-viz/shared game](./ud_viz_shared/shared_game.md) and [@ud-viz/browser game](./ud_viz_browser/browser_game.md)

Multiplayer one:

* [MultiPlanarProcess](../../examples/MultiPlanarProcess.html)

This example requires the same knowledge as singleplayer plus [@ud-viz/node game](./ud_viz_node/node_game.md)
