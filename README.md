# UDV

TO DO : write stuff !!

## Camera Controller

Camera controls are about to be finished (google map quality !).

 * **Left-click + drag** : User "grabs" the ground (cursor stays at the same spot on the ground) to translate camera on XY axis.
 * **Right-click + drag** : camera rotation around the focus point (ground point at the center of the screen), clamped to avoid going under ground level.
* **Mousewheel** : smooth zoom toward the ground point under the mouse cursor, adjusted according to the ground distance (zoom is faster the further from the ground and cannot go through the ground).
* **Mousewheel click** (middle mouse button) : "Smart Zoom". Camera smoothly moves and rotates toward target ground point, at fixed orientation and adjusted distance.
* **S** : moves and orients camera to a top view (high altitude and pointing toward the center of the city)

Preliminary tests for **document billboards** and **temporal slider** are also under way.

## Document

* Basic support for billboard document : plane geometry with image as texture, oriented to face the camera (billboard behavior). * * Ability to access the document object by clicking on the billboard.
* Full screen & oriented camera view when clicking on billboard.

## Time slider

Work in progress


