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
    -  id : The id of layer use to control which layer is invisible
    -  url : url of site where the data is stored
    -  protocol : enter the procotol used to transfert this data
    -  version : the version of the protocol
    -  name : the name use to stored the map
    -  projection : the same CRS projection code use to set the model

    In case you want to show more than one map, you can change the opacity, you have to add an extra option
    - opacity : define the ocacity of the map, set by an float in range 0 and 1, this number represent the percent of ocacity, at 0 it's transparent

    * To show more than one map at the time, you must change the opacity of the layer by added an extra line while import it ( opacity = float) the opacity is an float in range 0 to 1 (at 0 the layer is invisible)
* Add the command layer by  following this method :
  * Add a new condition in document.addEventListener('keydown', (event))
  ```
  if (event.key === 'Keyboard_key') {
    for (const layer of view.getLayers()) {
      if (layer.id === 'your_id_layer') {
        layer.visible = !layer.visible;
        //Request redraw
        view.notifyChange(layer);
      }
    }
    return;
  }
  ```
### How change the camera preset

By default the only prefab allow you to switch in a view only adapt to an specific model. One solution to solve this problem is to change this options. The first step is to open MAM, and manually set the camera to the Model. After this open your debugger tool and press **Q**, this input will show the camera position and rotation, change the setting link to the key A, by modify the Position and Quaternion by the ones you get earlier (Quarternion is the Rotation).

## Launch MAM

First you have to start npm, then open the following page :  http://localhost:8080/examples/MAM/Demo.html
