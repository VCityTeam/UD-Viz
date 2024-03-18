# @ud-viz/widget_extensions_3d_tiles_temporal

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_extensions_3d_tiles_temporal)](https://npmjs.com/package/@ud-viz/widget_extensions_3d_tiles_temporal)


The `@ud-viz/widget_extenstions_3d_tiles_temporal` package provides extensions for managing temporal aspects of 3D Tiles layers in iTowns, including features like selecting dates and displaying temporal data.

#### Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_extenstions_3d_tiles_temporal
```

#### Usage

**Features**:

- Date Selector: Allows users to select a C3DTilesLayer and choose a date from a dropdown menu, display visualization of temporal data associated with 3D Tiles layers.

**Implementation**:

```js
import * as itowns from 'itowns';
import { DateSelector } from '@ud-viz/widget_extenstions_3d_tiles_temporal';

// Create an iTowns view
const view = new itowns.PlanarView(document.getElementById('viewerDiv'), {
  ... // view configuration
});

// Initialize the DateSelector widget
const dateSelector = new DateSelector(view, options);

// Add the widget to a parent element
document.getElementById('parentElementId').appendChild(dateSelector.domElement);
```

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_extensions_3d_tiles_temporal/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_extensions_3d_tiles_temporal` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).