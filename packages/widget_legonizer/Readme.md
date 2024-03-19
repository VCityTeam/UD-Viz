# @ud-viz/widget_legonizer

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_legonizer)](https://npmjs.com/package/@ud-viz/widget_legonizer)

`@ud-viz/widget_legonizer` is a tool designed to generate Lego mockups based on user-defined coordinates and scales. It offers functionality for creating and manipulating Lego models within a 3D view.

## Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_legonizer
```

## Usage

**Features**:

- Coordinates Input: Allows users to specify the position, rotation, and scale of the Lego model.
- Scale Parameters: Provides options to adjust the accuracy of the heightmap and specify the number of Lego plates to be used in the mockup.
    - Ratio: Scale of the mockup (WIP)
    - Count Lego: Size of the lego model required in plate, based on 32x32 stud baseplate.
- Area Selection: Enables users to define a rectangular area in the 3D view for generating Lego mockups.
- Generate Mockup: Generates a Lego mockup based on the selected area and parameters provided by the user.
- Visualize Mockup: Provides a visual representation of the generated Lego mockup.

**Implementation**:

To use the Legonizer, follow these steps:

1. Import the required modules:

```javascript
import { PlanarView } from 'itowns'
import { Legonizer } from '@ud-viz/legonizer'
```

2. Initialize the Legonizer with a PlanarView:

```javascript
const view = new PlanarView(viewerDiv, extent);
const legonizer = new Legonizer(view);
```

> You can find implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/widget_legonizer.html)

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_legonizer/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_legonizer` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).