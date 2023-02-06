# @ud-viz/node

[![NPM package version](https://badgen.net/npm/v/@ud-viz/node)](https://npmjs.com/package/@ud-viz/node)

[@ud-viz/node](https://npmjs.com/package/@ud-viz/node) is a npm package including dev tools plus dedicate [@ud-viz/browser](https://npmjs.com/package/@ud-viz/browser) back-end service based on [@ud-viz/core](https://npmjs.com/package/@ud-viz/core) package.

- [@ud-viz/node](#ud-viznode)
    - [Directory Hierarchy](#directory-hierarchy)
  - [Getting started](#getting-started)
  - [Developers](#developers)
    - [Pre-requisites](#pre-requisites)
    - [Npm scripts](#npm-scripts)
    - [Debugging](#debugging)

### Directory Hierarchy

```
UD-Viz/packages/node
├── bin                  # Global NodeJS development
├── src                  # JS files composing the package
|    ├── Debug                  # Dev tools for debugging
|    ├── ExpressAppWrapper                  # @ud-viz/browser dedicate back-end
|    ├── Test                  # Dev tools for test
|    ├── index.js                   # API description (webpack entry point)
├── package.json         # Global npm project description
├── Readme.md            # It's a me, Mario!
├── webpack.config.js        # Config of bundle creation
```

> See [repo](https://github.com/VCityTeam/UD-Viz/blob/master/packages/node)

## Getting started

See [here](../../Readme.md#getting-started).

## Developers

### Pre-requisites

See [here](../../Readme.md#pre-requisites).

### Npm scripts

| Script                | Description                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`       | Create a [webpack](https://webpack.js.org/) bundle, this command is just here for test purpose|

> See [repo](https://github.com/VCityTeam/UD-Viz/blob/master/packages/node)


### Debugging

To debugging the [ExpressAppWrapper](./src/ExpressAppWrapper.js) back-end see [here](../../Readme.md#debugging-the-examples)