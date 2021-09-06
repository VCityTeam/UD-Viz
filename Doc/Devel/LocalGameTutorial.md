<!-- @format -->
<<<<<<< HEAD
=======


<<<<<<< HEAD
>>>>>>> Tuto Update
# Local Game tutorial :lion:

<<<<<<< HEAD
Welcome in the first ud-viz game tutorial. We will proceed step by step if you want to consult the complete project, you can find it in this [folder](../../examples). At the end of this tutorial you will fly with your zeppelin in the sky of Lyon, and collect some spheres !
=======
Welcome in the first ud-viz game tutorial. We will proceed step by step, if you want to consult the complete project, you can find it in this [folder](../../examples). At the end of this tutorial you will fly with your zeppelin in the sky of Lyon, and collect some spheres!
>>>>>>> First pass.
=======
# Local Game tutorial :lion:

Welcome in the first ud-viz game tutorial. We will proceed step by step, if you want to consult the complete project, you can find it in this [folder](../../examples). At the end of this tutorial you will fly with your zeppelin in the sky of Lyon, and collect some spheres!
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

![Zeppelin](./Pictures/zeppelin.gif)

# Getting started :smile:

[Working environment](./LocalGameTutorial.md#working-environment)
[Initialize your project](./LocalGameTutorial.md#initialize-your-project)
[Importing ud-viz](./LocalGameTutorial.md#importing-ud-viz)
[Create your game](./LocalGameTutorial.md#create-your-game)
[Parameterize itowns layers](./LocalGameTutorial.md#parameterize-itowns-layers)

## Working environment

Steps :

<<<<<<< HEAD
<<<<<<< HEAD
- Create an empty folder that you can call `GameFolder`.

- Create an html script in your folder that you call `index.html`.
=======
- Create an empty folder that you can call `My_UD-Viz_Game`.
- Create a html script in your folder that you call `index.html`.
>>>>>>> First pass.
=======
- Create an empty folder that you can call `My_UD-Viz_Game`.
- Create a html script in your folder that you call `index.html`.
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

> Open the **folder** in visual studio code or your favorite IDE :computer:

## Importing ud-viz

<<<<<<< HEAD
For this tutorial you will need to import `ud-viz` in your project, it is the framework that contains the **game engine** and **urban data visualization tools**.

<<<<<<< HEAD
To begin with, here is the **basis** of an html file, **copy it** :
=======
To begin with, here is the **base** of an html script, **copy it**:
>>>>>>> First pass.
=======
To begin with, here is the **base** of an html script, **copy it**:
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```html
<!--index.html-->
<!DOCTYPE html>
<html>
  <head>
    <title>My awesome game</title>

    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body></body>
</html>
```

<<<<<<< HEAD
<<<<<<< HEAD
Then you will need to host your game folder (`My_UD-Viz_Game`), to do so you can use your own local server otherwise follows these steps:

> If you chose to host with this way npm and node must be installed. ([Doc link](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))

- Clone the `UD-SimpleServer` repo separately:
=======
Then you will need to host your `GameFolder`, to do so you can use your own local server, otherwise follow these steps:

- Clone the SimpleServer repo separately:
>>>>>>> First pass.
=======
Then you will need to host your game folder (`My_UD-Viz_Game`), to do so you can use your own local server otherwise follow these steps:

> If you chose to host with this way npm and node must be installed. ([Doc link](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
- Clone the SimpleServer repo separately:

- Clone the `UD-SimpleServer` repo separately:
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```bash
git clone https://github.com/VCityTeam/UD-SimpleServer.git
```

<<<<<<< HEAD
<<<<<<< HEAD
- Open a terminal in the cloned repository

- Installing node packages:
=======
- Open the SimpleServer repo in a terminal and install node packages:
>>>>>>> First pass.
=======
- Open the SimpleServer repo in a terminal and install node packages:
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```bash
npm install
```

<<<<<<< HEAD
<<<<<<< HEAD
- And finally host `My_UD-Viz_Game` folder with this command line:
=======
- And finally host the UD-Viz folder:
>>>>>>> First pass.
=======
- And finally host `My_UD-Viz_Game` folder with this command line:
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```bash
<<<<<<< HEAD
node index.js PATH_TO_GameFolder 8000
=======
node index.js PATH_TO_My_UD-Viz_Game 8000

# PATH_TO_My_UD-Viz_Game might be ../My_UD-Viz_Game if UD-SimpleServer is next to your game folder.
<<<<<<< HEAD
>>>>>>> Tuto Update
```

<<<<<<< HEAD
Now you can visit your http://localhost:8000/ and nothing is displayed but we are all good :satisfied:
=======
You can visit your page at http://localhost:8000/ but nothing is displayed (yet).
>>>>>>> First pass.
=======
```

You can visit your page at http://localhost:8000/ but nothing is displayed (yet).
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

For this tutorial you will need to import `ud-viz` in your project, it is the framework that contains the **game engine** and **urban data visualization tools**. 

<<<<<<< HEAD
<<<<<<< HEAD
* For this purpose, in your HTML file (`index.html`) add the following script tag in the **\<body\>**.
=======
For this tutorial you will need to import `ud-viz` in your project. It is the framework that contains the **game engine** and **urban data visualization tools**. In the body of your HTML file add the following script tag. Then copy all the ud-viz code contained in this single [file](../../examples/assets/js/udv.js) to a `./assets/js/` directory.
>>>>>>> First pass.
=======
For this tutorial you will need to import `ud-viz` in your project, it is the framework that contains the **game engine** and **urban data visualization tools**. 

* For this purpose, in your HTML file (`index.html`) add the following script tag in the **\<body\>**.
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```html
  <script src="./assets/js/udv.js"></script>
```
* Then copy this [file](../../examples/assets/js/udv.js) in a **My_UD-Viz_Game/assets/js/** directory, which contains all the ud-viz code in a single file.

<<<<<<< HEAD
<<<<<<< HEAD
Still nothing displayed but the library is now globally accessible.
> To keep this tutorial simple ud-viz is imported this way, but a [npm package](https://www.npmjs.com/package/ud-viz) exists and it's recommended to use it since you can benefit of the update with it. You can visit this [repository](https://github.com/VCityTeam/UD-Viz-Template) to see an example of a npm project using ud-viz as a package.
=======
Still nothing displayed but the bookshop is now globally accessible.

> To keep this tutorial simple, ud-viz is imported this way (manually), but a [npm package](https://www.npmjs.com/package/ud-viz) exists and it's recommended to use it since you can benefit of its regular updates.
>>>>>>> First pass.

## Create your game

<<<<<<< HEAD
 * Let's create a script tag in the `index.html` and add the following code to start a new local game (*Still in the **\<body\>***):
=======
Let's create a script tag in `index.html` and add the following code to start a new local game:
>>>>>>> First pass.
=======
Still nothing displayed but the library is now globally accessible.
> To keep this tutorial simple ud-viz is imported this way, but a [npm package](https://www.npmjs.com/package/ud-viz) exists and it's recommended to use it since you can benefit of the update with it. You can visit this [repository](https://github.com/VCityTeam/UD-Viz-Template) to see an example of a npm project using ud-viz as a package.

> To keep this tutorial simple, ud-viz is imported this way (manually), but a [npm package](https://www.npmjs.com/package/ud-viz) exists and it's recommended to use it since you can benefit of its regular updates.

## Create your game

 * Let's create a script tag in the `index.html` and add the following code to start a new local game (*Still in the **\<body\>***):
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```html
<script type="text/javascript">
  const myWorld = new udv.Game.Shared.World({
    name: 'My World',
    origin: { lat: 45.7530993, lng: 4.8452654, alt: 300 },
    gameObject: {
      name: 'GameManager',
    },
  });

  const app = new udv.Templates.LocalGame();
  app.start(myWorld, './assets/config/local_game_config.json');
</script>
```
<<<<<<< HEAD
<<<<<<< HEAD
First a new World called `My World` is created, you have to specified at which 3D coordonates you want to create it. Here we take a random location in Lyon. We also scpecified our root gameobject which is here called `GameManager`

Then a [LocalGame](../../src/Templates/LocalGame/LocalGame.js) is instanciate, to start it you need to pass a world and a path to a config file. To do this, create a file `local_game_config.json` in the folder **./assets/config/local_game_config.json** ([local_game_config.json](../../examples/assets/config/local_game_config.json)) and copy the following code :
=======

First a new world called `My World` is created, you have to specify at which 3D coordinates you want to create it. Here we take a random location in Lyon. We also specify our root game object which is here called `GameManager`.

Then a [LocalGame](../../src/Templates/LocalGame/LocalGame.js) is instanciated, to start it you need to pass a world and the path to a config file.

Create a new folder called `./assets/config/` and, in it, a new file called [`local_game_config.json`](../../examples/assets/config/local_game_config.json) composed of the following code:
>>>>>>> First pass.
=======

First a new world called `My World` is created, you have to specify at which 3D coordinates you want to create it. Here we take a random location in Lyon. We also specify our root game object which is here called `GameManager`.

Then a [LocalGame](../../src/Templates/LocalGame/LocalGame.js) is instanciated, to start it you need to pass a world and the path to a config file.

* Create a new folder called `./assets/config/` and, in it, a new file called [`local_game_config.json`](../../examples/assets/config/local_game_config.json) composed of the following code:
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```json
{
  "game": {
    "fps": 30,
    "shadowMapSize": 2046,
    "skyColor": {
      "r": 0.4,
      "g": 0.6,
      "b": 0.8
    }
  },
  "itowns": {
    "radiusExtent": 1000
  }
}
```

Parameters in the `game` section are relative to your [GameView](../../src/Views/GameView/GameView.js) (the framerate, the size of the shadow map and the sky color). The `itowns` parameter is used to crop the area around the location of your world.

<<<<<<< HEAD
<<<<<<< HEAD
* Ok at this point let's look what should appear on your **browser**.
=======
Ok, at this point, your browser should display something like the following, namely a light blue background and a dark blue slab.
>>>>>>> First pass.
=======
Ok, at this point, your **browser** should display something like the following, namely a light blue background and a dark blue slab.
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

![1](./Pictures/1.png)

## Parameterize itowns layers

That's great, you don't know it yet but this is Lyon, ok let's make the city appear!

* Let's add these lines in your `local_game_config.json` file

```json
"background_image_layer": {
    "url": "https://download.data.grandlyon.com/wms/grandlyon",
    "name": "Ortho2018_Dalle_unique_8cm_CC46",
    "version": "1.3.0",
    "format": "image/jpeg",
    "layer_name": "Base_Map",
    "transparent": true
},
"elevation_layer": {
    "url": "https://download.data.grandlyon.com/wms/grandlyon",
    "name": "MNT2018_Altitude_2m",
    "format": "image/jpeg",
    "layer_name": "wms_elevation_test"
}
```

Here we are parameterizing the layers of the [itowns](http://www.itowns-project.org/itowns/docs/#home) framework on which `ud-viz` is based :

  - `background_image_layer` defines where and how to query the background image of the ground ([ColorLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/ColorLayer)).
  - `elevation_layer` defines where and how to query the heightmap texture to display the elevation of the ground ([ElevationLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/ElevationLayer)).

* Let's see how it looks like now:

![2](./Pictures/2.png)

* Okay we are close, add these lines in `local_game_config.json`:

```json
"3DTilesLayer": {
    "id": "3d-tiles-layer-building",
    "url": "./assets/lod_flying_campus/tileset.json",
    "color": "0xFFFFFF",
    "initTilesManager": "true"
}
```

<<<<<<< HEAD
<<<<<<< HEAD
Here data (geometries of buildings) are not collected from a **distant server** but **locally**, you need to download these [folder](../../examples/assets/lod_flying_campus), then copy it in **./assets/**
=======
Here data (geometries of buildings) are not collected from a distant server but locally, you need to download the  [`lod_flying_campus` folder](../../examples/assets/lod_flying_campus) in `./assets/`.
>>>>>>> First pass.
=======
Here data (geometries of buildings) are not collected from a distant server but locally, you need to download the  [`lod_flying_campus` folder](../../examples/assets/lod_flying_campus) in `./assets/`.
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

Here is what you should see now:

![3](./Pictures/3.png)

That's it Lyon is here! Now we are going to add our zeppelin.
<<<<<<< HEAD

## Create a world script

TODO: mieux décrire ce qu'est un world script en général et son but dans le cas particulier de ce tuto.

<<<<<<< HEAD
* Add the following code in `index.html` inside the declaration of the `myWorld` object.
=======
First we are going to attach a [`WorldScript`](../../src/Game/Shared/GameObject/Components/WorldScript.js) to our `GameManager` game object. A world script is used to customize the world simulation, you can put your code in different events called by the game engine.

In `index.html`, complete the declaration of the `myWorld` object as the following:
>>>>>>> First pass.
=======

## Create a world script

TODO: mieux décrire ce qu'est un world script en général et son but dans le cas particulier de ce tuto.

First we are going to attach a [`WorldScript`](../../src/Game/Shared/GameObject/Components/WorldScript.js) to our `GameManager` game object. A world script is used to customize the world simulation, you can put your code in different events called by the game engine.

* In `index.html`, complete the declaration of the `myWorld` object as the following:
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```js
gameObject: {
    name: 'GameManager',
    static: true,
    components: {
        WorldScript: {
            idScripts: ['worldGameManager'],
        }
    },
},
```

> `static` set to `true` is used for internal optimization and is meaning that this gameobject is not moving into the 3D scene.

<<<<<<< HEAD
<<<<<<< HEAD
Now our GameManager gameobject is linked to a worldscript named worldGameManager. We need to import that script in our game. 
* To do so add these lines to your `local_game_config.json` file.
=======
Now our `GameManager` game object is linked to a world script named `worldGameManager`. We need to import that script in our game. To do so add these lines to your `local_game_config.json` file.
>>>>>>> First pass.
=======
Now our `GameManager` game object is linked to a world script named `worldGameManager`. We need to import that script in our game. 
* To do so add these lines to your `local_game_config.json` file.
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```json
"assetsManager": {
    "worldScripts": {
        "worldGameManager": {
            "path": "./assets/worldScripts/worldGameManager.js"
        }
    }
}
```

<<<<<<< HEAD
<<<<<<< HEAD
Now there is a worldscript named *worldGameManager* located at a certain path.

* Finally we need to create that script `worldGameManager.js`, in **./assets/worldscripts/** folder.

Skeleton of the `worldGameManager.js` is like so :
=======
Now we need to create the `worldGameManager.js` world script in the new folder `./assets/worldScripts/`. Fill the script with the following skeleton:
>>>>>>> First pass.
=======
Now we need to create the `worldGameManager.js` world script in the new folder `./assets/worldScripts/`. 

* Fill the script with the following skeleton:
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```js
let Shared;

module.exports = class WorldGameManager {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;
  }

  init() {}

  tick() {}
};
```

<<<<<<< HEAD
<<<<<<< HEAD
* Copy it in `worldGameManager.js`

`conf` is metadata that could be passed into the json file but here there is none. `SharedModule` is the dynamic import of the [library](../../src/Game/Shared/Shared.js) which is used to code inside a worldscript context.

`init` is called when the gameobject is added, and `tick` is called every world simulation step.
=======
- `conf` is metadata that could be passed into the json file but here there is none. `SharedModule` is the dynamic import of the [library](../../src/Game/Shared/Shared.js) which is used to code inside a worldscript context.
- `init` is called when the gameobject is added, and `tick` is called every world simulation step.
>>>>>>> First pass.

## Add the zeppelin game object

=======
- `conf` is metadata that could be passed into the json file but here there is none. `SharedModule` is the dynamic import of the [library](../../src/Game/Shared/Shared.js) which is used to code inside a worldscript context.
- `init` is called when the gameobject is added, and `tick` is called every world simulation step.

## Add the zeppelin game object

>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63
* Let's add the zeppelin, add these lines into `init` method.

```js
  init() {
    //a context containing all references needed for scripting game
    const worldContext = arguments[1];
    const world = worldContext.getWorld();

    this.zeppelin = new Shared.GameObject({
      name: 'zeppelin',
      components: {
        Render: { idModel: 'zeppelin' },
      },
    });

    world.addGameObject(this.zeppelin, worldContext, world.getGameObject());
  }
```

We create a new gameobject called zeppelin and a [Render](../../src/Game/Shared/GameObject/Components/Render.js) component is added with an id of the 3D model.

As always when we point to assets with an id, we need to import that asset (here a 3D model). We gonna to use this [one](../../examples/assets/models/Zeppelin_Labex_IMU.glb). 
* Like the worldscript add these lines in your `local_game_config.json` file :

```json
"assetsManager": {
    "models": {
      "zeppelin": {
        "path": "./assets/models/Zeppelin_Labex_IMU.glb",
        "anchor": "center_min",
        "rotation": { "x": 0, "y": 1.5707, "z": 0 }
      }
    },
    "worldScripts": {
      "worldGameManager": {
        "path": "./assets/worldScripts/worldGameManager.js"
      }
    }
  }
```

- `path` point to your .glb
- `anchor` means where the origin of the object is taken here at the bottom centered of the 3D model
- `rotation` sets a custom rotation for the 3D model

Ok let's see what's happen on screen

![4](./Pictures/4.png)

Yes a zeppelin appears on the middle of the scene ! trust me...

## Create a local script

Ok let's add a [LocalScript](../../src/Game/Shared/GameObject/Components/LocalScript.js) now to focus the camera on this zeppelin. These scripts are used to customize client-side game.

> In this simple tutorial, every script could be a localScript since the world is simulated on the client-side but it's good pratice to keep them separated since the world simulation could be executed somewhere else (on a distant server for example).

<<<<<<< HEAD
<<<<<<< HEAD
* GameManager in `index.html` become
=======
GameManager in `index.html` becomes:
>>>>>>> First pass.
=======
* GameManager in `index.html` becomes:
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```js
gameObject: {
    name: 'GameManager',
    static: true,
    components: {
        WorldScript: {
            idScripts: ['worldGameManager'],
        },
        LocalScript: {
            idScripts: ['focus'],
        },
    },
}
```

* Import it the same way that the worldscript with these lines in your `local_game_config.json` file.

```json
"localScripts": {
    "focus": {
       "path": "./assets/localScripts/focus.js"
    }
}
```

A localscript skeleton is like so:

```js
/** @format */

let udviz;

module.exports = class MyClass {
  constructor(conf, udvizBundle) {
    this.conf = conf;
    udviz = udvizBundle;
  }

  init() {}

  tick() {}
};
```

`conf` is metadata that could be passed into the json file but here there is none. `udvizBundle` is the dynamic import of the ud-viz framework which is used to code inside a localscript context.

* And here is the [focus.js](../../examples/assets/localScripts/focus.js) script, copy it in the folder **./assets/localScripts**

Ok here is what the game looks like now, you should also be able to zoom in/out with the wheel !

![5](./Pictures/5.png)

## Inputs

Ok, in the next steps we are going to move the zeppelin above the city.

<<<<<<< HEAD
<<<<<<< HEAD
* Let's add a new localscript. Complete the declaration of the GameManager in `index.html` gameobject like below:
=======
Let's add a new `commands.js` local script. Complete the declaration of the GameManager game object in `index.html` like below:
>>>>>>> First pass.
=======
* Let's add a new `commands.js` local script. Complete the declaration of the GameManager game object in `index.html` like below:
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```js
gameObject: {
    name: 'GameManager',
    static: true,
    components: {
        WorldScript: {
            idScripts: ['worldGameManager'],
        },
        LocalScript: {
            idScripts: ['focus', 'commands'],
        },
    },
}
```

<<<<<<< HEAD
<<<<<<< HEAD
* Import it in your `local_game_config.json`
=======
Modify `local_game_config.json` to import it
>>>>>>> First pass.
=======
* Modify `local_game_config.json` to import it
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

```json
"localScripts": {
      "focus": {
        "path": "./assets/localScripts/focus.js"
      },
      "commands": {
        "path": "./assets/localScripts/commands.js"
      }
    }
```

<<<<<<< HEAD
<<<<<<< HEAD
* Then copy [commands.js](../../examples/assets/localScripts/commands.js) in the folder **./assets/localScripts**.
=======
Then copy this [commands.js](../../examples/assets/localScripts/commands.js) local scrip in the folder `./assets/localScripts`.
>>>>>>> First pass.
=======
* Then copy this [commands.js](../../examples/assets/localScripts/commands.js) local scrip in the folder `./assets/localScripts`.
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

Now commands are sent to the world simulation but not used yet.

* In the `worldGameManager.js` add these lines in the `tick` function

```js
tick() {
    const worldContext = arguments[1];
    const dt = worldContext.getDt();
    const commands = worldContext.getCommands();
    const speedTranslate = 0.05;
    const speedRotate = 0.0003;
    const zeppelin = this.zeppelin;

    commands.forEach(function (cmd) {
      switch (cmd.getType()) {
        case Shared.Command.TYPE.MOVE_FORWARD:
          zeppelin.move(
            zeppelin.computeForwardVector().setLength(dt * speedTranslate)
          );
          break;
        case Shared.Command.TYPE.MOVE_BACKWARD:
          zeppelin.move(
            zeppelin.computeBackwardVector().setLength(dt * speedTranslate)
          );
          break;
        case Shared.Command.TYPE.MOVE_LEFT:
          zeppelin.rotate(new Shared.THREE.Vector3(0, 0, speedRotate * dt));
          break;
        case Shared.Command.TYPE.MOVE_RIGHT:
          zeppelin.rotate(new Shared.THREE.Vector3(0, 0, -speedRotate * dt));
          break;
        default:
          throw new Error('command not handle ', cmd.getType());
      }
    });
  }
```

<<<<<<< HEAD
<<<<<<< HEAD
* You can now pilot the zeppelin ! Try it with Z,Q,S,D or Arrows.
=======
You can now pilot the zeppelin! Try it with the Z,Q,S,D or the arrows keys.
>>>>>>> First pass.
=======
* You can now pilot the zeppelin! Try it with the Z,Q,S,D or the arrows keys.
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63

## Add collisions

Now we are going to add some collectable spheres.

* In `worldGameManager.js` add the method createCollectableSphere

```js
createCollectableSphere(x, y) {
  const size = 10;

  const result = new Shared.GameObject({
    name: 'collectable_sphere',
    static: true,
    components: {
      Render: {
        idModel: 'sphere',
        color: [Math.random(), Math.random(), Math.random()],
      },
    },
    transform: {
      position: [x, y, size],
      scale: [size, size, size],
    },
  });

  return result;
}
```

* and then inside the `init` method

```js
//add collectable sphere at random position
const range = 400;
const minRange = 50;
for (let i = 0; i < 10; i++) {
  let x = (Math.random() - 0.5) * range;
  let y = (Math.random() - 0.5) * range;

  if (x > 0) {
    x += minRange;
  } else {
    x -= minRange;
  }

  if (y > 0) {
    y += minRange;
  } else {
    y -= minRange;
  }

  const s = this.createCollectableSphere(x, y);
  world.addGameObject(s, worldContext, world.getGameObject());
}
```

* You should see spheres around your zeppelin (zoom out :smile:)

![6](./Pictures/6.png)

ok that's nice, now let handle the collision with these objects.

* First add a [Collider](../../src/Game/Shared/GameObject/Components/Collider.js) component to these spheres in `worldGameManager.js`

```js
  createCollectableSphere(x, y) {
    const size = 10;

    const result = new Shared.GameObject({
      name: 'collectable_sphere',
      static: true,
      components: {
        Render: {
          idModel: 'sphere',
          color: [Math.random(), Math.random(), Math.random()],
        },
        Collider: {
          shapes: [
            {
              type: 'Circle',
              center: { x: 0, y: 0 },
              radius: size / 2,
            },
          ],
        },
      },
      transform: {
        position: [x, y, size],
        scale: [size, size, size],
      },
    });

    return result;
  }
```

<<<<<<< HEAD
<<<<<<< HEAD
* Then add a [Collider](../../src/Game/Shared/GameObject/Components/Collider.js) component to the zeppelin in the `init` method inside `this.zeppelin` declaration.

=======
Then add a [Collider](../../src/Game/Shared/GameObject/Components/Collider.js) component to the zeppelin in the `init` method inside `this.zeppelin` declaration:
>>>>>>> First pass.
=======
* Then add a [Collider](../../src/Game/Shared/GameObject/Components/Collider.js) component to the zeppelin in the `init` method inside `this.zeppelin` declaration:
>>>>>>> a00eec6ebd72e11ce146f44c93f7194714e2eb63
```js
this.zeppelin = new Shared.GameObject({
  name: 'zeppelin',
  components: {
    Render: { idModel: 'zeppelin' },
    Collider: {
      shapes: [
        {
          type: 'Circle',
          center: { x: 0, y: 0 },
          radius: 10,
        },
      ],
    },
  },
});
```

Ok now let's add a new world script for the zeppelin to handle collisions.

Create the new world script file [`zeppelin.js`](../../examples/assets/worldScripts/zeppelin.js) in the assets, import it with the config file, and attach it as a component of the zeppelin object.

TODO: expliciter où doit être ajouté le worldScript component (ie dans worldGameManager.js et pas index.html comme j'ai voulu le faire)

TODO: expliquer ce qu'est un component et ce que sont censés représenter les worldscripts et localscripts


When you touch a sphere with the zeppelin, it should new disappear!!

## Conclusion

Congrats you have finished this tutorial, you are now able to :

- Create a project from scratch,
- Import assets in a ud-viz game,
- Parameterize itowns layers,
- Manipulatr components of gameobjects,
- Use user inputs.
