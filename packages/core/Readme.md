# @ud-viz/core

[![NPM package version](https://badgen.net/npm/v/@ud-viz/core)](https://npmjs.com/package/@ud-viz/core)

[@ud-viz/core](https://npmjs.com/package/@ud-viz/core) is a npm package based on [iTowns](https://github.com/itowns/itowns) allowing to visualize, analyze and interact with urban data. It also depends on [@ud-viz/core](https://npmjs.com/package/@ud-viz/core) package.

- [@ud-viz/core](#ud-vizcore)
    - [Directory Hierarchy](#directory-hierarchy)
  - [Getting started](#getting-started)
  - [Developers](#developers)
    - [Pre-requisites](#pre-requisites)
    - [Npm scripts](#npm-scripts)
    - [Debugging](#debugging)

### Directory Hierarchy

```
UD-Viz/packages/core
├── bin                  # Global NodeJS development
├── src                  # JS, CSS files composing the package
|    ├── Game                       # Core-side game engine
|         ├── Component                 # Components of `Game.Object3D`
|         ├── ScriptTemplate            # JS scripts files
|         ├── State                     # States conduct game
|         ├── Context.js                # Take care of scripts and game collisions
|         ├── Object3D.js               # A part of the 3D game's scene
|    ├── Command.js                 # Create `Command` from json
|    ├── Data.js                    # Module for data (split string, converts to uri...)
|    ├── EventSender.js             # Manage custom events
|    ├── index.js                   # API description (webpack entry point)
|    ├── ProcessInterval.js         # Manage loop processes
|    ├── Type.js                    # Check if a string is a valid number
├── webpackConfig        # Configs of bundles' creation
├── package.json         # Global npm project description
├── Readme.md            # It's a me, Mario!
```

> See [repo](https://github.com/VCityTeam/UD-Viz/blob/master/packages/core)

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
| `npm run test`        | Run core scripts. Uses [this test script](./bin/test.js)                                                                                                                      |
| `npm run debug`       | Launch a watcher for debugging. See [here](#debugging) for more information                                                                                                   |

### Debugging

For debugging run:

```bash
npm run debug
```

It run a watched routine [debug.js](./bin/debug.js) with [nodemon](https://www.npmjs.com/package/nodemon):

- Run a `npm run build-debug`
- Can run `npm run test` (true by default).
