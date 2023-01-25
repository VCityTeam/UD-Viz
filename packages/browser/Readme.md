# @ud-viz/browser
[![NPM package version](https://badgen.net/npm/v/ud-viz)](https://npmjs.com/package/ud-viz)

@ud-viz/browser is a JavaScript library based on [iTowns](https://github.com/itowns/itowns), using [npm](https://www.npmjs.com/) and [published on the npm package repository](https://www.npmjs.com/package/ud-viz), allowing to visualize, analyze and interact with urban data.


* [UD-Viz-Template](https://github.com/VCityTeam/UD-Viz-Template) (demonstration) application,

## Sources directory layout (organizational principles)
Definitions:
 - [Component](https://en.wikipedia.org/wiki/Component-based_software_engineering):<a name="anchor-ud-viz-component-definition"></a>
   everything thats is necessary to execute only one aspect of a desired functionality (see also [module](https://en.wikipedia.org/wiki/Modular_programming)). 
 - Extension: a component depending on a [web service](https://github.com/VCityTeam/UD-Viz/blob/master/src/Widget/Extensions/Geocoding/services/GeocodingService.js#L2) in order to be functionnal.
 - Widget ([web widget](https://en.wikipedia.org/wiki/Web_widget)): an embedded element of a host web page but which is substantially independent of the host page (having limited or no interaction with the host). All the widget created in UD-Viz are explain [here](./src/Widget/Widget.md).
 - [Template](https://en.wikipedia.org/wiki/Template_method_pattern): a class build on sibling sub-directories (Game, Widget, Views) components and  proposing an application model
 - View: decorated/enhanced [iTowns Views](https://www.itowns-project.org/itowns/docs/#api/View/View)


```
UD-Viz (repo)
├── src                         # All the js sources of UD-Viz JS library
|    ├── Component             # A set of components used by sub-directories at this level
|    ├── Templates              # Classes builded with other sub-directory (Game, Widget, Views) to propose application model
|    ├── Views                  # Classes of 3D views encapsulating the itowns view
|    ├── Game                   # A sub-directory offering game engine functionnality (node compatible)
|    |               
|    └── Widget                # A sub-directory gathering a set web web widgets (UI)  
|         ├── Widget_1
|         ├── Widget_2
|         ├── ...
|         └── Extensions        # Widget depending on an external web service  
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
        ├── Component 
        |    └── Component_1         # A component shared by the Game and Widget sub-directories
        |         └── *.js ...       # Component definition
        ├── Game   
        |    └── Component_2         # A component used by the Game sub-directory 
        |              └── ...       
        └── Widget  
             ├── Component
             |    └── Component_3    # A component shared by at least two widgets 
             |         └── ...      
             └── Widget_1     
                  └── Component_4    # A component only used by Widget_1 (of the Widget sub-directory) 
                       └── ...         
   ```
