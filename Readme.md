# UD-Viz : Urban Data Vizualisation

UD-Viz is a JavaScript library based on [iTowns](https://github.com/itowns/itowns), using [npm](https://www.npmjs.com/) and [published on the npm package repository](https://www.npmjs.com/package/ud-viz), allowing to visualize, analyse and interact with urban data.

A tutorial of the game engine can be found [here](./Doc/Devel/LocalGameTutorial.md)

### Pre-requisite
Developing UD-Viz requires some knowledge about [JS](https://github.com/VCityTeam/UD-SV/blob/master/UD-Doc/Devel/ToolJavaScript.md), [node.js](https://en.wikipedia.org/wiki/Node.js), [npm](https://en.wikipedia.org/wiki/Npm_(software)) and [three.js](https://threejs.org/).

### Install npm
For the npm installation refer [here](https://github.com/VCityTeam/UD-SV/blob/master/Tools/ToolNpm.md)

Required npm version: UD-Viz has been reported to work with npm versions npm 6.X and npm 7.X.

### Installing the UD-Viz library per se

```bash
git clone https://github.com/VCityTeam/UD-Viz.git
cd UD-Viz
npm install
```

### Try examples 

```bash
cd PATH_TO_UD-Viz
npm run build
cd /
git clone https://github.com/VCityTeam/UD-SimpleServer
cd UD-SimpleServer
npm install
node index.js PATH_TO_UD-Viz 8000
```

* [UD-Viz-Template](https://github.com/VCityTeam/UD-Viz-Template) (demonstration) application,
* online demos are [available here](https://projet.liris.cnrs.fr/vcity/demos/)

## Developers

### Recommended IDE

Installing [Visual Studio Code](https://code.visualstudio.com/) is recommended, in order to use the plugin formatter [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). Once installed you should setup Prettier with single quote coding style (Preferences => Settings => Type in search bar : Single quote => Toggle single quote of Prettier extension)

### Workflow

Before pushing your modifications to the origin repository please run:

```bash
npm run travis
```

in order to assert that `eslint` and `webpack` commands are still effective

**Tip for Windows developers:** eslint requires Linux style newline characters which are often overwritten in Windows environments. Although this is automatically resolved by Git when pushing code, eslint may detect "incorrect" newline characters when running locally. To attempt to fix this you may need to run `npm run eslint -- --fix`.

## Sources directory layout (organizational principles)
Definitions:
 - [Component](https://en.wikipedia.org/wiki/Component-based_software_engineering)<a name="anchor-ud-viz-component-definition"></a>
   - `Components` folder: a set of components
 - Extension: a component depending on a [web service](https://github.com/VCityTeam/UD-Viz/blob/master/src/Widgets/Extensions/Geocoding/services/GeocodingService.js#L2) in order to be functionnal.
 - [web widgets](https://en.wikipedia.org/wiki/Web_widget)
 - [Templates](https://en.wikipedia.org/wiki/Template_method_pattern)
 - [itowns views](https://www.itowns-project.org/itowns/docs/#api/View/View)


```
UD-Viz (repo)
├── src                         # All the js sources of UD-Viz JS library
|    ├── Components             # A set of components used by sub-directories at this level
|    ├── Templates              # Classes builded with other sub-directory (Game, Widgets, Views) to propose application model
|    ├── Views                  # Classes of 3D views encapsulating the itowns view
|    ├── Game                   # A sub-directory offering game engine functionnality
|    |    ├── Shared            # code that can be executed both and client and server side to simulate a world
|    |               
|    └── Widgets                # A sub-directory gathering a set web web widgets (UI)  
|         ├── Widget_1
|         ├── Widget_2
|         ├── ...
|         └── Extensions        # Widgets depending on an external web service  
├── ...
└── webpack.js
```

Notes:
 * The position of a specific component in the sub-folder hierarchy reflects
   how it is shared/re-used by sub-directories. For example if a given component 
   is only used by a single widget, then it gets defined within that widget 
   folder. But when another component usage is shared by two widgets then 
   its definition directory gets promoted at the level of the two widgets
   ```
   └── src         # holds all the js sources that will be build
        ├── Components 
        |    └── Component_1         # A component shared by the Game and Widgets sub-directories
        |         └── *.js ...       # Component definition
        ├── Game
        |    └── Shared      
        |         └── Component_2    # A component used by the Shared sub-set of the Game sub-directory 
        |              └── ...       
        └── Widgets  
             ├── Components
             |    └── Component_3    # A component shared by at least two widgets 
             |         └── ...      
             └── Widget_1     
                  └── Component_4    # A component only used by Widget_1 (of the Widgets sub-directory) 
                       └── ...         
   ```
