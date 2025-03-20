console.log('workerLegonizerMockupMesh.js launch');

importScripts('../../../dist/development/legonizer.js');

onmessage = (message) => {
  const heightmap = message.data[0]; // heightmap is passed as first argument
  // legonizer split the result to fit data transfert size between worker and parent
  // but should be based on glBufferAttributes max size and DataTransfert max size to have an optimal call of postMessage
  udviz
    .extrudeHeightMap(heightmap, 1000) // max geometry merged count by mesh is 1000 do the trick here
    .map((geometry) => geometry.toNonIndexed().toJSON())
    .forEach((geometry) => postMessage(geometry));

  // notify parent compute is done
  postMessage('close');
  close();
};
