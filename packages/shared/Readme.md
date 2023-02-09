# @ud-viz/shared

[![NPM package version](https://badgen.net/npm/v/@ud-viz/shared)](https://npmjs.com/package/@ud-viz/shared)

[@ud-viz/shared](https://npmjs.com/package/@ud-viz/shared) is a npm package based on [Three.js](https://threejs.org/) including data processing and model plus a game engine.

- [@ud-viz/shared](#ud-vizshared)
    - [Directory Hierarchy](#directory-hierarchy)
  - [Getting started](#getting-started)
  - [Developers](#developers)
    - [Npm scripts](#npm-scripts)
    - [Debugging](#debugging)

### Directory Hierarchy

```
UD-Viz/packages/shared
├── bin                                 # Global NodeJS development
├── src                                 # JS files composing the package
|    ├── Game                           # Shared game engine
|    |    ├── Component                 # Components of `Game.Object3D`
|    |    ├── ScriptTemplate            # JS script templates of Shared game engine
|    |    ├── State                     # Game state
|    |    ├── Context.js                # Handle scripts, collisions and model of a game
|    |    ├── Object3D.js               # Game node of a 3D scene
|    ├── Command.js                     # Basic object communication
|    ├── Data.js                        # Module for data processing (split string, converts to uri...)
|    ├── EventSender.js                 # Manage custom events
|    ├── index.js                       # API description (webpack entry point)
|    ├── ProcessInterval.js             # Manage loop process requesters
|    ├── Type.js                        # Check if a string is a valid number
├── webpackConfig                       # Configs of bundles' creation
├── package.json                        # Global npm project description
├── Readme.md                           # It's a me, Mario!
```

## Getting started

See [here](https://github.com/VCityTeam/UD-Viz/blob/master/Readme.md#getting-started).

## Developers

For pre-requisites see [here](https://github.com/VCityTeam/UD-Viz/blob/master/Readme.md#pre-requisites).

### Npm scripts

| Script                | Description                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`       | Create a [webpack](https://webpack.js.org/) bundle in [production](./webpackConfig/webpack.config.prod.js) mode. See [webpack.config.js](./webpackConfig/webpack.config.js)   |
| `npm run build-debug` | Create a [webpack](https://webpack.js.org/) bundle in [developpement](./webpackConfig/webpack.config.dev.js) mode. See [webpack.config.js](./webpackConfig/webpack.config.js) |
| `npm run test`        | Run shared testing scripts. Uses [this test script](./bin/test.js)                                                                                                            |
| `npm run debug`       | Launch a watcher for debugging. See [here](#debugging) for more information                                                                                                   |

### Debugging

For debugging run:

```bash
npm run debug
```

This runs a watched routine [debug.js](./bin/debug.js) with [nodemon](https://www.npmjs.com/package/nodemon) which:

- Runs a `npm run build-debug`
- May run `npm run test` (true by default).
