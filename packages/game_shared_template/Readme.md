# @ud-viz/game_shared_template

[![NPM package version](https://badgen.net/npm/v/@ud-viz/game_shared_template)](https://npmjs.com/package/@ud-viz/game_shared_template)

## Overview 

`@ud-viz/game_shared_template` provides a collection of script base on [@ud-viz/game_shared](https://github.com/VCityTeam/UD-Viz/blob/master/packages/game_shared/Readme.md) reusable for building interactive and games. It includes functionality for managing maps, handling drag and drop operations for avatars, and managing native commands for object movement and rotation.

## Installation

You can install `@ud-viz/game_shared_template` via npm:

```bash
npm install @ud-viz/game_shared_template
```
## Usage 

### Example

```js
const { AbstractMap,  DragAndDropAvatar, NativeCommandManager } = require('@ud-viz/game_shared_template');

// Example usage of AbstractMap
class MyMap extends AbstractMap {
  // Implement custom methods and functionality
}

// Example usage of DragAndDropAvatar
const avatarManager = new DragAndDropAvatar();

// Example usage of NativeCommandManager
const commandManager = new NativeCommandManager();
```
- [`AbstractMap`](https://github.com/VCityTeam/UD-Viz/blob/master/packages/game_shared_template/src/AbstractMap.js): See two classes extended with different focuses: one for frontend [`Map`](https://github.com/VCityTeam/UD-Viz/blob/master/packages/game_browser_template/src/Map.js) (`@ud-viz/game_browser_template`), and one for backend [`Map`](https://github.com/VCityTeam/UD-Viz/blob/master/packages/game_node_template/src/Map.js) (`@ud-viz/game_node_template`).

- [`DragAndDropAvatar`](https://github.com/VCityTeam/UD-Viz/blob/master/packages/game_shared_template/src/DragAndDropAvatar.js): You can find an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/game_drag_and_drop_avatar.html).

- [`NativeCommandManager`](https://github.com/VCityTeam/UD-Viz/blob/master/packages/game_shared_template/src/NativeCommandManager.js): You can find an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/game_zeppelin.html).

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/game_shared_template/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/game_shared_template` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).