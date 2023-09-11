# Workspace Module

The Workspace Module is an extension of the SPARQL Module that adds functionality to query and visualize Workspace, and CityGML Versioning data stored in an RDF Triple-store from a UD-Viz interface.

See the [SPARQL module](../SPARQL/) for more documentation on generic SPARQL functions.

## Workspace functionalities
This module extends the functionality of the [SPARQL module](../SPARQL/) with the ability to update the displayed 3D model by clicking on **Version** and **VersionTransition**. These nodes are displayed in a D3 graph created from Workspace and Versioning graph data from a SPARQL backend service.

If a **VersionTransition** is selected and highlight changes between the related versions of the 3D city model will be highlighted.

## Data requirements
Note that for this functionality to work RDF data in the SPARQL endpoint must be conformant to the ontologies proposed here:
- [CityGML 3.0](https://dataset-dl.liris.cnrs.fr/rdf-owl-urban-data-ontologies/Ontologies/CityGML/3.0/)
- [CityGML 3.0 Workspace ADE](https://dataset-dl.liris.cnrs.fr/rdf-owl-urban-data-ontologies/Ontologies/Workspace/3.0/)

Additionally, the 3DTiles conforming to the `3DTILES_temporal` extension can be used to visualize the 3D model(s) supported by the [Temporal](../../Temporal/Temporal.js) module.
If the data in the batch table extension of the 3DTileset is interoperable with the data stored in the RDF triple-store these data can be used together to visualize scenarios of urban evolution.
For an example of how to the SPARQL Widget extension with the [Temporal](../../Temporal/Temporal.js) module, see the [Workspace Widget example](../../../../../../examples/widget_workspace.html)

## Setup
To configure the SPARQL workspace module extension
- A [SPARQL Endpoint Response Provider](../SPARQL/Service/SparqlEndpointResponseProvider.js)

## Usage
Clicking on a **Version** or **VersionTransition** will adjust the 3D scene to display the appropriate 3D city model.
