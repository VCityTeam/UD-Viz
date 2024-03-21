# @ud-viz/game_browser

[![NPM package version](https://badgen.net/npm/v/@ud-viz/game_browser)](https://npmjs.com/package/@ud-viz/game_browser)

## Context

`@ud-viz/game_browser` is a library interpretable in a browser environment based on itowns. Before to start you should read [`@ud-viz/game_shared`](../game_shared/Readme.md).

There is two `Context` in @ud-viz/game_xxx, one is in `@ud-viz/game_shared` let's call it GameContext and the other is in `@ud-viz/game_browser` let's call it ExternalContext.

Here is a diagram giving an overview of how works both Context together

```mermaid
sequenceDiagram
  actor user
  user->>ExternalContext: input
  ExternalContext->>GameContext: Command
  Note right of GameContext: tick Game Object3D
  GameContext->>ExternalContext: State/Diff
  Note left of ExternalContext: tick External Object3D
  ExternalContext->>user: ouput graphic and audio
```

##  Overview

There is two type of `@ud-viz/game_browser` process, one can be running exclusively in the browser `SinglePlanarProcess` (GameContext and ExternalContext are in the same process), whereas in the other one `MultiPlanarProcess` GameContext is running on a backend with [@ud-viz/game_node](../game_node/Readme.md) and ExternalContext is running in the browser (communication is made with [socket.io](https://socket.io/)).

## Installation

- You can install @ud-viz/game_browser via npm:

```bash
npm install @ud-viz/game_browser
```
## Usage

### Example

- ### `SinglePlanarProcess`

```js
import { SinglePlanarProcess } from '@ud-viz/game_browser';
import { Object3D } from '@ud-viz/game_shared';
import { Planar } from '@ud-viz/frame3d';
import * as itowns from 'itowns';

const crs = 'EPSG:3857';

const extent = new itowns.Extent(crs, 1837860, 1851647, 5169347, 5180575);
const process = new SinglePlanarProcess(new Object3D({}), new Planar(extent));
process.start();
```

> You can find an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/game_zeppelin.html)

- ### `MultiPlanarProcess`

```js
import { MultiPlanarProcess, SocketIOWrapper } from '@ud-viz/game_browser';
import * as itowns from 'itowns';

const crs = 'EPSG:3857';

const extent = new itowns.Extent(crs, 1837860, 1851647, 5169347, 5180575);
const process = new MultiPlanarProcess(new SocketIOWrapper(), extent);
process.start();
```

> You can find an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/game_note.html) working with [this backend](https://github.com/VCityTeam/UD-Viz/blob/master/bin/backEnd.js)


## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/game_browser/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/game_browser` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).