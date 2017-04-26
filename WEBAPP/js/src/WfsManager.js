/** 
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 * OpenLayer request and handling response Manager
 * @class VCC.WfsManager
 * @constructor
 */

VCC.WfsManager = function (){

	//this.treeTexture = THREE.ImageUtils.loadTexture('arbre.png');
	
	// Was used for billboard trees but because it is no simple to orient the billboad the functionnality was posponed
	// this.treeGeometry = new THREE.PlaneGeometry(1, 1);
	// var geometry2 = new THREE.PlaneGeometry(1, 1);
	// var rotationMatrix = new THREE.Matrix4();
	// rotationMatrix.makeRotationY(Math.PI/2);
	// geometry2.applyMatrix(rotationMatrix);
	// this.treeGeometry.merge(geometry2);
	// End bill board part


	/**
	 * Layers Data array containing url parameters for openLayer data request
	 * @property urlDatas
	 * @type Array[String]
	 */
	this.urlDatas = VCC.ViewPort.config.openLayerData;
}



/**
  * Send a request to get openLayers Data
  * @method getData
  * @params {String} tileID Id of the tile we want to add data to
  * @params {Array[int]} BBoxMin Minimum coordinates of the data bounding box
  * @params {Array[int]} BBoxMax Maximum coordinates of the data bounding box
  * @params {String} idLayer id of the layer we want 
  */
VCC.WfsManager.prototype.getData = function(tileId,BBoxMin,BBoxMax, idLayer){

VCC.ViewPort.tileManager.tabTile[tileId].openLayerMeshes[idLayer] = ""; // avoid several calls for the same mesh
var urlData = this.urlDatas[idLayer][0]+"&BBox="+BBoxMin[0]+","+BBoxMin[1]+","+BBoxMax[0]+","+BBoxMax[1];
var geoJson = $.ajax({
		url: urlData,
		dataType: 'json',
		async: true,
		success: function(){
			try {
				this.olData = JSON.parse(geoJson.responseText);
			} catch (e) {
				console.error("Parsing error:", e);
			}
		},
		error: function(jqhr, status, errorThrown){
			console.log("error" + errorThrown);
		},
		complete: function(){
			VCC.ViewPort.tileManager.wfsManager.generateCubes(this.olData,tileId,idLayer);
			VCC.ViewPort.tileManager.scheduler.onTaskDone();
		}
	});
}



/**
  *Generate cubes at openlayer location
  * @method generateCubes
  * @params {Object} json GeoJson data 
  * @params {String} tileId tileID Id of the tile we want to add data to
  * @params {Array[int]} BBoxMax Maximum coordinates of the data bounding box
  * @params {String} idLayer id of the layer we want 
  */
VCC.WfsManager.prototype.generateCubes = function(json, tileId, idLayer){
	var direction = new THREE.Vector3(0,1,0); // world down 
	var raycaster = new THREE.Raycaster();
	var dataColor = 0xaaaaaa;
	if(this.urlDatas[idLayer][2]!== undefined){
		dataColor = this.urlDatas[idLayer][2];
	}

	var material = new THREE.MeshLambertMaterial( { color:dataColor,ambient:dataColor } );
	var property = this.urlDatas[idLayer][3];
	var mesh = new THREE.Mesh(new THREE.Geometry(), material);
	
	/* If there is no data on OL server the json is empty hence json.feature === undefined*/
	if(json === undefined || json.features === undefined){
		return;
	}
	for (var i = 0; i< json.features.length; i++){
		var origin = new THREE.Vector3();
		var geometry = new THREE.BoxGeometry( 1, 1, 1 );

		origin.x =  json.features[i].geometry.coordinates[0] - VCC.ViewPort.tileManager.BBMin[0];
		origin.y = -2000;
		origin.z = json.features[i].geometry.coordinates[1] - VCC.ViewPort.tileManager.BBMin[1];
		raycaster.set(origin,direction);
		var intersection = raycaster.intersectObject(VCC.ViewPort.tileManager.tabTile[tileId].layersMeshes["dem"][0][0],false);

		if(json.features[i].properties[property] > 0){
			var scaleMatrix = new THREE.Matrix4();
			scaleMatrix.scale(new THREE.Vector4(5,json.features[i].properties[property],5,1));
			geometry.applyMatrix(scaleMatrix);
			var offsetY = json.features[i].properties[property]/2;
		}else{
			var scaleMatrix = new THREE.Matrix4();
			scaleMatrix.scale(new THREE.Vector4(5,20,5,2));
			geometry.applyMatrix(scaleMatrix);
			var offsetY = 10;
		}

		if(intersection[0] !== undefined){
			geometry.applyMatrix(new THREE.Matrix4().makeTranslation(origin.x, intersection[0].point.y - offsetY, origin.z));
		}else{
			geometry.applyMatrix(new THREE.Matrix4().makeTranslation(origin.x, 0 - offsetY, origin.z));
		}
		mesh.geometry.merge(geometry);
	}

	VCC.ViewPort.scene.add(mesh);
	VCC.ViewPort.tileManager.tabTile[tileId].openLayerMeshes[idLayer]=mesh;
}

// Generate billboard trees still here but not used because we do not use billboard anymore
VCC.WfsManager.prototype.generateTrees = function(json, tileId, id){
	var direction = new THREE.Vector3(0,1,0); // camera down 
	var raycaster = new THREE.Raycaster();
	var material = new THREE.MeshLambertMaterial( { color:0x00ff00, transparent:true, opacity:0.9,side: THREE.DoubleSide, map: this.treeTexture } );
	var mesh = new THREE.Mesh(new THREE.Geometry(), material);
	for (var i = 0 ;i< json.features.length; i++){

		var origin = new THREE.Vector3();
		var object = this.treeGeometry.clone();
		origin.x =  json.features[i].geometry.coordinates[0] - VCC.ViewPort.tileManager.BBMin[0];
		origin.y = -2000;
		origin.z = json.features[i].geometry.coordinates[1] - VCC.ViewPort.tileManager.BBMin[1];
		raycaster.set(origin,direction);
		var intersection = raycaster.intersectObject(VCC.ViewPort.tileManager.tabTile[tileId].layersMeshes["dem"][0][0],false); 


		if(json.features[i].properties["hauteurtotale_m"] > 0){
			var scaleMatrix = new THREE.Matrix4();
			scaleMatrix.scale(new THREE.Vector4(10,json.features[i].properties["hauteurtotale_m"],10,1));
			object.applyMatrix(scaleMatrix);
		}else{
			var scaleMatrix = new THREE.Matrix4();
			scaleMatrix.scale(new THREE.Vector4(10,10,10,1));
			object.applyMatrix(scaleMatrix);
		}

		object.applyMatrix(new THREE.Matrix4().makeTranslation(origin.x, intersection[0].point.y - json.features[i].properties["hauteurtotale_m"]/2, origin.z));
		mesh.geometry.merge(object);

	}

	var testMatrix = new THREE.Matrix4();
	testMatrix.makeRotationY(Math.PI/20);
	//mesh.geometry.applyMatrix(testMatrix);
	VCC.ViewPort.scene.add(mesh);
	VCC.ViewPort.tileManager.tabTile[tileId].openLayerMeshes[id]=mesh;

}
