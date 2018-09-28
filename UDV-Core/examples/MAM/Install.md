# Installation

Once the UDV is installed you can install MAM. You can deploy this actual software to get a demonstration of MAM.

## Setting before launch MAM

In Order to observe a city you have to make several things. iTowns has to know which place is represent by the model. In MAM.js enter the right projection use taken from [epsg.io](https://epsg.io).
*  On line 14 of MAM.js, reset the itowns.proj4.defs (default values set for Lyon)
*  Then always in MAM.js adapt the extent block (line 18 - 21) use to define the bounds of projection, setting the CRS, min/max X, min/max Y . (default values set for Lyon)
*  Last step, in line 64, change the Coordinates p to adapt then for your new model.
By doing this steps you just have set the projection into the right place.

### How added en extra layers

After you finished to set the projection mod, you can add layers to show data. However if the data is a simple map or complex database the method if the same.
* First, most important in case of data extract from a database you have to write in MAM.js just before import your data, all functions required to extract and show the correct data.
* Once you finish to write this function, you can import your data by create an extra layer.
    * If the layer is a map, you have to write a function similar to this block :
    ```
    view.addLayer({
      type: 'color',
      id: ID_LAYER,
      transparent: false,
      source: {
        url: 'https://WHERE_DATA_IS_STORED',
        networkOptions: { crossOrigin: 'anonymous' },
        protocol: PROTOCOL_USED,
        version: VERSION_USED,
        name: NAME_OF_MAP,
        projection: CRS CODE,
        extent: extent,
        format: 'image/jpeg',
      },
    });
    ```
    You have to change all line write in capital letter, I explain each line to change :
      -  id : The id of layer use to control which layer is visible
      -  url : url of website where the data is stored
      -  protocol : enter the protocol used to load this data
      -  version : the version of the protocol
      -  name : the name use to stored the map
      -  projection : the same CRS projection code use to set the model

    In case you want to show more than one map, you should change the opacity by adding an extra option
      - opacity : define the ocacity of the map, set by an float in range 0 and 1, this number represent the percent of ocacity, at 0 it's transparent and at 1 it's opaque.

    * In case you got other thing than a map the block of line change :
```
    view.addLayer({
      type: 'geometry',
      id: ID_LAYER,',
      name: NAME_OF_DATA_SET,
      update: itowns.FeatureProcessing.update,
      convert: itowns.Feature2Mesh.convert({
        ELEMENT : FUNCTION,
      }),
      onMeshCreated: FUNCTION_MESH,
      source: {
        url: 'https://download.data.grandlyon.com/wfs/rdata?',
        protocol: PROTOCOL_USED,
        version: VERSION_USED,
        typeName: NAME_OF_DATA_SET,
        projection: CRS CODE,
        extent: extent,
        zoom: { min: 2, max: 5 },
        format: FORMAT_OF_DATA,
      },
    });
```
You have to change all line write in capital letter, I explain each line to change :
  -  type : change to became geometry, a geometry layer can change the mesh, and by this way create line, and volume.
  -  id : The id of layer use to control which layer is visible
  -  source : regroup all information to load the data :
    -  url : url of site where the data is stored
    -  protocol : enter the procotol used to transfert this data
    -  version : the version of the protocol
    -  typename : the name use to stored the data
    -  projection : the same CRS projection code use to set the model
    -  zoom : minimum and maximum range to show data.
    -  format : different of protocol, the format is in which form the data is available after being loaded.

* Now you got a new layer, you have to add several lines of code if you want to control it's visibility by a controller like a keyboard. In MAM.js there is an event listener (line 257 by default), inside of it add a block of line based on this exemple :
  ```
  if (event.key === KEYBOARD_KEY) {
    for (const layer of view.getLayers()) {
      if (layer.id === ID_LAYER) {
        layer.visible = !layer.visible;
        //Request redraw
        view.notifyChange(layer);
      }
    }
    return;
  }
  ```
As for add the layer you have to change the input in capital letter :
    - KEYBOARD_KEY : change it by the key code of the key you want to use to control this.
    - ID_LAYER : it's the id of the new controlled layer

    In case you want to show more than one map, you should change the opacity by adding an extra line (you can use a function in order to control layer opacity):

    ```
    if (event.key === KEYBOARD_KEY) {
      //Switch LAYER_A visibility
      for (const layer of view.getLayers()) {
        if (layer.id === ID_LAYER_A) {
          layer.visible = !layer.visible;
          // checking if LAYER_B is visible
          for (const l of view.getLayers()) {
            if (l.id === ID_LAYER_B) {
              if (layer.visible){
                //When both layer are visible
                l.opacity = 0.33;
              }else{
                when LAYER_B is hidden (or when LAYER_A is visible)
                l.opacity = 0.66;
              }
            }
          }
          //Request redraw
          view.notifyChange(layer);
        }
      }
    ```
## Launch MAM

After the setting end, in order to launch MAM you have to execute some commands :
### For Ubuntu
      - Open a console command in the root of MAM (UDV/UDV-Core/exemple/MAM path inside UDV folder)
      - execute ```npm start``` in the console command
      - with a navigator web go into : http://localhost:8080/examples/MAM/Demo.html

NOTE : if you launch more than one npm, the loacalhost will change (as an exemple localhost:8080 will be localhost:8081)

### For Windows
      - Open Windows Powershell and this ```cd``` go into the root of MAM (UDV/UDV-Core/exemple/MAM path inside UDV folder)
      - execute ```npm start``` in the console command
      - with a navigator web go into : http://localhost:8080/examples/MAM/Demo.html

NOTE : if you launch more than one npm, the loacalhost will change (as an exemple localhost:8080 will be localhost:8081)

## How change the camera preset

By now you got an model with an default set and some layers to show extra data about this model. With the [iTowns Contoler](https://www.itowns-project.org/itowns/API_Doc/PlanarControls.html) you can move around your model while stay in top view. You can save preset position to your project.
- The first step is to launch and position the projection at the right place, the objective is to match the model and the projection of the city.
- After that, press **Q** and open a debbuger tool, you will see two data : position and quaternion, save this data for next step.
- Open MAM.js at the end you find two events, one for Keyboard key Q and an another for A. reset the position and quaternion setting with your saved data.

Now to test if your preset is working you have to refresh the web application after saved your modification, when you press **A** the projection will return to the matching setting.
