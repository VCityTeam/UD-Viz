# @ud-viz/utils_shared

[![NPM package version](https://badgen.net/npm/v/@ud-viz/utils_shared)](https://npmjs.com/package/@ud-viz/utils_shared)


`@ud-viz/utils_shared` is a collection of shared-realted functions (interpretable by nodeJS and browser enviromnent). These utility functions are designed to facilitate various data manipulation and processing tasks in JavaScript applications.

## Installation 

You can install `@ud-viz/utils_shared` via npm:

```bash
npm install @ud-viz/utils_shared
```

## Usage

1. **Transform coordinates**:
   - `rotate2DCoord`: rotate a 2D point around origin related to an angle. 

2. **Geometric computation**:
   - `polygon2DArea`: compute area of 2D polygon.

3. **Throtlle**:
   - `throttle`: limit a function's execution frequency.

4. **Check data**:
   - `isNumeric`: check if a string is a number.

5. **Extract data**:
   - `vector3ArrayFromURIComponent` and `eulerArrayFromURIComponent` extract arrays of string from URI's components.

6. **Convert data**:
   -  `objectToInt32Array`, `int32ArrayToObject` and `dataUriToBuffer`.

7. **Geometric data conversion**:
   - `vector3ToLabel` to convert 3D vectors into strings formatted as labels.


8. **Arrays/objects operation**:
   - `objectEquals`, `objectOverWrite`, `objectParse`, `objectParseNumeric`, `arrayEquals`, `removeFromArray`, `arrayPushOnce` perform various operations on objects and arrays, such as compare, merge, transform and modify.

9. **String operation**:
   - `insert`, `round`, `computeFileFormat`, `computeFilenameFromPath` perform various operations on strings, such as inserting, rounding and extracting information from file names.



## Documentation

> [Online Documentation](https://vcityteam.github.io/UD-Viz/html/utils_shared/)

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests on the GitHub repository. See [Contributing.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributing.md).

## License

This package is licensed under the [GNU Lesser General Public License Version 2.1](https://github.com/VCityTeam/UD-Viz/blob/master/LICENSE.md), with copyright attributed to the University of Lyon.

## Credits

`@ud-viz/utils_shared` is developed and maintained by [VCityTeam](https://github.com/VCityTeam). See [Contributors.md](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Contributors.md).