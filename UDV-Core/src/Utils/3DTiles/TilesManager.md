# Tiles Manager

The `TilesManager` utility class, located in `TilesManager.js` is a useful tool for accessing and manipulating a 3DTiles layer. It has, for the moment, two major functionnalities :

- Retrieve and store tiles and city objects in an accessible way. The main problem with the 3DTiles layer in iTowns is that its structure is not easy to navigate or manipulate. The `TilesManager` solves this problem by analyzing the layer and wrapping the objects in interfaces.
- Manage the styles of city objects. Setting or removing styles for specific city objects can be easily done with the tiles manager. The big advantage is that it stores the style configuration, so that it doesn't depend on the tile being actually present in the view or not. This allow for example to keep the style of a tile that has been unloaded, then reloaded by iTowns.

## Code examples

The module `3DTilesDebug` is a working module that relies on `TilesManager` to manage city objects. You can see this module for a concrete use of `TilesManager`. You can find below some examples of code taken and adpated from `3DTilesDebug`.

### Create and update the manager

```js
this.tilesManager = new TilesManager(view, view.getLayerById('3dtiles-layer'));

// Update when necessary
this.tilesManager.update();
```

The creation and update of the tiles manager is pretty straightforward. You just need to provide it the iTowns view and the 3DTiles layer.

The update is necessary for the moment before accessing or modifying city objects, to be sure that they are currently loaded. However in the future, this function should be replaced by listeners to events of the 3DTiles layer (such as loading / unloading of tiles).

### Pick a city object

```js
window.addEventListener('mousedown', (event) => {
  // event should be a MouseEvent
  let cityObject = this.tilesManager.pickCityObject(event);

  if (cityObject !== undefined) {
    // Do stuff...
  }
});
```

Picking a city object under the mouse can be done easily with a `MouseEvent`.

### Set the style for one or many city objects

```js
// City object identifiers, can be one or many batch IDs in one tile
let one = new CityObjectID(6, 64);
let many = new CityObjectID(6, [66, 67]);

// Style objects. MaterialProps accepts any THREE.js material parameter
let styleRed = new CityObjectStyle({materialProps: {color: 0xff0000}});
let styleGreen = new CityObjectStyle({materialProps: {color: 0x00ff00, opacity: 0.5}});

// Define style with the constructed objects
this.tilesManager.setStyle(one, styleRed);
this.tilesManager.setStyle(many, styleGreen);
// You can also define style on the fly, without instantiating the appropriate classes
this.tilesManager.setStyle({tileId: 6, batchId: 68}, {materialProps: {opacity: 0}});

// Apply the changes
this.tilesManager.applyStyles();
```

Identifiying one or more city objects can be done with the class `CityObjectID`. It takes a tile ID as a first parameter, and either a single or an array of batch IDs as a second one.

Styling is defined in `CityObjectStyle` objects. For the moment, it has only one property: `materialProps`, parameters for THREE.js materials.

It is necessary to call `applyStyles` for the tiles to be effectively updated.

### Define named styles

```js
// Register using a string as a name
this.tilesManager.registerStyle('red', {materialProps: {color: 0xff0000}});

// Instead of a CityObjectStyle, the string serves as an identifier
this.tilesManager.setStyle({tileId: 6, batchId: [64, 67]}, 'red');

this.tilesManager.applyStyles();
```

It is possible to register named styles in the tiles manager. These styles are usable accross all tiles, and allow you to manipulate style names rather than style objects.

### Remove styles

```js
// Remove for one or many city objects
this.tilesManager.removeStyle({tileId: 6, batchId: 64});

// Remove for a whole tile (identified by a tile ID)
this.tilesManager.removeStyleFromTile(7);

// Remove all styles in the scene
this.tilesManager.removeAllStyles();
```

There are three different ways of removing applied styles : for city object(s), for a tile or for the whole scene.

## Model

There are two main object representing the 3DTiles hierarchy : `Tile` and `CityObject`. The `CityObjectStyle` represents the style that can be applied to a city object.

### Tile

[Model/Tile.js](./Model/Tile.js)

The `Tile` object represents a tile. It contains the batch table and the reference to its city objects.

This class is responsible of parsing the 3DTiles tileset in order to fetch and construct the city objects within itself.

|Attribute|Type|Description|
|---------|----|-----------|
|`layer`|`iTowns.Layer`|The 3DTiles layer.|
|`tileId`|`number`|The tile ID in the tileset.|
|`cityObjects`|`CityObject[]`|An array of the city objects contained in the tile. It is `null` by default and can by instantiated with the `loadCityObjects` method.|
|`batchTable`|`BatchTable`|A reference to the batch table contained in the `Object3D` root of the tile.|

Below is a summary of the methods in the `Tile` class. These methods, excepted `loadCityObjects`, are convenient getters. None of the methods take any argument.

|Method|Returns|Description|
|------|-------|-----------|
|`getObject3D`|`THREE.Object3D`|Returns the root node of the tile. This is the node that contains the batch table and the tile ID.|
|`getMesh`|`THREE.Mesh`|Returns the Mesh node of the tile. This is the node that contains the geometry (with batch IDs and other attributes) and the materials.|
|`isVisible`|`boolean`|Returns wether the tile is currently laoded in the scene, ie. wether an Object3D with the same tile ID is present in the tileset.|
|`isLoaded`|`boolean`|Returns wether the `cityObjects` attribute has been filled with the city objects of the tile, ie. the method `loadCityObjects` has been called when the tile was visible.|
|`loadCityObjects`||If the tile is visible, parse the Object3D and the Mesh node to create the city objects.|

### City object

[Model/CityObject.js](./Model/CityObject.js)

The `CityObject` class represents a city object. It contains useful geometry properties, such as the vertex indexes or the centroid. It also contains the properties of the batch table.

The file also exports a `CityObjectID` class to represent a single or a set of city objects in a tile.

### City object style

[Model/CityObjectStyle.js](./Model/CityObjectStyle.js)

The `CityObjectStyle` object represents a style that can be applied to a city object. For the moment, the only option available is to change the material. In order to to that, the `materialProps` property stores THREE.js material parameters, as defined in [the THREE.js documentation](https://threejs.org/docs/index.html#api/en/materials/MeshLambertMaterial).