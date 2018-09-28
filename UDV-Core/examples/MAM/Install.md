# Installation

Once that UDV is installed you can install MAM. You can deploy this actual software to get a demonstration of MAM.

## Setting before launch MAM

If you want to observe a city you have to make sure of several things :
 * adjust the projection mode by Proj4 & extent, limits of projection

### How to add en extra layers

* Import new layer by following iTowns method
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
###How change the camera preset

By default the only prefab allow you to switch in a view only adapt to an specific model. One solution to solve this problem is to change this options. The first step is to open MAM, and manually set the camera to the Model. After this open your debugger tool and press **Q**, this input will show the camera position and rotation, change the setting link to the key A, by modify the Position and Quaternion by the ones you get earlier (Quarternion is the Rotation).

## Launch MAM

First you have to start npm, then open the following page :  http://localhost:8080/examples/MAM/Demo.html
