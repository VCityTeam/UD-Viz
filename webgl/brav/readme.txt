Install node and npm (included in node)
Install required packages :
npm install express
npm install throttle

To run the server, enter on linux : node index.js
on windows : node.exe index.js (or drag index.js over node.exe)

Resource tree :
root / ressources / paris / LOD2 / dem / json data, ex : ZoneAExporter_1286_13723_terrain.json
                          |      |
                          -      - build / json data, ex : ZoneAExporter_1286_13723.json
                          |
                          - textures /
                                     |
                                     - 128 / dds textures data
                                     |
                                     - 256 / dds textures data
                                     |
                                     - 512 / dds textures data
                                     |
                                     - 1024 / dds textures data
