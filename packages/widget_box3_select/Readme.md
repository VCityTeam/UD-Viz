# @ud-viz/widget_box3_select

[![NPM package version](https://badgen.net/npm/v/@ud-viz/widget_box3_select)](https://npmjs.com/package/@ud-viz/widget_box3_select)

The `@ud-viz/widget_box3_select` package provides a utility to select a box3 in an iTowns view.

#### Installation

You can install the package via npm:

```bash
npm install @ud-viz/widget_box3_select
```

#### Usage

**Implementation**:

```javascript
import * as itowns from 'itowns';
import { Box3Selector } from '@ud-viz/widget_box3_select';

const box3Select = new Box3Select(
  new itowns.View(crs, document.createElement('div'))
);
```

> Box3Selector class extends HTMLElement.

> You can see an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/widget_box3_select.html)

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/widget_3d_tiles/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/widget_3d_tiles` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).
