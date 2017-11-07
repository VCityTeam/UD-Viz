* Within UDV-Core/src/Modules/Temporal/Temporal.js
  - Change the usage of the Date data type for Moment
  - Break any connection (logical or functional link) with the Vilo3D example by removing the usage of the following variables
    * this.buildingDates
    * this.useBuildings
    * this.buildingVersions
    * this.syncBuildingVersionToCurrentDate()
