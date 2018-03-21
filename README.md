# UDV : Urban Data Viewer

UDV is a JavaScript client based on [iTowns](https://github.com/itowns/itowns) allowing to visualize, analyse and interact with urban data. 

Server-side tools can be found [here](https://github.com/MEPP-team/UDV-server).

## Demo
Online demos (alas only visible on the [Lyon1](https://sciences.univ-lyon1.fr/)/[INSA-Lyon](https://www.insa-lyon.fr/en/) campus):
 - [Vilo3D](http://rict.liris.cnrs.fr/Vilo3D/UDV/Vilo3D/)

## Current features (regrouped by Modules) :

### Camera Controller

* **Left-click + drag** : User "grabs" the ground (cursor stays at the same spot on the ground) to translate camera on XY axis.
* **Right-click + drag** : camera rotation around the focus point (ground point at the center of the screen), clamped to avoid going under ground level.
* **Mousewheel** : smooth zoom toward the ground point under the mouse cursor, adjusted according to the ground distance (zoom is faster the further from the ground and cannot go through the ground).
* **Mousewheel click** (middle mouse button) : "Smart Zoom". Camera smoothly moves and rotates toward target ground point, at fixed orientation and adjusted distance.
* **S** : moves and orients camera to the start view
* **T** : moves and orients camera to top view (high altitude and pointing toward the center of the city)

The camera controller has been merged into itowns ([PR](https://github.com/iTowns/itowns/pull/454)) and is now PlanarControls. It features an animation of camera movement and orientation (called "travel" in the code) which we use to orient the camera with a document (document **oriented view**).

### Document

* Basic support for **billboard** document : plane geometry with image as texture, oriented to face the camera (billboard behavior).
* Ability to access document metadata by clicking on the billboard.
* Orient the view when clicking on billboard.
* Document properties : source image, name, date, metada (short text), oriented view position, oriented view quaternion, billboard position
* All documents are loaded from a csv file (docs.csv) and can be accessed using the **Document Browser** window.

### Temporal

* Basic slider + input field to select a date
* Ability to navigate between key dates (arrow buttons)
* When we enter a document "oriented view", the date is updated to match the document's date
* Key dates correspond to a temporal version of the 3d models for the "Îlot du Lac"

### Guided Tour

* A Guided Tour is a succession of Steps (document + text) that the user can follow
* Each step triggers the oriented view of its document, and opens this doc in the doc browser
* Ability to navigate between steps of a tour (previous, next) and to start/exit a tour
* Support for multiple guided tours, all loaded from a csv file (visite.csv)

### Others

* MiniMap : city (terrain only) viewed from a top view, with an indicator showing the position of the camera
* Compass : a compass image that rotates according to the camera orientation
* Help, About : windows with text and links

### GUI

* Multiple windows (document browser, guided tour, temporal, minimap, help, about)
* Each window can be open / closed by clicking on its button
* The display is weakly responsive : best used with 16/9 or 16/10 resolution, and width between 1400px and 1900px. Using browser zoom (ctrl + / ctrl -) can help adjusting static elements (text and button size).
