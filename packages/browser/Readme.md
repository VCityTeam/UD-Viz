# @ud-viz/browser

[![NPM package version](https://badgen.net/npm/v/@ud-viz/browser)](https://npmjs.com/package/@ud-viz/browser)

[@ud-viz/browser](https://npmjs.com/package/@ud-viz/browser) is a npm package based on [iTowns](https://github.com/itowns/itowns) for creating front-end web applications to visualize, analyze, and interact with geospatial 3D urban data. It also depends on [@ud-viz/shared](https://npmjs.com/package/@ud-viz/shared) package.

- [@ud-viz/browser](#ud-vizbrowser)
  - [Directory Hierarchy](#directory-hierarchy)
  - [Getting started](#getting-started)
  - [Developers](#developers)
    - [Npm scripts](#npm-scripts)
    - [Debugging](#debugging)
  - [How to use it in your demo?](#how-to-use-it-in-your-demo)
    - [With npm](#with-npm)
    - [From a release bundle](#from-a-release-bundle)

### Directory Hierarchy

```
UD-Viz/packages/browser
├── bin                                           # Global NodeJS development
├── examples                                      # Application Examples (html files importing the bundle)
├── src                                           # Package JS, CSS files
|    ├── AllWidget                                # UI template for ud-viz demo using widgets
|    ├── Component                                # Components used to compose applications
|    |    ├── AssetManager                        # Manage asset loading
|    |    ├── ExternalGame                        # Browser-side game engine
|    |    ├── Frame3D                             # 3D view
|    |    ├── Itowns                              # iTowns framework customization
|    |    ├── Widget                              # UI components for data interaction
|    |    ├── Component.js                        # API of Component module
|    |    ├── FileUtil.js                         # Utils to manipulate files
|    |    ├── HTMLUtil.js                         # Utils to manipulate html
|    |    ├── InputManager.js                     # Manage user inputs
|    |    ├── RequestAnimationFrameProcess.js     # Used to launch an asynchronous process
|    |    ├── SocketIOWrapper.js                  # Manage a websocket communication
|    |    ├── THREEUtil.js                        # Utils to manipulate THREE library
|    ├── SinglePlayerGamePlanar                   # Single player game template for using ud-viz game engine
|    ├── index.js                                 # API description (webpack entry point)
├── webpackConfig                                 # Configs of bundles' creation
├── package.json                                  # Global npm project description
├── Readme.md                                     # It's a me, Mario!
```

## Getting started

See [here](https://github.com/VCityTeam/UD-Viz/blob/master/Readme.md#getting-started).

## Developers

For pre-requisites see [here](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Developers.md#pre-requisites).

### Npm scripts

| Script                | Description                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`       | Create a [webpack](https://webpack.js.org/) bundle in [production](./webpackConfig/webpack.config.prod.js) mode. See [webpack.config.js](./webpackConfig/webpack.config.js)   |
| `npm run build-debug` | Create a [webpack](https://webpack.js.org/) bundle in [developpement](./webpackConfig/webpack.config.dev.js) mode. See [webpack.config.js](./webpackConfig/webpack.config.js) |
| `npm run test`        | Run browser test scripts and examples html. Uses [this test script](./bin/test.js)                                                                                            |
| `npm run debug`       | Launch a watcher for debugging. See [here](#debugging) for more information                                                                                                   |

### Debugging

For debugging run:

```bash
npm run debug
```

This runs a watched routine [debug.js](./bin/debug.js) with [nodemon](https://www.npmjs.com/package/nodemon) which:

- Runs a `npm run build-debug`
- May run `npm run test` (not by default).

## How to use it in your demo?

You can use it through npm (the preferred way) or download a bundle from our GitHub release page.

### With npm

In your demo:

```bash
npm install --save @ud-viz/browser
```

If you're using a module bundler (like [webback](https://webpack.js.org/concepts/)), you can directly write `import * as udvizBrowser from '@ud-viz/browser'` in your code. See [import doc](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/import).

> See https://github.com/VCityTeam/UD-Viz-template

### From a release bundle

See our [release page](https://github.com/VCityTeam/UD-Viz/releases/). We highly recommend using the last release every time.

> - This bundle also contains the dependencies
> - First release bundle -> 3.1.0

:warning: You can see a bundle-usage in [examples](../../examples/) but it's not from a **release bundle**, you can't copy paste directly, src attribute has to be changed in the script tag.
