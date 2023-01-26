# 3DTilesUtils documentation

This document is about the following file :

- [3DTilesUtils](../3DTilesUtils.js)

## Helper functions for 3DTiles

In order to easily access the 3DTiles tiles in the scene, along with the objects within them, we provide a utility file containing helper functions. These functions allow for example to easily retrieve a tile and access the batche table and IDs when the user clicks somewhere.

The functions are in `3DTilesUtils`, which contains generic 3DTiles functions. They can be used in any 3DTiles context with iTowns.

## Table of contents

1. [Data structures](#data-structures)
2. [3DTilesUtils](#3dtilesutils)
3. [Code examples](#code-examples)

## Data structures

### Tile

A 3DTiles tile is represented in THREE.js (thus in iTowns) by a THREE.js "Object3D". It contains one child of type "Scene", which contains another child of type "Mesh".

The useful data about the Tile are located in the "Object3D" and the "Mesh" nodes of the hierarchy.

- The "Object3D" node contains the batch table (property `batchTable`).
- The "Mesh" node contains the geometry (`geometry`) and the material (`material`). `geometry` is of type BufferGeometry, which allows it to contain BufferAttributes (`attributes`). A useful attribute is the `_BATCHID` array, which maps each vertex of the tile with its associated batch id.

Below is a schematic summary of the layer object hierarchy :

```bash
Object3D
├─ Batch Table
└─ Scene
   └─ Mesh
      ├─ Material (color, etc.)
      └─ Geometry
         └─ Attributes (Batch IDs, positions, colors)
```

### Layer

A layer is used by iTowns to group together similar type of data. In our case, the only layer we care about is the 3DTiles one. It can be fetched from the iTowns `View` object with the `getLayerById` method :

```js
let layer = view.getLayerById(config['3DTilesLayerID']);
```

The 3DTiles layer has an `object3d` which contains exactly one child of type "Object3D". This child is actually the tileset root, and contains the tiles that are currently displayed in the scene.

The layer also has a `tileset` property which describes all tiles. Every tile is listed here, even if they are not rendered in the scene for the moment. However, the THREE.js actual objects representing the tiles are not there.

### Batch Table

The batch table objects represent a 3DTiles batch table. It has two attributes :

- `batchLength` refers to the total number of different batch IDs in the tile.
- `content` is a dictonnary mapping each attribute of the batch table to an array of values, where the indexes of the array are the batch IDs of the corresponding objects.

Below is an example batch table with one attribute, called "cityobject.database_id".

![Batch table example](batch_table_example.png)

### Geometry attributes

In the "Mesh" node of the tile hierarchy is stored the geometry of the tile, along with "geometry attributes". These attributes are actually THREE.js BufferAttributes used to describe the geometry. They are represented by arrays of size N \* S, where N is the number of vertices in the scene and S is the size of the attribute items.

For example, to represent the position of each vertex, an item of size 3 is used (because a position is described by 3 values : x, y and z). If our tile contains 10 vertices, the `position` attribute has an array of size 30. The position of the first vertex is described by the elements at index 0, 1 and 2 of the attribute array (respectively for x, y and z values).

The commonly used attributes are the following :

- `_BATCHID` is an attribute with an item size 1. Each vertex has a batch ID associated to it, and vertices can be grouped under the same batch ID (useful to represent a coherent set of vertices, like a building). Be careful however, because the batch IDs are not unique accross the tiles.
- `position` has an item size of 3. It represents the coordinates of the vertices.
- `color` has an item size of 3. It represents the color of the vertices. By default, this value is not used to render the shape because the material of the tile has its own color. To override this behaviour and use the color of each vertex, we must set the `vertexColors` property of the material to `THREE.VertexColors`.

### Building

A building is a set of 3DTiles vertices, characterized by a common building ID. It often represents a "real life building".

## 3DTilesUtils

Below are listed the utility functions used to interact with 3DTiles data.

### `getBatchTableFromTile(tile)` - Retrieve a batch table from a tile

This function is used to get the batch table of a tile. This is handy because the `tile` parameter can be either the "Object3D", the "Scene" or the "Mesh" node of the tile.

### `getBatchIdFromIntersection(inter)` - Get a batch ID from an intersection

The function allows to find a batch ID corresponding to the intersecting object of an intersection. This is useful when coupled with the `View.pickObjectsAt` method of iTowns, which returns an array of intersections.

### `getFirstTileIntersection(intersections)` - Gets a tile from an intersection array

The function iterates over an array of intersections and return the first one where the intersecting object is a 3DTiles tile.  
The `View.pickObjectsAt` method is handy but returns an array of intersections, where intersecting objects are not always 3DTiles elements. In this case, this function may be convenient to get the first interesting intersection.

### `getVisibleTiles(layer)` - Returns all tiles currently rendered on the scene

This function explores the tileset tree to find all tiles that are currently rendered. The result is returned as an array rather than a tree (the parent-child structure is however kept thanks to the `parent` and `children` properties of the tiles).

### `getVisibleTileCount(layer)` - Counts how many tiles are displayed on the scene

This function is relatively straightforward. It simply counts the number of tiles are currently rendered on the scene.

### `createTileGroups(tile, materials, ranges)` - Create tile groups and set materials

This function is used to group the vertices of the tile into different "groups". A group is a set of consecutive vertices with the same material. This function can be used to change the material (color, opacity, etc.) of different parts of the tile.  
Different materials can be used at the same time.

### `updateITownsView(view, layer)` - Updates the scene

The purpose of this function is to tell the iTowns view to update the scene. It is necessary to call this function when you make changes to the color of some tiles, for example.

### `getMeshFromTile(tile)` - Gets the mesh component of a tile

Search for the last child of a tile in its hierarchy, which should be an object of type "Mesh". It should have a geometry.

### `getObject3DFromTile(tile)` - Gets the root component of a tile

Search for the root component of a tile in its hierarchy, which should be an object of type "Object3D". It should have a batch table.

## Code examples

A working code example can be found with the `3DTilesDebug` extension. In this section, we are going to take pieces of code from the source files to illustrate the use of some of the utility functions.

### Get a tile under the mouse

Using the iTowns `View` object, it is possible to get objects from the mouse positions. We can for example fetch a 3DTiles tile under the mouse :

```js
let intersections = this.itownsView.pickObjectsAt(event, 5);
let tileIntersection = getFirstTileIntersection(intersections);
let tile = tileIntersection.object;
```

In the actual code, we fetch the building ID from the intersection :

```js
let intersections = this.itownsView.pickObjectsAt(event, 5);
let tileIntersection = getFirstTileIntersection(intersections);
if (!!tileIntersection) {
  let tileId = getObject3DFromTile(tileIntersection.object).tileId;
  let batchId = getBatchIdFromIntersection(tileIntersection);
  //...
}
```

### Create tile groups to apply materials

Let's say we want to apply different styles to different parts of a tile (like buildings). Some buildings will be drawn in red, and other will be hidden. We can do that by defining tile groups :

```js
let tile = getTileInLayer(this.layer, 6);
createTileGroupsFromBatchIDs(tile, [
  {
    material: { color: 0xff0000 },
    batchIDs: [64, 66],
  },
  {
    material: { opacity: 0 },
    batchIDs: [65, 67],
  },
]);
```

In this example, the city objects 64 and 66 from the tile 6 will be drawn in red, whereas the city objects 65 and 67 will be invisible.
