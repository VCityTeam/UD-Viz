# Widgets desciptions
## Developers
 A web widget is a web page or web application that is embedded as an element of a host web page but which is substantially independent of the host page. In this contexte each widget should be independant and have his own html, css and js file to be integrate in a host page.  

```
 UD-Viz (repo)
 ├── src   
 |    |               
 |    └── Widgets                # A sub-directory gathering a set web web widgets (UI)  
 |         ├── Widget_1
 |         |    ├── css
 |         |    ├── doc
 |         |    ├── html
 |         |    └── js
 |         ├── Widget_2
 |         ├── ...
 |         └── Extensions 
```
## Current features

Each module adds new functionnalities to the application. You can find the code and the documentation (sometimes the documentation is directly in the code) by following the link under each module described below.

### Document

[Go to the module](https://github.com/VCityTeam/UD-Viz/tree/master/src/Widgets/Documents)

- Display of documents in a 3D representation of the city, in superposition
- Filtered research (research by keyword, attribute and/or temporal research)
- All documents are loaded from an external data server and can be accessed using the **Document Inspector** window.

![](https://github.com/VCityTeam/UD-Viz/blob/master/src/Widgets/Documents/Doc/Pictures/view.png)

This module has several extensions that add functionalities :

#### Contribute

[Go to the module](https://github.com/VCityTeam/UD-Viz/tree/master/src/Widgets/Extensions/Contribute)

- Possibility to create a new document
- Possibility to edit and delete existing documents

#### Validation

[Go to the module](https://github.com/VCityTeam/UD-Viz/tree/master/src/Widgets/Extensions/DocumentValidation)

This extensions works with the _Authentication_ module :

- A document has information about the user who posted it.
- Users have different roles :
  - A _contributor_ is a regular user
  - A _moderator_ has validation rights
  - An _administrator_ has all rights
- You must be logged in to contribute. A contributor must have its submissions validated by a moderator or an administrator to be published.

#### Comments

[Go to the module](https://github.com/VCityTeam/UD-Viz/tree/master/src/Widgets/Extensions/DocumentComments)

Requires the _Authentication_ module :

- Adds the possibility to comment a document (must be logged in)

### Authentication

[Go to the module](https://github.com/VCityTeam/UD-Viz/tree/master/src/Widgets/Extensions/Authentication)

Adds user management :

- Possibility to create an account
- Possibility to log in

### Temporal

[Go to the module](https://github.com/VCityTeam/UD-Viz/tree/master/src/Widgets/Temporal)

- Basic slider + input field to select a date
- Ability to navigate between key dates (arrow buttons)
- When we enter a document "oriented view", the date is updated to match the document's date
- Key dates correspond to a temporal version of the 3d models for the "Îlot du Lac"

### City Objects

[Go to the module](https://github.com/VCityTeam/UD-Viz/tree/master/src/Widgets/CityObjects)

- Selection of a city object, view its details
- Filter city objects from their attributes

### Links

[Go to the module](https://github.com/VCityTeam/UD-Viz/tree/master/src/Widgets/Links)

The link module serves as an extension for both _Document_ and _City object_ modules.

- Adds the possibility to create link between a document and a city object (many to many)
- Possibility to visualize the city objects linked to a document
- Possibility to visualize the documents linked to a city object

### Guided Tour

[Go to the module](https://github.com/VCityTeam/UD-Viz/tree/master/src/Widgets/GuidedTour)

- A Guided Tour is a succession of Steps (document + text) that the user can follow
- Each step triggers the oriented view of its document, and opens this doc in the doc browser
- Ability to navigate between steps of a tour (previous, next) and to start/exit a tour
- Support for multiple guided tours, all loaded from a csv file (visite.csv)

### Camera Controller

- **Left-click + drag** : User "grabs" the ground (cursor stays at the same spot on the ground) to translate camera on XY axis.
- **Right-click + drag** : camera rotation around the focus point (ground point at the center of the screen), clamped to avoid going under ground level.
- **Mousewheel** : smooth zoom toward the ground point under the mouse cursor, adjusted according to the ground distance (zoom is faster the further from the ground and cannot go through the ground).
- **Mousewheel click** (middle mouse button) : "Smart Zoom". Camera smoothly moves and rotates toward target ground point, at fixed orientation and adjusted distance.
- **S** : moves and orients camera to the start view
- **T** : moves and orients camera to top view (high altitude and pointing toward the center of the city)

The camera controller has been merged into itowns ([PR](https://github.com/iTowns/itowns/pull/454)) and is now PlanarControls. It features an animation of camera movement and orientation (called "travel" in the code) which we use to orient the camera with a document (document **oriented view**).

### Others

- Help, About : windows with text and links
