# @ud-viz/widget_legonizer

The Legonizer is a tool designed to generate Lego mockups based on user-defined coordinates and scales. It offers functionality for creating and manipulating Lego models within a 3D view.

## Installation

```bash
npm install @ud-viz/widget_legonizer
```

## Usage

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

> See example [here](https://github.com/VCityTeam/UD-Viz/blob/8cf982fd20ab61fc0a199c382753404b39ca1355/examples/widget_legonizer.html)

## Features

- **Coordinates Input**: Allows users to specify the position, rotation, and scale of the Lego model.
- **Scale Parameters**: Provides options to adjust the accuracy of the heightmap and specify the number of Lego plates to be used in the mockup.
    - **Ratio:** Scale of the mockup (WIP)
    - **Count Lego**: Size of the lego model required in plate, based on 32x32 stud baseplate.
- **Area Selection**: Enables users to define a rectangular area in the 3D view for generating Lego mockups.
- **Generate Mockup**: Generates a Lego mockup based on the selected area and parameters provided by the user.
- **Visualize Mockup**: Provides a visual representation of the generated Lego mockup.
