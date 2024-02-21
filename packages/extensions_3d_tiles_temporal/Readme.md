# @ud-viz/extensions_3d_tiles_temporal

[![NPM package version](https://badgen.net/npm/v/@ud-viz/extensions_3d_tiles_temporal)](https://npmjs.com/package/@ud-viz/extensions_3d_tiles_temporal)

## Overview

`@ud-viz/extensions_3d_tiles_temporal` is your gateway to managing the temporal evolution of 3D Tiles within Itowns.

## Model

Explore the jsonSchemas of the extensions [here](./src/model/jsonSchemas/) and discover the associated JavaScript classes [here](./src/model/).

Transactions are stored within `C3DTilesLayer` in `tileset.extensions`, and record all type of transaction between `C3DTFeature` which allow to assume `C3DTFeature` evolution over time.

## Temporal3DTilesLayerWrapper

This class seamlessly applies an Itowns `Style` to a `C3DTilesLayer`, depicting the progression between states and enhancing understanding of temporal data transitions.

![Visualization of Transactions](./img/visu-transactions.png)

> Note: "State i" and "State i+1" represent actual 3D Tiles acquired at specific dates. "Transaction first half" and "Transaction second half" denote intermediary visualization states, enhancing comprehension despite not corresponding to real dates.

Witness the difference between two dates in the example below.

![Visualization 2013-2014](./img/visu-2013-2014.png)


### Installation

You can install `@ud-viz/extensions_3d_tiles_temporal` via npm:

```bash
npm install @ud-viz/extensions_3d_tiles_temporal
```

### Usage


#### Example

```js
import * as itowns from 'itowns';
import {
  C3DTTemporalBatchTable,
  C3DTTemporalBoundingVolume,
  C3DTTemporalTileset,
  ID,
  Temporal3DTilesLayerWrapper,
} from '@ud-viz/extensions_3d_tiles_temporal';

// Create your itowns.C3DTExtensions
const extensions = new itowns.C3DTExtensions();
extensions.registerExtension(ID, {
  [itowns.C3DTilesTypes.batchtable]: C3DTTemporalBatchTable,
  [itowns.C3DTilesTypes.boundingVolume]: C3DTTemporalBoundingVolume,
  [itowns.C3DTilesTypes.tileset]: C3DTTemporalTileset,
});

// Create your itowns.C3DTilesLayer temporal
const c3DTilesLayer = new itowns.C3DTilesLayer(
  'layer_id',
  {
    source: new itowns.C3DTilesSource({
      url: 'url/to/your/3d/tiles/temporal/tileset.json',
    }),
    registeredExtensions: extensions,
  },
  view // your itowns.View
);

// Add your layer to the view
itowns.View.prototype.addLayer.call(view, c3DTilesLayer);

// Create your Temporal3DTilesLayerWrapper
const temporal3DTilesLayerWrapper = new Temporal3DTilesLayerWrapper(
  c3DTilesLayer
);

// Select the date you want to visualize
temporal3DTilesLayerWrapper.styleDate = date; // note that if the date does not exist in 3DTiles, it will select the closest one
view.notifyChange(); // refresh view
```

> You can also see an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/extensions_3d_tiles_temporal.html)

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/extensions_3d_tiles_temporal/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/extensions_3d_tiles_temporal` is developed and maintained by [VCityTeam](https://github.com/VCityTeam).
