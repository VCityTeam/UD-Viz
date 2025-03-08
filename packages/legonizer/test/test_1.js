return;
/**
 * TODO fix line below
 * Error [ERR_REQUIRE_ESM]: require() of ES Module F:\Documents\projects\web\UD-Viz\node_modules\three\examples\jsm\utils\BufferGeometryUtils.js from F:\Documents\projects\web\UD-Viz\packages\legonizer\src\index.js not supported.
 */
const { extrudeHeightMap } = require('../src/index');

const geometries = extrudeHeightMap(
  [0, 1, 5, 12],
  [0, 1, 5, 12],
  [100, 1, 54, 12],
  [0, 1, 56, 2415],
  [0, 56, 5, 12],
  [145, 1, 5, 12],
  [0, 45, 5, 545]
); //heightmap size 4 * 7

console.log(geometries);
