# @ud-viz/widget_workspace

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_workspace)](https://npmjs.com/package/@ud-viz/widget_workspace)

The `@ud-viz/widget_workspace` package provides a versatile workspace widget for managing and organizing various visualization components within a web application.

# Workspace Module

The Workspace Module is an extension of the SPARQL Module that adds functionality to query and visualize Workspace, and CityGML Versioning data stored in an RDF Triple-store from a UD-Viz interface.

See the [SPARQL module](../widget_sparql/Readme.md) for more documentation on generic SPARQL functions.

Also check out the [WorkspaceWidget example](../../examples/widget_workspace.html) to see how this module can be implemented.

## Workspace functionalities
This module extends the functionality of the [SPARQL module](../widget_sparql/Readme.md) with the ability to search for nodes corresponding to **Versions**, **VersionTransitions**, and **Scenarios** based on different criteria.
The following functions are proposed (please read the [Workspace widget JSDOC](./src/index.js) comments for more information):
- getVersionScenarioByIndex
- getVersionTransitionScenarioByIndex
- getVersionScenarioByUri
- getVersionTransitionScenarioByUri
- getScenarioLayerNameByIndex
- getScenarioLayerNameByUri
- getBitemporalTimestampsByIndex

### D3 event customization
The intended use of the workspace module is to allow an application to update the 3D scene using information from a workspace dataset.

For example, the displayed 3D model can be updated by clicking on **Version** and **VersionTransition** nodes in the D3 graph. These nodes are created from Workspace and Versioning graph data from a SPARQL backend service.
If a **VersionTransition** is selected and highlight changes between the related versions of the 3D city model will be highlighted using the Temporal module (see the following section for more information on how this data is structured).

![an example of an application updating the 3D scene using information from a workspace graph](./img/workspace-demo-example.gif)

Check out the [WorkspaceWidget example](../../examples/widget_workspace.html) to see how these events can be customized.

## Data requirements
Note that for this functionality to work RDF data in the SPARQL endpoint must be conformant to the ontologies proposed here:
- [CityGML 3.0](https://dataset-dl.liris.cnrs.fr/rdf-owl-urban-data-ontologies/Ontologies/CityGML/3.0/)
- [CityGML 3.0 Workspace ADE](https://dataset-dl.liris.cnrs.fr/rdf-owl-urban-data-ontologies/Ontologies/Workspace/3.0/)

Additionally, the 3DTiles conforming to the `3DTILES_temporal` extension can be used to visualize the 3D model(s) supported by the [Temporal](../extensions_3d_tiles_temporal/Readme.md) module.
If the data in the batch table extension of the 3DTileset is interoperable with the data stored in the RDF triple-store these data can be used together to visualize scenarios of urban evolution.
For an example of how to the SPARQL Widget extension with the [Temporal](../extensions_3d_tiles_temporal/Readme.md) module, see the [Workspace Widget example](../../examples/widget_workspace.html)

## Setup
To configure the SPARQL workspace module extension
- A [SPARQL Endpoint Response Provider](../widget_sparql/src/service/SparqlEndpointResponseProvider.js)

## Usage
Clicking on a **Version** or **VersionTransition** will adjust the 3D scene to display the appropriate 3D city model.

## Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_workspace
```

## Usage

**Features**:

- Customizable Layouts: Arrange visualization components in flexible layouts.
- Component Management: Add, remove, and reposition components within the workspace.
- Interactivity: Configure components to respond to user interactions.
- Persistence: Save and load workspace configurations.

**Implementation**:

```javascript
import { Workspace } from '@ud-viz/widget_workspace';

// Initialize the Workspace widget
const workspace = new Workspace();

// Add visualization components to the workspace
workspace.addComponent(component1);
workspace.addComponent(component2);

// Customize the layout of components
workspace.setLayout('grid');

// Save the current workspace configuration
const savedConfig = workspace.saveConfiguration();

// Load a saved workspace configuration
workspace.loadConfiguration(savedConfig);

// Add the Workspace widget to a parent element
document.getElementById('parentElementId').appendChild(workspace.domElement);
```

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_workspace/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_workspace` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).
