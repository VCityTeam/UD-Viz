# @ud-viz/browser

[![NPM package version](https://badgen.net/npm/v/@ud-viz/browser)](https://npmjs.com/package/@ud-viz/browser)

[@ud-viz/browser](https://npmjs.com/package/@ud-viz/browser) is a npm package based on [iTowns](https://github.com/itowns/itowns) allowing to visualize, analyze and interact with urban data. It also depends on [@ud-viz/core](https://npmjs.com/package/@ud-viz/core) package.

- [@ud-viz/browser](#ud-vizbrowser)
    - [Directory Hierarchy](#directory-hierarchy)
  - [Getting started](#getting-started)
  - [Developers](#developers)
    - [Pre-requisites](#pre-requisites)
    - [Npm scripts](#npm-scripts)
    - [Debugging](#debugging)

### Directory Hierarchy

```
UD-Viz/packages/browser
├── bin                  # Global NodeJS development
├── examples             # Examples of the package (html files importing bundle)
├── src                  # JS, CSS files composing the package
|    ├── AllWidget                  # UI template for ud-viz demo using widgets
|    ├── Component                  # Template component used to compose applications
|         ├── AssetManager                        # Manage asset loading
|         ├── ExternalGame                        # Browser-side game engine
|         ├── Frame3D                             # Wrapper of 3D view
|         ├── Itowns                              # iTowns framework overlay
|         ├── Widget                              # UI to interact with data
|         ├── Component.js                        # API of Component module
|         ├── FileUtil.js                         # Utils to manipulate files
|         ├── HTMLUtil.js                         # Utils to manipulate html
|         ├── InputManager.js                     # Manage user inputs
|         ├── RequestAnimationFrameProcess.js     # Used to launch an asynchronous process
|         ├── SocketIOWrapper.js                  # Manage a websocket communication
|         ├── THREEUtil.js                        # THREE framework overlay
|    ├── SinglePlayerGamePlanar     # Single Game template for ud-viz using game engine
|    ├── index.js                   # API description (webpack entry point)
├── webpackConfig        # Configs of bundles' creation
├── package.json         # Global npm project description
├── Readme.md            # It's a me, Mario!
```

> See [repo](https://github.com/VCityTeam/UD-Viz/blob/master/packages/browser)

## Getting started

See [here](../../Readme.md#getting-started).

## Developers

### Pre-requisites

See [here](../../Readme.md#pre-requisites).

### Npm scripts

| Script                | Description                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`       | Create a [webpack](https://webpack.js.org/) bundle in [production](./webpackConfig/webpack.config.prod.js) mode. See [webpack.config.js](./webpackConfig/webpack.config.js)   |
| `npm run build-debug` | Create a [webpack](https://webpack.js.org/) bundle in [developpement](./webpackConfig/webpack.config.dev.js) mode. See [webpack.config.js](./webpackConfig/webpack.config.js) |
| `npm run test`        | Run browser scripts and examples html. Uses [this test script](./bin/test.js)                                                                                                 |
| `npm run debug`       | Launch a watcher for debugging. See [here](#debugging) for more information                                                                                                   |

> See [repo](https://github.com/VCityTeam/UD-Viz/blob/master/packages/browser)


### Debugging

For debugging run:

```bash
npm run debug
```

It run a watched routine [debug.js](./bin/debug.js) with [nodemon](https://www.npmjs.com/package/nodemon):

- Run a `npm run build-debug`
- Can run `npm run test` (not by default).
