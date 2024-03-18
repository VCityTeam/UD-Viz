# @ud-viz/widget_layer_choice

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_layer_choice)](https://npmjs.com/package/@ud-viz/widget_layer_choice)

`@ud-viz/widget_layer_choice` package provides layer choice widget for iTowns applications. Interactive for displaying differents geospatials layers/focus on 3DTiles layers.

#### Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_layer_choice
```

#### Usage

**Features**:

- Show/Hide layers: Provides functionnality with button or slider to fix the opcacity of layers between 0 & 1.
- Focus on 3dTiles: If layers istype `C3DTilesLayer` a focus button is added to provides a function for focus the camera 3D onto the 3Dtiles. 

**Implementation**:

```js
import * as itowns from 'itowns';
import { LayerChoice } from '@ud-viz/widget_layer_choice';

// Create extent
const extent = new itowns.Extent(
... // name,
... // west),
... // east),
... // south),
... // north)
);

// Create an iTowns view
const view = new itowns.PlanarView(document.getElementById('viewerDiv'), extent);

... // add layers

// Layer Choice Module
const layerChoice = new LayerChoice(view);

document.getElementById('parentElementId').appendChild(layerChoice.domElement);
```

> You can find implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/widget_layer_choice.html)

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_layer_choice/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_layer_choice` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).
