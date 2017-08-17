# UDV

TO DO : write stuff !!

## Camera Controller

Camera controls are mostly finished.

 * **Left-click + drag** : User "grabs" the ground (cursor stays at the same spot on the ground) to translate camera on XY axis.
 * **Right-click + drag** : camera rotation around the focus point (ground point at the center of the screen), clamped to avoid going under ground level.
* **Mousewheel** : smooth zoom toward the ground point under the mouse cursor, adjusted according to the ground distance (zoom is faster the further from the ground and cannot go through the ground).
* **Mousewheel click** (middle mouse button) : "Smart Zoom". Camera smoothly moves and rotates toward target ground point, at fixed orientation and adjusted distance.
* **S** : moves and orients camera to the start view 
* **T** : moves and orients camera to top view (high altitude and pointing toward the center of the city)

## Document

* Basic support for billboard document : plane geometry with image as texture, oriented to face the camera (billboard behavior).
* Ability to access document metadata by clicking on the billboard.
* Full screen & oriented camera view when clicking on billboard.
* Support for multiple documents (each with its image & metadata)
* Next : multiple documents in an array, built from a json file

## Time slider

Work in progress


