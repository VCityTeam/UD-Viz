/**
* Vilo3D 3d scene Setup
*/

import * as itowns from 'itowns';
import * as THREE from 'three';
import proj4 from 'proj4';

/**
* Call this to initialize the values of global var : view, extent and renderer (Main.js)
* After this, the itowns view will contain itowns layers for city geometry
* the view will be displayed in the viewerDiv div
* @param buildingServerRequest : the request sent to building-server
* Example : http://localhost:9090/getCity?city=lyon for local server
* Example : http://rict.liris.cnrs.fr:9090/getCity?city=lyon for distant server
*/
//=============================================================================
export function Setup3DScene(terrainAndElevationRequest,
                             buildingServerRequest,
                             showBuildings = false)
{
// Define projection that we will use (taken from https://epsg.io/3946, Proj4js section)
proj4.defs('EPSG:3946',
    '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

// Define geographic extent: CRS, min/max X, min/max Y
var extent = new itowns.Extent(
    'EPSG:3946',
    1837816.94334, 1847692.32501,
    5170036.4587, 5178412.82698,
);

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
const viewerDiv = document.getElementById('viewerDiv');

// Since the elevation layer use color textures, specify min/max z which is in
// gray scale. Normally a multiplicative factor should allow to get the data at
// the right scale but it is not done by the Open Data Grand Lyon
const config = {
    materialOptions: {
        useColorTextureElevation: true,
        colorTextureElevationMinZ: 0,
        colorTextureElevationMaxZ: 255,
    },
    disableSkirt: true,
};

// Instanciate PlanarView*
let view = new itowns.PlanarView(viewerDiv, extent, config);

// Add an WMS imagery layer (see WMSProvider* for valid options)
view.addLayer({
    type: 'color',
    id: 'wms_imagery',
    updateStrategy: {
        type: itowns.STRATEGY_DICHOTOMY,
        options: {},
    },
    source: {
        extent: extent,
        name: 'Ortho2009_vue_ensemble_16cm_CC46',
        protocol: 'wms',
        url: 'https://download.data.grandlyon.com/wms/grandlyon',
        version: '1.3.0',
        projection: 'EPSG:3946',
        format: 'image/jpeg',
    },
});

// Add an WMS elevation layer (see WMSProvider* for valid options)
view.addLayer({
    id: 'wms_elevation',
    type: 'elevation',
    source: {
        extent: extent,
        url: 'https://download.data.grandlyon.com/wms/grandlyon',
        protocol: 'wms',
        name: 'MNT2012_Altitude_10m_CC46',
        projection: 'EPSG:3946',
        heightMapWidth: 256,
        format: 'image/jpeg',
    },
});

// Create a new Layer 3d-tiles  => data from an apache service running rict.liris.cnrs.fr and serving a 3d tiles temporal
// tileset of Villeurbanne
// -----------------------------------------------------
const $3dTilesTemporalLayer = new itowns.GeometryLayer('3d-tiles-discrete-lod', new THREE.Group());
$3dTilesTemporalLayer.name = '3d-tiles-temporal';
$3dTilesTemporalLayer.url = buildingServerRequest;
$3dTilesTemporalLayer.protocol = '3d-tiles';
// Require temporal management (considered as a special material handled
// through culling by the shaders)
$3dTilesTemporalLayer.TemporalExtension = true;
$3dTilesTemporalLayer.visible = true;
// Hardwire minimum date in js (https://stackoverflow.com/questions/11526504/minimum-and-maximum-date). This date will
// be updated with the minimum dates of the data of the layer in the example.
$3dTilesTemporalLayer.displayDate = new Date(-8640000000000000);
// but this initialization can also be the responsability of another component.

// add the layer to the view
if(showBuildings){
  // Next line syntax might be simplified on acceptance of this PR
  //    https://github.com/iTowns/itowns/pull/546
  itowns.View.prototype.addLayer.call(view, $3dTilesTemporalLayer);
}

// sky color
view.mainLoop.gfxEngine.renderer.setClearColor( 0x6699cc, 1);

// lights
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 0, 0, 20000 );
directionalLight.updateMatrixWorld();
view.scene.add( directionalLight );

var ambientLight = new THREE.AmbientLight( 0xffffff,0.5 );
ambientLight.position.set(0, 0, 3000 );
directionalLight.updateMatrixWorld();
view.scene.add( ambientLight );

return [ view, extent ];

}
