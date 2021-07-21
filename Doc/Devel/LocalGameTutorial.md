<!-- @format -->

Local Game tutorial:

Welcome in the first ud-viz game tutorial. Lines will be add step by step if you want to see complete files go to ./examples/LocalGame.html. At the end of this tutorial you will fly with your zeppelin in the sky of Lyon !

![Zeppelin](./Pictures/zeppelin.gif)

For this tutorial you will need to import ud-viz package in your project. In this turorial we achieve this by building locally a bundle of the library, then with importing it with a script tag.
You can now add your script tag calling udv npm package (its recommended for your production app to import ud-viz with npm to benefit of the upgrade). To begin your code should look like this:

```
<!DOCTYPE html>
<html>
  <head>
    <title>My awesome game</title>

    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <script src="../dist/debug/udv.js"></script>
    <!--the path point your bundle library-->
    <script type="text/javascript">
      const myWorld = new udv.Game.Shared.World({
        name: 'My World',
        origin: { lat: 45.7530993, lng: 4.8452654, alt: 300 },
        gameObject: {
          name: 'GameManager'
        },
      });

      const app = new udv.Templates.LocalGame();
      app.start(myWorld, './assets/config/local_game_config.json');
    </script>
  </body>
</html>
```

First a new World called "My World" is created, you have to specified at which 3D coordonate you want to create it. Here we take a random location in Lyon. We also scpecified our root gameobject which is here called GameManager

Then a LocalGame is instanciate, to start it you need to pass a world and a path to a config file.

The config file (./assets/config/local_game_config.json in our case) should look like this:

```
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

Parameters in game section are relative to your GameView (the framerate, the size of the shadow map and the sky color). The itowns parameter is used to delimiter the area around the location of your world. (TODO mettre des valeurs par default pour éviter à l'utilisateur de dealer avec ça)

Ok at this point let's look what should appear on your screen. Note that you have to serve your .html file in order to see it in your browser. To do so, you can git clone UD-SimpleServer and host easily your .html with CLI.

![1](./Pictures/1.png)

That's great, you don't know it yet but this is Lyon, ok let's make the city appear !

Let's add these lines in your config file

```
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

Here we are parameterized layer of the itowns framework on which ud-viz is builded.

"background_image_layer" define where (url) to query textures of the ground

"elevation_layer" is the texture used as a heightmap to specified the altitude of the ground

ok let's see how it looks like now:

![2](./Pictures/2.png)

ok ok we are close, add these lines

```
"3DTilesLayer": {
    "id": "3d-tiles-layer-building",
    "url": "./assets/lod_flying_campus/tileset.json",
    "color": "0xFFFFFF",
    "initTilesManager": "true"
},
```

here data (the geometry of building) are not collected from a distant server but locally, you need to download these data(url), and then to point with the url to them (here ./assets/lod_ton_pere_est_un_voleur)

your screen now

![3](./Pictures/3.png)

That's it lyon is here, ok now we are gonna to add our zeppelin.

First we are gonna to attach a WorldScript to our gameobject GameManager. A worldscript is used to customize the world simulation.

```
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

static set to true is used for internal optimization and is meaning that this gameobject is not moving into the 3D scene.

now our GameManager is linked to a worldscript named worldGameManager. We need to import that script in our game. To do so add these lines to your config file.

```
"assetsManager": {
    "worldScripts": {
        "worldGameManager": {
            "path": "./assets/worldScripts/worldGameManager.js"
        }
    }
}
```

this means that now there is a worldscript named worldgamemanager located at path.

Finally we need to create that script, in the example it's located in ./assets/worldscripts/ folder.

skeleton of a worldscript is like this

```
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

conf is metadata pass into the json file here there is none. SharedModule is the dynamic import of the ud-viz/Game/Shared lib

init is called when the go is added, and tick is called every world simulation step.

let's add the zeppelin add these lines into init method.

```
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

we create a new gameobject called zeppelin and we add a render component with an id of the 3D model.

as always we need to import that 3D model. Here we are gonna to use this one(link TODO). Like the worldscript add these lines in your config file

```
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

path point to your .glb
anchor mean where the origin of the object is taken
rotation bake a custom rotation in your 3D model

ok let's see what happens on screen

![4](./Pictures/4.png)

yes a zeppelin appear on the middle of the scene ! trust me...

Ok let's add a localScript now to focus this zeppelin with the camera. These scripts are used to customize client-side game (note that here every script could be a localScript here since the world is simulated on the clientside but it's good pratice to keep them separate since the world simulation could be executed somewhere else)

GameManager become

```
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

Import it the same way that the worldscript with these lines in your config file.

```
"localScripts": {
    "focus": {
       "path": "./assets/localScripts/focus.js"
    }
}
```

and here is the focus script

```
let Shared = null;

//angle to inclinate the camera
const CAMERA_ANGLE = Math.PI / 6;

module.exports = class Focus {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;

    //quaternion to place the camera
    this.quaternionCam = new Shared.THREE.Quaternion().setFromEuler(
      new Shared.THREE.Euler(Math.PI * 0.5, 0, 0)
    );
    this.quaternionAngle = new Shared.THREE.Quaternion().setFromEuler(
      new Shared.THREE.Euler(-CAMERA_ANGLE, 0, 0)
    );

    //initial distance of the camera with the zeppelin
    this.distance = 150;
  }

  init() {
    const _this = this;

    //modulate the distance from the zeppelin with the wheel of the mouse
    //TODO should be register with the InputManager
    window.addEventListener('wheel', function (event) {
      _this.distance += event.wheelDelta * 0.1;
      _this.distance = Math.max(Math.min(_this.distance, 500), 0);
    });
  }

  tick() {
    //the gameobject parent of this script
    const go = arguments[0];

    //a context containing all data to script clientside script
    const localContext = arguments[1];

    //get the zeppelin gameobject by name
    const zeppelin = go.computeRoot().findByName('zeppelin');

    //compute world transform
    const obj = zeppelin.computeObject3D();
    let position = new Shared.THREE.Vector3();
    let quaternion = new Shared.THREE.Quaternion();
    obj.matrixWorld.decompose(position, quaternion, new Shared.THREE.Vector3());

    //move the position a bit up (z is up)
    position.z += 10;

    //compute camera position
    const dir = zeppelin
      .getDefaultForward()
      .applyQuaternion(this.quaternionAngle)
      .applyQuaternion(quaternion);

    position.sub(dir.setLength(this.distance));
    quaternion.multiply(this.quaternionCam);
    quaternion.multiply(this.quaternionAngle);

    //tweak values in camera object
    const iV = localContext.getGameView().getItownsView();
    iV.camera.camera3D.position.copy(position);
    iV.camera.camera3D.quaternion.copy(quaternion);
    iV.camera.camera3D.updateProjectionMatrix();
  }
};
```

ok here is what you should see, you should also be able to zoom in/out with the wheel !

![5](./Pictures/5.png)

ok in the final step we are gonna to move the zeppelin above the city

let's add a commands.js localscript. add it in the gamemanager go

```
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

Import it

```
"localScripts": {
      "focus": {
        "path": "./assets/localScripts/focus.js"
      },
      "commands": {
        "path": "./assets/localScripts/commands.js"
      }
    }
```

Here is what this localscript looks like

```
/** @format */

let Shared = null;

module.exports = class Commands {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;
  }

  init() {
    const localContext = arguments[1];

    //Input manager of the game
    const inputManager = localContext.getGameView().getInputManager();

    //FORWARD
    inputManager.addKeyCommand(
      Shared.Command.TYPE.MOVE_FORWARD,
      ['z', 'ArrowUp'],
      function () {
        return new Shared.Command({ type: Shared.Command.TYPE.MOVE_FORWARD });
      }
    );

    //BACKWARD
    inputManager.addKeyCommand(
      Shared.Command.TYPE.MOVE_BACKWARD,
      ['s', 'ArrowDown'],
      function () {
        return new Shared.Command({ type: Shared.Command.TYPE.MOVE_BACKWARD });
      }
    );

    //LEFT
    inputManager.addKeyCommand(
      Shared.Command.TYPE.MOVE_LEFT,
      ['q', 'ArrowLeft'],
      function () {
        return new Shared.Command({ type: Shared.Command.TYPE.MOVE_LEFT });
      }
    );

    //RIGHT
    inputManager.addKeyCommand(
      Shared.Command.TYPE.MOVE_RIGHT,
      ['d', 'ArrowRight'],
      function () {
        return new Shared.Command({ type: Shared.Command.TYPE.MOVE_RIGHT });
      }
    );
  }

  tick() {
    const localContext = arguments[1];
    const worldComputer = localContext.getGameView().getStateComputer();
    const inputManager = localContext.getGameView().getInputManager();

    //send input manager command to the world
    worldComputer.onCommands(inputManager.computeCommands());
  }
};
```

ok now commands are send to world simulation but the world don't know what to do with them.

in the worldgamemanager.js worldscript let's add these lines in the tick function

```
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

Ok now your travel in zeppelin is possible !! lol