# UDV Architecture

UDV is build of several modules (UDV-Core/Modules) and is based on iTowns (itself based on THREE.js) for the display of city geometry.

## Modules

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

## Asynchronous Initialization

Modules relying on an external data file are asynchronously initialized : the file loaders (ColladaLoader, CSVLoader) use callback functions to initialize objects once the loading is complete. Custom events are also used to initialize some modules after others.

For example in Vilo3D (main.js) :
 * we instanciate a Document Handler instance and a Guided Tour Controller instance.
 * The DocumentHandler constructor will begin to load the required csv file (loadDataFromFile() function with initialize() function as callback parameter).
 * When loading in complete, the initialize() function is called (callback).
 * At the end of the initialize() function, a custom event "docInit" is dispatched, signaling that Document Handler has finished initializing.
 * GuidedTourController has an event listener for this event : it will call loadDataFromFile() upon receiving the docInit event, and procede with its own initialization.
