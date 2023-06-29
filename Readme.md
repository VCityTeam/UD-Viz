# UD-Viz : Urban Data Vizualisation

[![CodeQL](https://github.com/VCityTeam/UD-Viz/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/VCityTeam/UD-Viz/actions/workflows/codeql-analysis.yml)
[![CI status](https://travis-ci.com/VCityTeam/UD-Viz.svg?branch=master)](https://app.travis-ci.com/github/VCityTeam/UD-Viz)
[![Documentation Status](https://readthedocs.org/projects/ansicolortags/badge/?version=latest)](http://vcityteam.github.io/UD-Viz/html/index.html)

UD-Viz is a 3-package JavaScript framework for creating web applications for visualizing and interacting with geospatial 3D urban data.

[Online documentation](https://vcityteam.github.io/UD-Viz/html/index.html) &mdash;
[Developers](./docs/static/Developers.md) &mdash;
[License](./LICENSE.md) &mdash;
[Getting Started](#getting-started) &mdash;
[Architecture](./docs/static/Devel/Architecture.md)

**Online demos**:

- [Ud-Viz examples](https://ud-viz.vcityliris.data.alpha.grandlyon.com/)
- [Flying campus](https://www.imuvirtuel.fr/): a multi-player demo using UD-Viz

**UD-Viz Packages:**

Split-code by interpretation environment:  
- [@ud-viz/browser](./packages/browser)
- [@ud-viz/node](./packages/node)
- [@ud-viz/shared](./packages/shared)

### Directory Hierarchy

```
UD-Viz (repo)
├── bin                       # Global NodeJS development and deployment
├── docs                      # Developer and User documentation
├── examples                  # Examples of the ud-viz framework
├── packages                  # Packages folder
|    ├── browser              # UD-Viz Browser-side framework
|    ├── shared               # UD-Viz shared (Browser+Node) framework
|    ├── node                 # UD-Viz Node-side framework
├── .eslintrc.js              # Linting rules and configuration
├── .gitignore                # Files/folders ignored by Git
├── .prettierrc               # Formatting rules
├── travis.yml                # Continuous integration entrypoint
├── favicon.ico               # Landing page icon
├── index.html                # Landing page entrypoint
├── package-lock.json         # Latest npm package installation file
├── package.json              # Global npm project description
├── Readme.md                 # It's a me, Mario!
├── style.css                 # Landing page style
```

## Getting Started

### Installing node/npm

For the node/npm installation instructions refer [here](https://github.com/VCityTeam/UD-SV/blob/master/Tools/ToolNpm.md)

UD-Viz has been reported to work with versions:

- node version 16.X
- npm version: 8.X

### Installing the UD-Viz framework per se

Clone the UD-Viz repository and install requirements with npm

```bash
git clone https://github.com/VCityTeam/UD-Viz.git
cd UD-Viz
npm install # resolve dependencies based on the package.json (and package-lock.json if it exists)
```

### How to run it locally?

```bash
npm run start
```

After running go to [localhost:8000](http://localhost:8000) which links to [documentation](./docs/) and [examples](./examples/)

