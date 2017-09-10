# UDV Architecture

UDV is build of several modules (UDV-Core/Modules) and is based on iTowns (itself based on THREE.js) for the display of city geometry.

UDV Modules are :
 * Documents : DocumentHandler class, Document class + related GUI elements
 * Guided Tour : GuidedTourController class, TourStep class + related GUI elements
 * Temporal : TemporalController class + related GUI elements
 * Other : minimap, help, about (basic functionalities with their GUI elements)
 
To include a module : 
 * add the js file to the index.html, no need to add html divs for the GUI. Each module handles its own GUI elements by adding a div to the html.
 * instanciate the required classes in your main js file.
 
 See examples here for Vilo3D : [index.html](https://github.com/MEPP-team/UDV/blob/master/Vilo3D/index.html) (include the js files) and [main.js](https://github.com/MEPP-team/UDV/blob/master/Vilo3D/Main.js) (instanciate the classes, at the end of the file).
 
These modules are mostly independant from each other, with the exception of Documents and Guided Tour : GuidedTourController requires a DocumentHandler instance.

TO DO : talk about asynchronous init
