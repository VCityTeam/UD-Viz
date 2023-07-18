# Workspace Module

The Workspace Module is an extension of the SPARQL Module that adds functionality to query and visualize Workspace, and CityGML Versioning data stored in a Strabon Triple-store from a UD-Viz interface.

See the [SPARQL module](../SPARQL/) for more documentation on generic SPARQL functions

## Workspace functionalities
This module extends the functionality of the [SPARQL module](../SPARQL/) with the ability to update the displayed 3D model by clicking on **Version** and **VersionTransition**. These nodes are displayed in a D3 graph created from Workspace and Versioning graph data from a SPARQL backend service.

If a **VersionTransition** is selected  and highlight changes between the related versions of the 3D city model will be highlighted.

## Setup
To configure the SPARQL workspace module extension
- a 3DTiles tileset with the temporal extension
- [Temporal Provider](../../Temporal/ViewModel/TemporalProvider.js)
- A [SPARQL Endpoint Response Provider](../SPARQL/Service/SparqlEndpointResponseProvider.js)

For an example of how to the SPARQL Widget extension, see the [Workspace Widget example](https://github.com/VCityTeam/UD-Viz/blob/master/packages/browser/examples/WorkspaceWidget.html)

## Usage
Clicking on a **Version** or **VersionTransition** will adjust the 3D scene to display the appropriate 3D city model.
