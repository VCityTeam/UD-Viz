# @ud-viz/widget_planar_controls

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_planar_controls)](https://npmjs.com/package/@ud-viz/widget_planar_controls)

The `@ud-viz/widget_planar_controls` package provides a widget for controlling zoom factors in an iTowns PlanarView.

## Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_planar_controls
```
## Usage

**Features**:

- Zoom Control: Allows users to adjust the zoom in and zoom out factors for the iTowns PlanarView.

**Implementation**:

```javascript
import * as itowns from 'itowns';
import { PlanarControls } from '@ud-viz/widget_planar_controls';

// Create an iTowns PlanarView
const view = new itowns.PlanarView(document.getElementById('viewerDiv'), {
  ... // view configuration
});

// Initialize the PlanarControls widget
const planarControls = new PlanarControls(view, {... /*config*/});

// Add the PlanarControls widget to a parent element
document.getElementById('parentElementId').appendChild(planarControls.domElement);
```

**API**:

**`PlanarControls`**:

The `PlanarControls` class provides functionality to control the zoom factors in an iTowns PlanarView.

**Constructor**:

```javascript
new PlanarControls(view: itowns.PlanarView, options?: object)
```

- `view`: An iTowns `PlanarView` object representing the view of the iTowns canvas.
- `options` (optional): An object containing additional configuration options for the constructor.

**Configuration Options**:

- `position` (string, optional): Specifies the position of the widget in the view. Default value is `'top-right'`.

**Zoom Factors**:

- `zoomInFactor`: Specifies the zoom in factor. Adjusts the zoom speed when zooming in.
- `zoomOutFactor`: Specifies the zoom out factor. Adjusts the zoom speed when zooming out.

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_planar_controls/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_planar_controls` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).

