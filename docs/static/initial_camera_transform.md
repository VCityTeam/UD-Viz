When creating a `Planar` part of [@ud-viz/frame3d](../../packages/frame3d/) you may want your camera to be placed at a specific point of view. In this tutorial we are going to see differents options available to achieve that.

## Configure `Planar`

`Planar` take an `options` object at the construction, where following fields will initialize camera point of view:

 * `coordinates`: camera look at geographic coordinate
 * `heading`: camera's heading, in degree
 * `range`: camera distance to target coordinate, in meter
 * `tilt`: camera's tilt, in degree

For more details check `Planar` documentation.

If you don't specify how the camera should be placed and you typed something like that:

```js
const frame3DPlanar = new Planar(extent); // <-- no options passed
```

then the camera will look at the center of the extent with these default values:
 * `heading`: -50°
 * `range`: 3000m
 * `tilt`: 10°

if you want to configure that you should then write something like:

```js
const frame3DPlanar = new Planar(extent, {
  coordinates: {
    x: some_x_coordinate
    y: some_y_coordinate
  },
  heading: some_heading,
  tilt: some_tilt,
  range: some_range,
});
```

> Note: these values can be defined in code or in a [config file](../../examples/assets/config/frame3D_planars.json) as the ud-viz examples.

## Use [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)

You can also use url util function to initialize default camera point of view. In that case you should first produce an url with camera matrix encoded in it.

```js
const url = new URL(window.location.origin + window.location.pathname);
appendCameraMatrixToURL(url, yourCamera);
```

then to initialize your camera with this url you would have to write something like that:

```js
const isCameraMatrixInitializedWithURL = URLSetCameraMatrix(yourCamera);
```