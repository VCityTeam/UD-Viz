# @ud-viz/frame3d

[![NPM package version](https://badgen.net/npm/v/@ud-viz/frame3d)](https://npmjs.com/package/@ud-viz/frame3d)

## Overview

`@ud-viz/frame3d` provides a flexible THREE.js 3D rendering frame that smoothly integrates DomElements, elevating your web-based 3D experiences.

### Installation

You can install `@ud-viz/frame3d` via npm:

```bash
npm install @ud-viz/frame3d
```

## Usage

### DOM Structure

A `frame3d` consists of three DomElements arranged side by side within a parent `domElement`:

```html
<div>
  <!-- frame3d.domElement -->
  <div></div>
  <!-- frame3d.domElementUI -->
  <div></div>
  <!-- frame3d.domElementCss -->
  <div></div>
  <!-- frame3d.domElementWebGL -->
</div>
```

`domElementUI` is where you should append your UI DOM element.  
`domElementCss` is where `DomElement3D.domElement` is appended.  
`domElementWebGL` is where the THREE.js canvas is appended.

### How it Works

When adding a `DomElement3D` to your `frame3d`, a mask object is added in the THREE.js scene, creating a transparent hole in the canvas. Additionally, `DomElement3D.domElement` is appended to `domElementCss` with dimensions matching the mask object (using `CSS3DRenderer`), creating the illusion that `DomElement3D.domElement` is part of the THREE.js scene.

### Classes

- [DomElement3D](./src/DomElement3D.js): A wrapper for a `HTMLElement` extending `THREE.Object3D`, suitable for appending to a `frame3d`.
- [Base](./src/Base.js): Renders only a THREE.js scene in a `frame3d`.

#### Example
```js
import { Base, DomElement3D } from '@ud-viz/frame3d';

const frame3DBase = new Base();

const div = document.createElement('div');

const domElement3D = new DomElement3D(div);

frame3DBase.appendDomElement3D(domElement3D);
```

- [Planar](./src/Planar.js): Wraps an [itowns.PlanarView](https://github.com/iTowns/itowns/blob/master/src/Core/Prefab/PlanarView.js).

#### Example

```js
import { Planar, DomElement3D } from '@ud-viz/frame3d';
import * as itowns from 'itowns';

const crs = 'EPSG:3857';
const extent = new itowns.Extent(crs, 1837860, 1851647, 5169347, 5180575);

const frame3DPlanar = new Planar(extent);

const div = document.createElement('div');

const domElement3D = new DomElement3D(div);

frame3DPlanar.appendDomElement3D(domElement3D);
```

## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/frame3d/)


## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/frame3d` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).