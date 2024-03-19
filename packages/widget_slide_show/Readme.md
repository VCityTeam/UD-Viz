# @ud-viz/widget_slide_show

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_slide_show)](https://npmjs.com/package/@ud-viz/widget_slide_show)

The `@ud-viz/widget_slide_show` package provides a widget for creating and managing slideshows with textures and videos in an iTowns PlanarView.

## Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_slide_show
```

## Usage

**Features**:

- Slideshow Creation: Create slideshows with textures and videos.
- Slide Control: Navigate through slides using keyboard shortcuts.
- Looping: Enable looping to automatically cycle through slides at a specified duration.
- Extent Matching: Match the extent of the slideshow to the current view.

**Implementation**:

```javascript
import * as itowns from 'itowns';
import { SlideShow } from '@ud-viz/widget_slide_show';

// Create extent
const extent = new itowns.Extent(
... // name,
... // west),
... // east),
... // south),
... // north)
);

// Create an iTowns PlanarView
const view = new itowns.PlanarView(document.getElementById('viewerDiv'), extent);

// Initialize the SlideShow widget
const slideShow = new SlideShow(view, {
  slides: [
    {
      name: "diapo1",
      folder: "./assets/img/slide",
      diapositives: ["1.jpeg", "2.jpeg", "3.jpeg"]
    },
    {
      name: "diapo2",
      folder: "./assets/img/slide",
      diapositives: ["11.jpeg", "12.jpeg", "13.jpeg"]
    }
  ],
  textureRotation: 0,
  durationLoopInSec: 10
}, extent);

// Add the SlideShow widget to a parent element
document.getElementById('parentElementId').appendChild(slideShow.domElement);
```

> You can see implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/widget_slide_show.html)

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_slide_show/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_slide_show` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).