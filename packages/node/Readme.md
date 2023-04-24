# @ud-viz/node

[![NPM package version](https://badgen.net/npm/v/@ud-viz/node)](https://npmjs.com/package/@ud-viz/node)

[@ud-viz/node](https://npmjs.com/package/@ud-viz/node) is a npm package including dev tools plus a dedicated [@ud-viz/browser](https://npmjs.com/package/@ud-viz/browser) back-end service based on the [@ud-viz/shared](https://npmjs.com/package/@ud-viz/shared) package.

- [@ud-viz/node](#ud-viznode)
    - [Directory Hierarchy](#directory-hierarchy)
  - [Getting started](#getting-started)
  - [Developers](#developers)
    - [Npm scripts](#npm-scripts)

### Directory Hierarchy

```
UD-Viz/packages/node
├── src                             # JS files composing the package
|    ├── Game                       # Game socket service
|    ├── Debug.js                   # Debugging routine for @ud-viz/* packages
|    ├── index.js                   # API description (webpack entry point)
|    ├── Test.js                    # Module for testing @ud-viz/* packages.
├── package.json                    # Global npm project description
├── Readme.md                       # It's a me, Mario!
├── webpack.config.js               # Config of bundle creation
```

## Getting started

See [here](https://github.com/VCityTeam/UD-Viz/blob/master/Readme.md#getting-started).

## Developers

For pre-requisites see [here](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Devel/Developers.md#pre-requisites).

### Npm scripts

| Script          | Description                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------- |
| `npm run build-lib` | Create a [webpack](https://webpack.js.org/) bundle of the library |
| `npm run build-default-thread` | Create a [webpack](https://webpack.js.org/) bundle of the default game thread |
| `npm run build` | Run `npm run build-lib` and `npm run build-default-thread` |
