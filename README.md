# UDV : Urban Data Viewer

UDV is a JavaScript client based on [iTowns](https://github.com/itowns/itowns) allowing to visualize, analyse and interact with urban data.
You can find install notes [here](https://github.com/MEPP-team/UDV/blob/master/install.md).

Server-side tools can be found [here](https://github.com/MEPP-team/UDV-server).

## Demo
Online demos :
 - [UDV](http://rict.liris.cnrs.fr/UDVDemo-2/UDV/UDV-Core/)
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

* Display of documents in a 3D representation of the city, in superposition
* Filtered research (research by keyword, attribute and/or temporal research)
* All documents are loaded from an external data server and can be accessed using the **Document Inspector** window.

![](./doc/pictures/module_pres/document.png)

This module has several extensions that add functionalities :

#### Contribute

* Possibility to create a new document
* Possibility to edit and delete existing documents

#### Validation

This extensions works with the *Authentication* module :

* A document has information about the user who posted it.
* Users have different roles :
  * A *contributor* is a regular user
  * A *moderator* has validation rights
  * An *administrator* has all rights
* You must be logged in to contribute. A contributor must have its submissions validated by a moderator or an administrator to be published.

#### Comments

Requires the *Authentication* module :

* Adds the possibility to comment a document (must be logged in)

### Authentication

Adds user management :

* Possibility to create an account
* Possibility to log in

![](./doc/pictures/module_pres/authentication.png)

### Temporal

* Basic slider + input field to select a date
* Ability to navigate between key dates (arrow buttons)
* When we enter a document "oriented view", the date is updated to match the document's date
* Key dates correspond to a temporal version of the 3d models for the "Îlot du Lac"

### City Objects

* Selection of a city object, view its details
* Filter city objects from their attributes

![](./doc/pictures/module_pres/city_object.png)

### Links

The link module serves as an extension for both *Document* and *City object* modules.

* Adds the possibility to create link between a document and a city object (many to many)
* Possibility to visualize the city objects linked to a document
* Possibility to visualize the documents linked to a city object

### Guided Tour

* A Guided Tour is a succession of Steps (document + text) that the user can follow
* Each step triggers the oriented view of its document, and opens this doc in the doc browser
* Ability to navigate between steps of a tour (previous, next) and to start/exit a tour
* Support for multiple guided tours, all loaded from a csv file (visite.csv)

### Others

* Help, About : windows with text and links
