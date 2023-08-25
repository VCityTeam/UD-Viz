# UD-Viz : Urban Data Vizualisation

[![CodeQL](https://github.com/VCityTeam/UD-Viz/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/VCityTeam/UD-Viz/actions/workflows/codeql-analysis.yml)
[![CI status](https://travis-ci.com/VCityTeam/UD-Viz.svg?branch=master)](https://app.travis-ci.com/github/VCityTeam/UD-Viz)
[![Documentation Status](https://readthedocs.org/projects/ansicolortags/badge/?version=latest)](http://vcityteam.github.io/UD-Viz/html/index.html)

UD-Viz is a 3-package JavaScript framework for creating web applications for visualizing and interacting with geospatial 3D urban data.

[Online documentation](https://vcityteam.github.io/UD-Viz/html/index.html) &mdash;
[Developers](./docs/static/Developers.md) &mdash;
[License](./LICENSE.md) &mdash;
[Getting Started](#getting-started) &mdash;
[Architecture](./docs/static/Architecture.md)

**Online demos**:

<p>
  <a href="https://ud-viz.vcityliris.data.alpha.grandlyon.com/" ><img src="examples/assets/img/readme/UDVIZ-Examples.png" alt="UD-VizExamples Mosaic" width="32.5%"></a>
  <a href="https://www.imuvirtuel.fr/"><img src="examples/assets/img/readme/IMUV_Homepage.png" alt="IMUV Flying Campus Mosaic" width="32.5%"></a>
  <a href="https://deambulation-bron.vcityliris.data.alpha.grandlyon.com/"><img src="examples/assets/img/readme/Deambulation Bron.png" alt="Deambulation Bron Mosaic" width="32.5%"></a>
</p>
<p>
  <a href="https://ui-driven-data-lyon.vcityliris.data.alpha.grandlyon.com/" ><img src="examples/assets/img/readme/UI_Data_Driven.png" alt="UI Data Driven Mosaic" width="32.5%"></a>
  <a href="https://spatial-multimedia-demo.vcityliris.data.alpha.grandlyon.com/"><img src="examples/assets/img/readme/MultimediaViz.png" alt="Multimedia Viz Mosaic" width="32.5%"></a>
</p>

*3D tiles related*
<p>
  <a href="https://py3dtilers-demo.vcityliris.data.alpha.grandlyon.com/"><img src="examples/assets/img/readme/3DTiles.png" alt="Py3dTilers Mosaic" width="32.5%"></a>
  <a href="https://point-cloud.vcityliris.data.alpha.grandlyon.com/" ><img src="examples/assets/img/readme/PointClouds.png" alt="Point Clouds Mosaic" width="32.5%"></a>
</p>



**UD-Viz Packages:**

Split-code by interpretation environment:  
- [@ud-viz/browser](./packages/browser/Readme.md) package is interpretable by the **browser**
- [@ud-viz/node](./packages/node/Readme.md) package is interpretable by **Node.js**
- [@ud-viz/shared](./packages/shared/Readme.md) interpretable by **both** environments

```mermaid
flowchart TD
  subgraph UD-Viz repo
    subgraph packages
    shared-->|import|browser
    shared-->|import|node
    end
  end
```

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

**Github repositories:** 

  
| Repository      | Link                                         | Description                                                                            |
| --------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| UD-Viz-docker   | https://github.com/VCityTeam/UD-Viz-docker   | Docker, which performs all the steps described in [Getting Started](#getting-started). |
| UD-Viz-template | https://github.com/VCityTeam/UD-Viz-template | A basis for creating your application using UD-Viz.                                    |


## Getting Started


### Installing node/npm

For the node/npm installation instructions refer [here](https://github.com/VCityTeam/UD-SV/blob/master/Tools/ToolNpm.md)

UD-Viz has been reported to work with versions:

- node version 18.X
- npm version: 9.X

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

