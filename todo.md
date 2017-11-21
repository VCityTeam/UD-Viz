* DocumentHandler's initialize(docDataFromFile) function explictely have to
  know the path to Vilo3d files. Additionnaly examples/Demo.js passes
  to the udvcore.DocumentsHandler() constructor a path to the Vilo3D/docs.csv 
  file. Remove such dependencies from the Demo by having an independent set
  of Document files (for the test and demos) hosted within e.g. the
    src/Modules/Document/Data sub-directory.

* Remove Examples/ sub-directory ?

* Within UDV-Core/src/Modules/Temporal/Temporal.js
  - Change the usage of the Date data type for Moment
  - Break any connection (logical or functional link) with the Vilo3D example by removing the usage of the following variables
    * this.buildingDates
    * this.useBuildings
    * this.buildingVersions
    * this.syncBuildingVersionToCurrentDate()
