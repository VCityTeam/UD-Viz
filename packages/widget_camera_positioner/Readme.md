# @ud-viz/widget_camera_positioner

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_camera_positioner)](https://npmjs.com/package/@ud-viz/widget_camera_positioner)


The `@ud-viz/widget_camera_positioner` package provides a utility for display a viewer of position / rotation of camera3D object.

#### Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_base_map
```

#### Usage

**Features**:

- Displayer camera position / rotation
- Set up camera postion / rotation

**Implementation**:

```js
import * as itowns from 'itowns';
import { CameraPositioner } from '@ud-viz/widget_camera_positioner';

const extent = new itowns.Extent(
... // name,
... // west),
... // east),
... // south),
... // north)
);

// Create an iTowns view
const view = new itowns.PlanarView(document.getElementById('viewerDiv'), extent);

// Initialize the Camera Positioner widget 
const camePosWidget = new CameraPositioner(view);

// Add the widget to a parent element
document.getElementById('parentElementId').appendChild(camePosWidget.domElement);
```

> You can see an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/widget_camera_positioner.html)


## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_camera_positioner/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_camera_positioner` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).