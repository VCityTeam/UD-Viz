When creating a `Frame3DPlanar` you may want your camera to be placed at a specific point of view. In this tutorial we are going to see differents options available to achieve that. You may want to check [show room code](../../../../examples/assets/js/ShowRoom.js) which implements differents methods expose here.

## Configure `Frame3DPlanar`

`Frame3DPlanar` take an `options` object at the construction, where following fields will initialize camera point of view:

 * `coordinates`: camera look at geographic coordinate
 * `heading`: camera's heading, in degree
 * `range`: camera distance to target coordinate, in meter
 * `tilt`: camera's tilt, in degree

For more details check `Frame3DPlanar` documentation.

If you don't specify how the camera should be placed and you typed something like that:

```js
const frame3DPlanar = new Frame3DPlanar(extent); // <-- no options passed
```

then the camera will look at the center of the extent with these default values:
 * `heading`: -50°
 * `range`: 3000m
 * `tilt`: 10°

if you want to configure that you should then write something like:

```js
const frame3DPlanar = new Frame3DPlanar(extent, {
  coordinates: {
    x: some_x_coordinate
    y: some_y_coordinate
  },
  heading: some_heading,
  tilt: some_tilt,
  range: some_range,
});
```

> Note: these values can be defined in code or in a [config file](../../../examples/assets/config/frame3D_planars.json) as the ud-viz examples.

## Use [localStorage](https://developer.mozilla.org/fr/docs/Web/API/Window/localStorage)

You can also use the localStorage util function, which will replace the camera point of view according the last one recorded (reloading your webpage does not change camera point of view). The code to write will looks like this:

```js
const frame3DPlanar = new Frame3DPlanar(extent);
localStorageSetCameraMatrix(frame3DPlanar.camera);// <-- will set camera point of view with the last point of view recorded
```
>Note: the first time you will run your webpage the camera point of view will be the one pass to the `Frame3DPlanar`

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