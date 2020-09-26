# Temporal Module (Graph version)
To use the temporal module with the graph view. 
You need to specify some graphics options.

Inside the file `UDV-Core\examples\data\config\generalDemoConfig.json` 
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