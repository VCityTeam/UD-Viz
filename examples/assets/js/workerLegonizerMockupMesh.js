console.log('workerLegonizerMockupMesh.js launch');

importScripts('../../../dist/production/legonizer.js');

onmessage = (message) => {
  const heightmap = message.data[0]; // heightmap is passed as first argument
  const geometries = udviz.extrudeHeightMap(heightmap);
  const result = geometries.map((geometry) => geometry.toNonIndexed().toJSON());
  result.forEach((geometry) => postMessage(geometry));
  postMessage('close');
  close();
};
