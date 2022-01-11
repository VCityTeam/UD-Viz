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

### Coding style

The JavaScript filees coding style is defined with [eslint](https://eslint.org/) through the [.eslintrc.js configuration file](.eslintrc.js).
It can be checked (e.g. prior to a commit) with the `npm run eslint` command.
Notice that UD-Viz coding style uses a unix `linebreak-style` (aka `LF` as newline character). 

**Tips for Windows developers**

As configured, the coding style requires a Linux style newline characters which might be overwritten in Windows environments
(both by `git` and/or your editor) to become `CRLF`. When such changes happen eslint will warn about "incorrect" newline characters
(which can always be fixed with `npm run eslint -- --fix` but this process quickly gets painfull).
In order to avoid such difficulties, the [recommended pratice](https://stackoverflow.com/questions/1967370/git-replacing-lf-with-crlf)
consists in
 1. setting git's `core.autocrlf` to `false` (e.g. with `git config --global core.autocrlf false`) 
 2. configure your editor/IDE to use Unix-style endings

#### Notes for VSCode users

When using [Visual Studio Code](https://code.visualstudio.com/), you can [install the eslint extension](https://www.digitalocean.com/community/tutorials/linting-and-formatting-with-eslint-in-vs-code) allows you e.g. to automatically fix the coding style e.g. [when saving a file](https://www.digitalocean.com/community/tutorials/linting-and-formatting-with-eslint-in-vs-code) .

### Workflow

Before pushing your modifications to the origin repository please run:

```bash
npm run travis
```

in order to assert that `eslint` and `webpack` commands are still effective

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
