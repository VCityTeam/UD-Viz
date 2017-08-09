# UDV

TO DO : write stuff !!

## Camera Controller

Camera controls are about to be finished (google map quality !).

 * **Left-click + drag** : User "grabs" the ground (cursor stays at the same spot on the ground) to translate camera on XY axis.
 * **Right-click + drag** : camera rotation around the focus point (ground point at the center of the screen), clamped to avoid going under ground level.
* **Mousewheel** : smooth zoom toward the ground point under the mouse cursor, adjusted according to the ground distance (zoom is faster the further from the ground and cannot go through the ground).
* **Mousewheel click** (middle mouse button) : "Smart Zoom". Camera smoothly moves and rotates toward target ground point, at fixed orientation and adjusted distance.
* **S** : moves and orients camera to a top view (high altitude and pointing toward the center of the city)

From this, the **oriented camera mode for documents** should come soon.

Preliminary tests for **document billboards** and **temporal slider** are also under way.
