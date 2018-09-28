# MAM : Augmented Model of Mediation

MAM is based on UDV, which is a JavaScript client based on [iTowns](https://github.com/itowns/itowns) allowing to visualize, analyse and interact with urban data.

## Current Feature

### Camera Controller

In addition of existing iTowns controller, one control in added to change adapt the view
*    **A** : moves and orients camera to demonstration view (preset to lyon confluence model)
*    **Q** : In debugMod, show camera position and orientation
The camera controller has been merged into itowns (PR) and is now PlanarControls. It features an animation of camera movement and orientation (called "travel" in the code) which we use to orient the camera with a document (document oriented view).

### Data Controller

Each data can be showed or hidden, in order to create customize model. For this exemple all data are taken fron [Data GrandLyon](https://data.grandlyon.com). You can use a keyboard in order to switch layer.

* **1** : Bus lines in Lyon.
* **2** : Actual building, sort by use.
* **3** :emission of nitrogen dioxide during a year
* **4** :satellite image
