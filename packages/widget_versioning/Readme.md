# @ud-viz/widget_versioning

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_versioning)](https://npmjs.com/package/@ud-viz/widget_versioning)

The `@ud-viz/widget_versioning` package provides a versioning widget for visualizing and query multiple versioning of a graph within a web application.

# Versioning Module

The Versioning Module is an extension of the SPARQL Module that adds functionality to query and visualize multiple versions of graphs stored in an RDF Triple-store from a UD-Viz interface.

See the [SPARQL module](../widget_sparql/Readme.md) for more documentation on generic SPARQL functions.

## Versioning functionalities
This module extends the functionality of the [SPARQL module](../widget_sparql/Readme.md) with the ability to detext the similarities between various urban knowledge graphs. These nodes are displayed in a D3 graph created from Versioning graph data from a SPARQL backend service.

## Data requirements
The Versioning module requires a SPARQL endpoint that can handle versioned queries defined in the [ConVer-G repository](https://github.com/VCityTeam/ConVer-G).

## Setup
To configure the SPARQL versioning module extension
- A [SPARQL Endpoint Response Provider](../widget_sparql/src/service/SparqlEndpointResponseProvider.js)

## Usage

For an example of how to the Versioning Widget to a UD-Viz web application see the [VersioningWidget example](https://github.com/VCityTeam/UD-Viz/blob/master/examples/widget_versioning.html)

### User Interface

The Interface is composed of a **SPARQL Query** window containing a text box for composing queries to send to a [Versioning compatible SPARQL Endpoint](https://github.com/VCityTeam/ConVer-G).

The _Results Format_ dropdown uses the same options as the [SPARQL module](../widget_sparql/Readme.md) and also proposes the "versioning" additional option.

## Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_versioning
```

## Usage

**Features**:

- **Versioning Graph**: Display set of versioned graphs fetched from the [SPARQL versioned compatible endpoint](https://github.com/VCityTeam/ConVer-G).


## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_versioning/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_versioning` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).