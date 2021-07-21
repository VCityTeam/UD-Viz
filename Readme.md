# UD-Viz : Urban Data Vizualisation

UD-Viz is a JavaScript library based on [iTowns](https://github.com/itowns/itowns), using [npm](https://www.npmjs.com/) and [published on the npm package repository](https://www.npmjs.com/package/ud-viz), allowing to visualize, analyse and interact with urban data.

A tutorial of the game engine can be found [here](./Doc/Devel/LocalGameTutorial.md)

### Pre-requisite
Developing UD-Viz requires some knowledge about [JS](https://github.com/VCityTeam/UD-SV/blob/master/UD-Doc/Devel/ToolJavaScript.md), node.js, npm and [three.js](https://threejs.org/).

## Installation
### Prerequisite: install nodejs and npm

* **Ubuntu**

  * Install and update npm

    ```bash
    sudo apt-get install npm    ## Will pull NodeJS
    sudo npm install -g n     
    sudo n latest
    ```

  * References: [how can I update Nodejs](https://askubuntu.com/questions/426750/how-can-i-update-my-nodejs-to-the-latest-version), and [install Ubuntu](http://www.hostingadvice.com/how-to/install-nodejs-ubuntu-14-04/#ubuntu-package-manager)

* **Windows**
  
  * Installing from the [installer](https://nodejs.org/en/download/)
  * Installing with the [CLI](https://en.wikipedia.org/wiki/Command-line_interface)

    ```bash
    iex (new-object net.webclient).downstring(‘https://get.scoop.sh’)
    scoop install nodejs
    ```

### Installing the UD-Viz library

```bash
git clone https://github.com/VCityTeam/UD-Viz.git
cd UD-Viz
npm install
```

## Setup of the coding environment

Installing [Visual Studio Code](https://code.visualstudio.com/) is recommended, in order to use the plugin formatter [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). Once installed you should setup Prettier with single quote coding style (Preferences => Settings => Type in search bar : Single quote => Toggle single quote of Prettier extension)

### Workflow

Before to push your modifications run:
```
npm run travis
```
to check if eslint and the webpack commands run well

## Demos
Standard application demos using UD-Viz are [gathered in UD-Viz-demo](https://github.com/VCityTeam/UD-Viz-demo)
and some online demos are [available here](https://projet.liris.cnrs.fr/vcity/demos/)

## Sources directory layout (organizational principles) FIXME:update layout description
Definitions:
 - [Component](https://en.wikipedia.org/wiki/Component-based_software_engineering)
   - `Components` folder: a set of components
 - Extension: a component depending on a [web service](https://github.com/VCityTeam/UD-Viz/blob/master/src/Widgets/Extensions/Geocoding/services/GeocodingService.js#L2) in order to be functionnal. 
 - Plugin: a plugin (importable atomic sub-library) of the iTowns framework
 - [web widgets](https://en.wikipedia.org/wiki/Web_widget)


```
UD-Viz (repo)
├── src                         # All the js sources of UD-Viz JS library
|    ├── Components             # A set of components used by the plugins
|    ├── Game                   # A plugin offering game engine functionnality
|    |    ├── Shared            # code that can be executed both and client and server side
|    |    └── Client            # client side game components           
|    └── Widgets                # A plugin gathering a set web web widgets (UI)  
|         ├── Widget_1
|         ├── Widget_2
|         ├── ...
|         └── Extensions        # Widgets depending on an external web service  
├── ...
└── webpack.js
```

Notes:
 * The position of a specific component in the sub-folder hierarchy reflects
   how it is shared/re-used by the plugins. For example if a given component 
   is only used by a single widget, then it gets defined within that widget 
   folder. But when another component usage is shared by two widgets then 
   its definition directory gets promoted at the level of the two widgets
   ```
   └── src         # holds all the js sources that will be build
        ├── Components 
        |    └── Component_1         # A component shared by the Game and Widgets plugins 
        |         └── *.js ...       # Component definition
        ├── Game
        |    └── Shared      
        |         └── Component_2    # A component used by the Shared sub-set of the Game plugin 
        |              └── ...       
        └── Widgets  
             ├── Components
             |    └── Component_3    # A component shared by at least two widgets 
             |         └── ...      
             └── Widget_1     
                  └── Component_4    # A component only used by Widget_1 (of the Widgets plugin) 
                       └── ...         
   ```
