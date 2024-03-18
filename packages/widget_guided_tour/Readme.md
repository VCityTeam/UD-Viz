# @ud-viz/widget_guided_tour

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_guided_tour)](https://npmjs.com/package/@ud-viz/widget_guided_tour)

The `@ud-viz/widget_guided_tour` package provides a guided tour widget for iTowns applications, allowing users to navigate through predefined steps with associated media and camera positions.

#### Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_guided_tour
```

#### Usage

**Features**:

- GuidedTour Class: Provides functionality to create and navigate through a guided tour with predefined steps.
- Step Configuration: Define steps with associated layers, media, and camera positions.
- Media Support: Display text, images, videos, and audio as part of the guided tour.


**Implementation**:

```js
import * as itowns from 'itowns';
import { GuidedTour } from '@ud-viz/widget_guided_tour';

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

// Define the configuration of the guided tour
const tourConfig = {
  name: 'Example Tour',
  description: 'This is an example of a guided tour',
  startIndex: 0,
  endIndex: 1,
  steps: [
    {
      previous: 0,
      next: 1,
      layers: ['layer_1', 'layer_2'],
      media: [],
      position: { x: 10, y: 20, z: 30 },
      rotation: { x: 0.5, y: 0, z: 0.24, w: 0 },
    },
    {
      previous: 0,
      next: 1,
      layers: ['layer_3'],
      media: ['media_1', 'media_2'],
    },
  ],
};

// Define media configuration
const mediaConfig = [
  { id: 'media_1', type: 'image', value: 'image_url_1.jpg' },
  { id: 'media_2', type: 'text', value: 'Text content for media 2' },
];

// Initialize the guided tour widget
const guidedTour = new GuidedTour(view, tourConfig, mediaConfig);

// Add the guided tour widget to a parent element
document.getElementById('parentElementId').appendChild(guidedTour.domElement);
```

> You can see an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/widget_guided_tour.html)


#### API

##### `GuidedTour`

The `GuidedTour` class provides functionality to create and navigate through a guided tour with predefined steps.


#### Configuration

The `tourConfig` object should have the following structure:

```javascript
{
  name: 'Example Tour',
  description: 'This is an example of a guided tour',
  startIndex: 0,
  endIndex: 1,
  steps: [
    {
      previous: 0,
      next: 1,
      layers: ['layer_1', 'layer_2'],
      media: [],
      position: { x: 10, y: 20, z: 30 },
      rotation: { x: 0.5, y: 0, z: 0.24, w: 0 },
    },
    {
      previous: 0,
      next: 1,
      layers: ['layer_3'],
      media: ['media_1', 'media_2'],
    },
  ],
}
```

The `mediaConfig` array should contain objects with the following structure:

```javascript
[
  { id: 'media_1', type: 'image', value: 'image_url_1.jpg' },
  { id: 'media_2', type: 'text', value: 'Text content for media 2' },
]
```

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_guided_tour/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_guided_tour` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).
