# Temporal Module 

The temporal module manages the interaction to switch time in the scene and
the display of city objects (e.g. buildings) states based on the chosen time. 
These display states are computed from information about the temporal evolution
of city objects stored in a 3DTILES_temporal extension of 3D Tiles.

## 3DTiles-temporal extension 

The definition of 3DTiles-temporal extension as well as introductory material and
the [documention can be found here](https://github.com/VCityTeam/UD-SV/3DTilesTemporalExtention/Readme.md).

## Design of the temporal module

The entrypoint of the temporal module is [TemporalModule.js](../../../../../packages/browser/src/Component/Widget/Temporal/TemporalModule.js).

The module is designed following the MVVM pattern which is one of the preffered
patterns to design UD-Viz modules (see [UD-Viz architecture notes](../../../../../../../docs/static/Devel/ArchitectureMVCTargetDesign.md)).

### The model

The entrypoint of the model is[3DTemporalExtension](../Model/3DTemporalExtension.js). 
The other classes of the model parse the content of the 3DTILES_temporal
extensions pieces scattered in the 3D Tiles classes (e.g. in the bounding
volume or in the batch table).

### The view model

[TemporalProvider.js](../ViewModel/TemporalProvider.js) holds the view model of
this module. It maintains a structure describing city objects display states:
whether they should be displayed or not depending on the date and if yes
with which style: e.g. color, opacity, etc. The style is for instance useful to
hide city objects that should not be displayed or to distinguish existing city
objects from city objects under transactions (e.g. being created or modified).

To associate a style to a specific transaction, just declare it in the
`initCOStyles()` method of the provider. For instance, demolitions are
associated with the red color and with an opacity of 0.6:

````
this.tilesManager.registerStyle('demolition', new CityObjectStyle({
        materialProps: { opacity: 0.6, color: 0xff0000 } })); // red
````

Note that this could be declared in a configuration file to improve usage of this module.

The temporal provider also manages updates of the model.

### The view

The entrypoint of the view is [TemporalView.js](../View/TemporalView.js).
It declares the windows and associates events between windows and the view model.

The view is composed of two windows: the `SLIDERWINDOW` and the `GRAPHWINDOW`.

The slider window allows to move between years:

![](./sliderwindow.png)

The graph window allows to move between versions and through version transitions
parsed from the 3D Tiles temporal extension:

![](./graphwindow.png)

On this figure, circles represents versions and arrows version transitions.
Versions in green represent realized versions while the ones in yellow are
just projects.

Currently one has to choose between one of these windows but we could imagine
using both in the same demo in the future. See the[configuration](#configuration)
section bellow.

## Configuration 

Several options of the temporal module can be specified:

* **view**: enum (see ./View/EnumWindow.js), one of `SLIDERWINDOW` or `GRAPHWINDOW`. 

 The graph window asks for specific configuration, see 
[Graph window specific configuration section bellow](#graph-window-specific-configuration).

* **minTime**: integer, minimum possible display date

* **maxTime**: integer, maximum possible display date 

* **currentTime**: integer, the display date when openning the demo

* **timeStep**: integer, the step in years between two dates
  
For an example of configuration, see the `temporalModule` object in the
`generalDemoConfig.json` file:

  "temporalModule": {
    "view": "SLIDERWINDOW",
    "minTime": 2009,
    "maxTime": 2015,
    "currentTime": 2009,
    "timeStep": 1
  },

### Graph window specific configuration
To use the temporal module with the graph view. 
You need to specify some graphics options.

Inside the file `UDV-Shared\examples\data\config\generalDemoConfig.json` 
we add a new field : temporalGraphWindow. 
In there you will find information related to the temporal 
graph window.
```
{
    "type": "class",
    ...,
    "temporalGraphWindow": {
        "graphOption":{ ... }
    }
}
```
Inside the `graphOption`, will be specified all options related to viz.js.
It gives the opportunity to customise the graphs, its color, its structure...
There are many possibilities. It's directly coming from [viz.js](https://almende.github.io/vis/docs/network/).
So, you can fill it with the same options as for viz.js.  
**All documentation about the fields inside `graphOption` can be found in this [doc](https://almende.github.io/vis/docs/network/).**  
  
Here is a complete example :
```
{ "temporalGraphWindow": {
     "graphOption":
      {
         "edges": { 
           "smooth": {
             "type": "continuous"
           },
           "arrows": {
             "to": true
           },
           "color": {
             "color": "white",
             "highlight": "grey",
             "hover": "white",
             "inherit": "from",
             "opacity": 1.0
           }
         },
         "nodes": {
           "font": {
             "size": 25
           }
         },
         "groups": {
           "useDefaultGroups": true,
           "consensusScenario": {
             "color": {
               "background": "#90EE90",
               "border": "#A9A9A9",
               "highlight": {
                 "border": "black",
                 "background": "#8FBC8F"
               },
               "hover": {
                 "border": "#A9A9A9",
                 "background": "#90EE90"
               }
             },
             "borderWidthSelected": 2000
           }
         },
         "layout": {
           "hierarchical": {
             "direction": "LR",
             "sortMethod": "directed",
             "treeSpacing": 100,
             "levelSeparation": 200,
             "nodeSpacing": 100,
             "edgeMinimization": false
           }
         },
         "interaction": {
           "dragNodes": true,
           "hover": true,
           "hoverConnectedEdges": false,
           "selectConnectedEdges": false
         },
         "physics": {
           "enabled": false
         }
       }
     }
}
```

## Usage and demos

City objects can be in static states (displayed in grey) or in changing states
(transactions). For visual clarity, the current demos displays the following transactions:
*creations*, *modifications* and *demolitions*. However, the module allows to
add styles to other transactions (see [view model design section](#the-view-model) 
for more information). 

Our proposition is to represent city objects' known states in a reference color
(light gray in this example) and to showcase transactions between these states.
Generally, transactions span for a certain amount of time and we do not have
access to the geometry of the feature(s) concerned by the transaction during
this amount of time. Therefore, we propose the following display rule for
transactions: during the first half of the transaction, the geometry of the
**previous** *known state* is displayed. During the second half of a
transaction, the geometry of the **following** *known state* is displayed. The
type of transaction (*creation*, *modification*, etc.) determines the color in
which the geometry is displayed. *Creations* are in green, *modifications* are
in yellow and *demolitions* are in red.  Finally, the opacity varies during the
time of the transaction in the way that it is equal to 1 at the beginning and at
the end of the transaction and to 0 at the half duration of the transaction.
Between these timestamps, it decreases on the first half of the transaction
(from 1 to 0) and increases during the second half of the transaction (from 0 to
1). The following figure illustrates this proposition
on three types of transactions. 

![](./visu-transactions.png)

Here is an example of visualization of a district of the city of Lyon at two
dates:

![](./visu-2013-2014.png)

## Implementation notes

### Concerning the client side temporal tileset model
The code for parsing and storing the temporal tileset can be found in the [model](https://github.com/VCityTeam/UD-Viz/tree/master/src/Widget/Temporal/Model) 

### Concerning the relationship between the slider position and the data update

A [TemporalView calls](../View/TemporalView.js#L46) a [refreshCallback](../View/TemporalView.js#L31) function every time the slider is moved.
* The refreshCallback is defined as the [TemporalView::currentTimeUpdated(...)](../View/TemporalView.js#L25) function.
* The TemporalView passes this refreshCallback to the [TemporalSliderWindow constructor](../View/TemporalView.js#L46) .
* Eventually the callback is [invoked by the TemporalSliderWindow](../View/TemporalSliderWindow.js#L88) when e.g. the slider is acted upon the user.

In order to get the proper slide-bar refresh, the [TemporalView::currentTimeUpdated(...)](../View/TemporalView.js#L25) callback function uses a [provider](../View/TemporalView.js#L18) (that is [handled over to the constructor](../TemporalModule.js#L29)) that triggers a [provider.changeVisibleTilesStates()](../View/TemporalView.js#L29).
* In turn the [TemporalProvider::changeVisibleTilesStates() function](../ViewModel/TemporalProvider.js#L333) uses 
  * a [TileManager](../ViewModel/TemporalProvider.js#L334) ([provided to the constructor](../ViewModel/TemporalProvider.js#L29)) to retrieve the visible tiles,
  * a [`$3DTemporalExtension` model](../TemporalModule.js#L21) (also [provided to the constructor](../ViewModel/TemporalProvider.js#L27))  
* Both those `TileManager` and `model` are [provided to the TemporalProvider at instantiation](../TemporalModule.js#L24) and it is this instantiantion context that instantiates the [`$3DTemporalExtension` model](../TemporalModule.js#L21)

Now, [TemporalProvider::changeVisibleTilesStates() function](../ViewModel/TemporalProvider.js#L333) calls [TemporalProvider::computeTileState()](../ViewModel/TemporalProvider.js#L336) for each `tiles[i].tileId` that [is visible](../ViewModel/TemporalProvider.js#L334)
[TemporalProvider::computeTileState()](../ViewModel/TemporalProvider.js#L336) 
  uses the [`TemporalProvider.COStyles`](../ViewModel/TemporalProvider.js#L39)
  optimization data structure that `computeTileState()`
* [initializes on first traversal](../ViewModel/TemporalProvider.js#L296)
* updates/set the [features rendering style on further traveral](../ViewModel/TemporalProvider.js#L287)

In order to [set the rendering mode (display styles)](../ViewModel/TemporalProvider.js#L336) of the features of tile (for a given currentTime), `TemporalProvider::computeTileState()` calls [TemporalProvider::culling()](../ViewModel/TemporalProvider.js#L178) that 
* If the feature exists at the currentTime, [displays it in gray](../ViewModel/TemporalProvider.js#L188),
* If there is a transaction between the feature and another feature at the currentTime AND
  * if the currentTime lies within the first half duration of the transaction THEN [displayed geometry is the one of the old feature](../ViewModel/TemporalProvider.js#L211) and [set the color](../ViewModel/TemporalProvider.js#L211)
  * if the currentTime lies within the second half of the duration THEN [the displayed geometry is the one of the new feature](../ViewModel/TemporalProvider.js#L229) and [set the color](../ViewModel/TemporalProvider.js#L229)
* If there is no existing feature or transaction at the currentTime :
  * If there a feature that exists in the next vintage, [display it as green (construction)](../ViewModel/TemporalProvider.js#L253)
  * If there a feature that exists in the previous vintage, [display it as red (destruction)](../ViewModel/TemporalProvider.js#L253)
  * Otherwise [hide the feature](../ViewModel/TemporalProvider.js#L264)

Hence, all the features for all the vintages are always present, but their rendering mode depends on the `currentTime` value.  

### Concerning the client side color rendering 

The rendering style is hardcoded in the [TemporalProvider:: initCOStyles()](../ViewModel/TemporalProvider.js#L67) function.
