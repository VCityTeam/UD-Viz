# @ud-viz/widget_3d_tiles

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_3d_tiles)](https://npmjs.com/package/@ud-viz/widget_3d_tiles)

The `@ud-viz/widget_3d_tiles` package provides a customizable widget for interacting with 3D Tiles layers in web applications built with iTowns.

#### Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_3d_tiles
```

#### Usage

**Features**:

- Add and Remove 3D Tiles Layers
- Custom Styling
- Layer Visibility Control
- Display Feature Information

**Implementation**:

```javascript
import { C3DTiles } from '@ud-viz/widget_3d_tiles';
import * as itowns from 'itowns';

const extent = new itowns.Extent(
... // name,
... // west),
... // east),
... // south),
... // north)
);

// Create an iTowns view
const view = new itowns.PlanarView(document.getElementById('viewerDiv'), extent);

// Initialize the 3D Tiles widget
const tilesWidget = new C3DTiles(view, {
  // options
});

// Add the widget to a parent element
document.getElementById('parentElementId').appendChild(tilesWidget.domElement);
```

> You can see an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/widget_3d_tiles.html)

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_3d_tiles/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_3d_tiles` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).