# Style Manager

The `StyleManager` object serves as an interface to store and apply styles for city objects.

## Summary

1. [Usage](#Usage)
2. [Processes and data structures](#Processes-and-data-structures)
    1. [Storage of styles](#Storage-of-styles)
    2. [Reverse storage for finding usage](#Reverse-storage-for-finding-usage)
    3. [Applying styles](#Applying-styles)
        1. [Optimization: buffering the materials](#Optimization-buffering-the-materials)
3. [Detailed documentation](#Detailed-documentation)
    1. [Properties](#Properties)
    2. [Methods](#Methods)
      3. [Public](#Public)
      4. [Private](#Private)

## Usage

The style manager has two major abilities :

1. Store style data related to city objects. This mean keeping the styles to apply in a data structure that is independant from the 3DTiles objects, avoiding to lose the data if a tile unloads.
2. Modify the 3DTiles layer to apply the stored styles.

To store styles, the `StyleManager` provide a single function, called `setStyle`. Let's look at its signature :

```js
setStyle(cityObjectId, style)
```

The first parameter is a `CityObjectID` object, that identifies one or many city objects in a tile. The second parameter is either a `CityObjectStyle` or a string referring to a registered style (We'll cover registered styles later in this document). The purpose of this method is to update the data structures of the `StyleManager`, so that the style passed in parameter becomes the style associated with the city objects identified by the first parameter.

Let's see some example code :

```js
// The constructor takes no argument
let sm = new StyleManager();

// The city object 64 in the tile 6 will have a red material
sm.setStyle(new CityObjectID(6, 64), new CityObjectStyle({materialProps: {color: 0xff0000}});
```

After this code, the style manager has been updated and knows that the city object (6; 64) should have a red material. Note that this code does not update the actual city object in the 3DTiles layer, it just tells the `StyleManager` what this city object should look like.

In this example, we've use an _anonymous style_ for our city object. However, there is another way of using the `setStyle` method :

```js
// Register a style, that we call "red"
sm.registerStyle('red', new CityObjectStyle({materialProps: {color: 0xff0000}});

// The city object 66 in the tile 6 will use the material registered under the name 'red'
sm.setStyle(new CityObjectID(6, 66), 'red');
```

The advantage of this method is that the registered style is re-usable : you can call the `setStyle` function on other city objects with the style 'red' and they will have the same style. To learn about the differences between _anonymous styles_ and _registered styles_, please refer to the [storage of styles](#Storage-of-styles) section.

Now that we've told our style manager how our city objects should look like, we should tell it to actually modify the 3DTiles layer. To to that, the other method you should know is the following :

```js
applyToTile(tile)
```

Its only argument is a `Tile` objects that must be loaded (ie. its `isLoaded()` method should return `true`). The style manager will search if any style has been associated with city objects that belongs to this style. If this is the case, it will modify the 3DTiles layer to correspond to the associated style.

```js
// Create the object corresponding to the 6th tile
let tile = new Tile(view.getLayerById('3dtiles-layer'), 6);
tile.loadCityObjects();

// Now update the tile so that it has the style we defined with `setStyle`
sm.applyToTile(tile);
```

It is also possible to remove styles from objects. To do that, three different methods exist depending on what exaclty you want to remove :

```js
// Remove a style associated with specific city objects
sm.removeStyle(new CityObjectID(6, 64));

// Remove styles associated with all city objects in a specific tile
sm.removeStyleFromTile(6)

// Resets the `StyleManager`. Please note that registered styles will persist
sm.removeAllStyles();

// Remove all styles that exist. Before actually removing the styles, we store
// the styles that had at least one style applied to them.
let tilesToUpdate = sm.getStyledTiles();
sm.applyToTile()

// Apply the changes on these tiles
for (let tileId of tilesToUpdate) {
    sm.applyToTile(tileId);
}
```

## Processes and data structures

### Storage of styles

### Reverse storage for finding usage

### Applying styles

#### Optimization: buffering the materials

## Detailed documentation

### Properties

### Methods

#### Public

#### Private
