#MAM : Augmented Model of Mediation

MAM is based on UDV, which is a JavaScript client based on [iTowns](https://github.com/itowns/itowns) allowing to visualize, analyse and interact with urban data.

##Current Feature

###Camera Controller

*    **Left-click + drag** : User "grabs" the ground (cursor stays at the same spot on the ground) to translate camera on XY axis.
*    **Right-click + drag** : camera rotation around the focus point (ground point at the center of the screen), clamped to avoid going under ground level.
*    **Mousewheel** : smooth zoom toward the ground point under the mouse cursor, adjusted according to the ground distance (zoom is faster the further from the ground and cannot go through the ground).
*    **Mousewheel click (middle mouse button)** : "Smart Zoom". Camera smoothly moves and rotates toward target ground point, at fixed orientation and adjusted distance.
*    **S** : moves and orients camera to the start view
*    **T** : moves and orients camera to top view (high altitude and pointing toward the center of the city)
*    **A** : moves and orients camera to demonstration view (preset to lyon confluence model)

The camera controller has been merged into itowns (PR) and is now PlanarControls. It features an animation of camera movement and orientation (called "travel" in the code) which we use to orient the camera with a document (document oriented view).

###Data Controller

Each data can be showed or hidden, in order to create customize model. For this exemple all data are taken fron [Data GrandLyon](https://data.grandlyon.com).

* **1** : Bus lines in Lyon.
* **2** : Actual building, sort by use.
* **3** :emission of nitrogen dioxide during a year
* **4** :satellite image
