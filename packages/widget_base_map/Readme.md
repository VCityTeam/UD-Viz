# @ud-viz/widget_base_map

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_base_map)](https://npmjs.com/package/@ud-viz/widget_base_map)

The `@ud-viz/widget_base_map` package provides a utility for managing multiple WMS sources used as iTowns ColorLayers for background maps in web applications.

#### Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_base_map
```

#### Usage

**Features**:

- Multiple Base Map Layers
- Customization
- Interactive

**Implementation**:

```javascript
import * as itowns from 'itowns';
import { BaseMap } from '@ud-viz/widget_base_map';

const extent = new itowns.Extent(
... // name,
... // west),
... // east),
... // south),
... // north)
);

// Create an iTowns view
const view = new itowns.PlanarView(document.getElementById('viewerDiv'), extent);


// Initialize the BaseMap widget
const baseMapWidget = new BaseMap(view, {/*options*/}, extent);

// Add the widget to a parent element
document.getElementById('parentElementId').appendChild(baseMapWidget.domElement);
```
> You can see an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/widget_base_map.html)

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_3d_tiles/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_3d_tiles` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).