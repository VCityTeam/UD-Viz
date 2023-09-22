# Game

This document gives an overview of how the game part works. Here are some different implementations of the game part:

## Prerequisites

- Run a back-end in node.js with express. See [MDN DOC](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction).
- See [here](./how_to_import.md) how to import `@ud-viz/game_browser` framework.

## Creating a singleplayer simple game 

The goal of this section is to learn how to set a singleplayer simple game structure:

**Create a scene**

Initialize a `Planar` part of `@ud-viz/frame3d` which creates a [itowns PlanarView](http://www.itowns-project.org/itowns/docs/#api/View/PlanarView).

```js
// Define geographic extent: CRS, min/max X, min/max Y
const extent = new udvizBrowser.itowns.Extent(
  'EPSG:4326',
  1837816.94334,
  1847692.32501,
  5170036.4587,
  5178412.82698
);

const frame3DPlanar = new frame3d.Planar(extent, {
  hasItownsControls: true,
});

```

**Create a `SinglePlanarProcess`**

Initialize a `SinglePlanarProcess` with a `AssetManager` and a `InputManager` part of `@ud-viz/game_browser`, an `Object3D` part of `@ud-viz/game_shared` defines your game model and `SinglePlanarProcess` is stepping your game over time.

```js
const gameObject3D = new Object3D({
  static: true,
});

const game = new SinglePlanarProcess(
  gameObject3D,
  frame3DPlanar,
  new AssetManager(),
  new InputManager()
);

game.start();
```

**Add two types of script to your `Object3D`**

A game is composed of two contexts `Context` (handle collisions, add/remove gameobject3D, process commands, trigger `ScriptBase` event, ...) part of `@ud-viz/game_shared` and `Context` (handle rendering, inputs of user, audio, trigger `ScriptBase` event, ...) part of `@ud-viz/game_browser`

>The game part is divided into two context to handle a multiplayer game. Typically the game external context is running on the client side and the game context is running on the server side. In this example both context are running on the client side (ie your web browser) 

```js
const GameContextScript = class extends ScriptBase {
  init() {
    console.log('hello from game context');
  }
  static get ID_SCRIPT() {
    return 'game_context_script';
  }
};

const GameExternalContextScript = class extends ScriptBase {
  init() {
    console.log('hello from game external context ');
  }
  static get ID_SCRIPT() {
    return 'game_external_context_script';
  }
};

const gameObject3D = new Object3D({
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

const game = new SinglePlanarProcess(
  gameObject3D,
  frame3DPlanar,
  new AssetManager(),
  new InputManager(),
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
  const newGOCube = new Object3D({
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
    return new Command({
      type: 'toggle_pause',
    });
  }
);
```

> `Command` is part of `@ud-viz/game_shared`

This sends a command on the mouse click to  GameContextScript. Then in the `init` of `GameContextScript` add these lines:

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

* [game zeppelin](../../examples/game_zeppelin.html)
* [game avatar](../../examples/game_avatar.html)
* [game drag and drop avatar](../../examples/game_drag_and_drop_avatar.html)
* [game avatar shared](../../examples/game_avatar_shader.html)

This example requires knowledge about [`@ud-viz`/game_shared](../../packages/game_shared/Readme.md) and [`@ud-viz`/game_browser](../../packages/game_browser/Readme.md)

Multiplayer one:

* [game note](../../examples/game_note.html)

This example requires the same knowledge as singleplayer plus [`@ud-viz`/game_node](../../packages/game_node/Readme.md)
