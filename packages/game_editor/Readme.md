# @ud-viz/game_editor

[![NPM package version](https://badgen.net/npm/v/@ud-viz/game_editor)](https://npmjs.com/package/@ud-viz/game_editor)

## Overview

`@ud-viz/game_editor` provides tools for editing and manipulating 3D objects in a geospatial web-based environment. 

## Installation

You can install `@ud-viz/game_editor` via npm:

```bash
npm install @ud-viz/game_editor
```

## Usage

### Import modules

```js
import * as gameEditor from "@ud-viz/game_editor"
```

### Editor Class 

It's the main class of the package. Used to create an interactive editor 
to set up game objects components.

```js
const gameEditor = new gameEditor.Editor(
    frame3DPlanar,
    assetsManager,
    options
    )
```

- `frame3DPlanar`: type of [`Planar`](https://github.com/VCityTeam/UD-Viz/blob/master/packages/frame3d/src/Planar.js) instance of `@ud-viz/frame3d`. 
- `assetsManager`: type of [`AssetsManager`](https://github.com/VCityTeam/UD-Viz/blob/master/packages/game_browser/src/AssetManager.js) instance of `@ud-viz/game_browser`.
- `options`: Javascript Object, you can see the options you can set above constructor of [Editor](https://github.com/VCityTeam/UD-Viz/blob/master/packages/game_editor/src/index.js#L86)

> You can find an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/game_editor.html)

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/game_editor/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/game_editor` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).