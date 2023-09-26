# @ud-viz/frame3d

[![NPM package version](https://badgen.net/npm/v/@ud-viz/frame3d)](https://npmjs.com/package/@ud-viz/frame3d)

THREE.js 3D rendering frame in which DomElement 3D can be added.

## DOM structure

A frame3d is composed of three domElement side by side in a parent domElement :

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

`domElementUI` is where you should append your ui dom element.  
`domElementCss` is where `DomElement3D.domElement` is appended.
`domElementWebGL` is where THREE.js canvas is appended.

## How its works

When appending a `DomElement3D` to your frame3d, a mask object is added in the THREE.js scene making a transparent hole in the canvas, in addition `DomElement3D.domElement` is appended in `domElementCss` with dimension matching the mask object (using `CSS3DRenderer`) giving the illusion that the `DomElement3D.domElement` is part of THREE.js scene.

## Classes

- [DomElement3D](./src/DomElement3D.js) is a wrapper of a `HTMLElement` extending `THREE.Object3D` that can be appended to a frame3d

- [Base](./src/Base.js) is a frame3d only rendering a THREE.js scene

```js
import { Base, DomElement3D } from '@ud-viz/frame3d';

const frame3DBase = new Base();

const div = document.createElement('div');

const domElement3D = new DomElement3D(div);

frame3DBase.appendDomElement3D(domElement3D);
```

- [Planar](./src/Planar.js) is a frame3d wrapping an [itowns.PlanarView](https://github.com/iTowns/itowns/blob/master/src/Core/Prefab/PlanarView.js)

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

> you can find an implementation [here](https://github.com/VCityTeam/UD-Viz/blob/master/examples/frame3d.html)

> [Documentation](https://vcityteam.github.io/UD-Viz/html/frame3d/)
