# @ud-viz/node

[![NPM package version](https://badgen.net/npm/v/@ud-viz/node)](https://npmjs.com/package/@ud-viz/node)

[@ud-viz/node](https://npmjs.com/package/@ud-viz/node) is an npm package that allows you to run a custom express server for applications using the @ud-viz framework. It also depends on [@ud-viz/core](https://npmjs.com/package/@ud-viz/core) package.

- [@ud-viz/node](#ud-viznode)
    - [Directory Hierarchy](#directory-hierarchy)
  - [Getting started](#getting-started)
  - [Developers](#developers)
    - [Pre-requisites](#pre-requisites)
    - [Npm scripts](#npm-scripts)

### Directory Hierarchy

```
UD-Viz/packages/node
├── src                     # JS, CSS files composing the package
|    ├── Debug.js                   # Common routine of debug for @ud-viz/* packages
|    ├── ExpressAppWrapper.js       # Wrapper of an express app
|    ├── index.js                   # API description (webpack entry point)
|    ├── Test.js                    # Module for testing @ud-viz/browser scripts and examples html.
├── webpack.config.js       # Configs of bundles' creation
├── package.json            # Global npm project description
├── Readme.md               # It's a me, Mario!
```

> See [repo](https://github.com/VCityTeam/UD-Viz/blob/master/packages/node)

## Getting started

See [here](../../Readme.md#getting-started).

## Developers

### Pre-requisites

See [here](../../Readme.md#pre-requisites).

### Npm scripts

| Script          | Description                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build` | Create a [webpack](https://webpack.js.org/) bundle in [production](./webpackConfig/webpack.config.prod.js) mode. See [webpack.config.js](./webpack.config.js) |
