# @ud-viz/visualizer

[![NPM package version](https://badgen.net/npm/v/@ud-viz/visualizer)](https://npmjs.com/package/@ud-viz/visualizer)

`@ud-viz/visualizer` is a base of `@ud-viz` application. It encapsulates the functionality to visualize and interact with 3D data in a web environment. That creates a visualization for 3D Tiles data using iTowns and Three.js libraries.
Based on the content of the file, it seems like the package `@ud-viz/visualizer` is a module designed for handling camera setups, especially in 3D visualizations using iTowns and Three.js. Here's a draft of the Readme for the package:

## Features

- **Camera Defaults**: Quickly set up default camera positions for iTowns `PlanarView` scenes.
- **Orbit Controls**: Integrates Three.js's `OrbitControls` for intuitive 3D navigation.
- **Local Storage Integration**: Automatically stores and retrieves camera positions and controls' targets in local storage to provide persistence across sessions.
- **Event Integration**: Listens for tile loading events to adjust the camera view according to the content being displayed.
  
## Installation

You can install `@ud-viz/visualizer` via npm:

```bash
npm install @ud-viz/visualizer
```

## Usage

### Camera Setup

To set up the default camera settings in an iTowns view with orbit controls, you can use the `setUpCameraDefaults` function:

```javascript
import { setUpCameraDefaults } from '@ud-viz/visualizer';
import { PlanarView } from 'itowns';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Assume itownsView, orbitControls, and layers are already initialized
setUpCameraDefaults(itownsView, orbitControls, layers, {
  default: {
    position: { x: 100, y: 200, z: 300 },
  },
});
```

This function sets the camera position either from local storage or from the provided defaults in the `camOptions`.

> You can see an implementation [here](https://github.com/VCityTeam/UD-Viz/tree/master/examples/visualizer.html)

### API

#### `setUpCameraDefaults(itownsView, orbitControls, layers, camOptions)`

Sets up the camera position and controls based on local storage or default options.

- **`itownsView`**: The iTowns `PlanarView` object.
- **`orbitControls`**: Three.js `OrbitControls` for controlling camera movements.
- **`layers`**: Array of iTowns layers in the scene.
- **`camOptions`** (optional): An object containing default camera settings.
  - `default`: Default camera settings.
    - `position`: The default camera position (x, y, z).

### Events

The package listens for tile content events to adjust camera settings automatically when new data is loaded into the view.

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/visualizer/)


## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/visualizer` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).