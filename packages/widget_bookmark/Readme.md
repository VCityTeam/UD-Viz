# @ud-viz/widget_bookmark

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_bookmark)](https://npmjs.com/package/@ud-viz/widget_bookmark)


The `@ud-viz/widget_bookmark` package provides a utility for managing saves of camera position on an iTowns scene.

#### Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_bookmark
```

#### Usage

**Features**:

- Save camera position in a list
- Naming 
- Load camera position saved

**Implementation**:

```javascript
import * as itowns from 'itowns';
import { Bookmark } from '@ud-viz/widget_bookmark';

const extent = new itowns.Extent(
... // name,
... // west),
... // east),
... // south),
... // north)
);

// Create an iTowns view
const view = new itowns.PlanarView(document.getElementById('viewerDiv'), extent);


// Initialize the Bookmark widget
const bookmarkWidget = new Bookmark(view, {/*options*/});

// Add the widget to a parent element
document.getElementById('parentElementId').appendChild(bookmarkWidget.domElement);
```
> Bookmark class extends iTowns Widget.

> You can see an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/widget_bookmark.html)

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_3d_tiles/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_3d_tiles` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).