/**
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

 /**
  * Class that will handle tile management witch means requests to get tiles, creating meshes, class textures... *
  * @class VCC.TileManager
  * @constructor
  * @param {THREE.Object3D} root Parent object of the Scene Graph.
  * @param {int} sizetile Size of the tile.
  * @param {int} rangeCameraTile How far does we need to lead tiles wr to the main tile.
  * @param {int} mainTileX X coordinates of the tile that we want to create first
  * @param {int} mainTileY  Y coordinates of the tile that we want to create first
  * @param {int} BBmin Bounding Box minimum coordinate
  * @param {int} BBmax Bounding Box maximum coordinate
  **/
VCC.TileManager = function (root,sizeTile,rangeCameraTile,mainTileRow,mainTileCol,BBMin,BBMax){
	if(root == null){
		return;
	}
	this._root = root;

	/**
	* Default URL parameters to construct the request getTile.
	* @property urlParameters
	* @type Object
	*/
	this.urlParameters = {SERVICE: "W3DS",REQUEST: "GetTile", VERSION: "0.4.0",CRS: "lambert93", LAYER: "build",FORMAT: "application/json",TILELEVEL: "2",TILEROW:"", TILECOL:"" };
	//Tile de 500*500 soit 1 metre = 0.1

 	/**
	* Size of a tile
	* @property sizeTile
	* @type int
	*/
	this.sizeTile = sizeTile;

	/**
	* How far the tiles will be loaded
	* @property rangeCameraTile
	* @type int
	*/
	this.rangeCameraTile = rangeCameraTile ;

	/**
	* X coordinate of the main tile (in Json file coordinates)
	* @property mainTileX
	* @type int
	*/
	this.mainTileX = mainTileRow;

	/**
	* Y coordinate of the main tile (in Json file coordinates)
	* @property mainTileY
	* @type int
	*/
	this.mainTileY = mainTileCol;

	/** HotFix to make update main tile coodinate calculation work*/
	this.firstTileX = mainTileRow;
	this.firstTileY = mainTileCol;

	this.BBMin = BBMin;
	this.BBMax = BBMax;

	/**
	* Array containing all Tiles loadded
	* @property tabTile
	* @type Array<VCC.Tile>
	*/
	this.tabTile = [];


	this.TileMaxX = parseInt((this.BBMax[0]-this.BBMin[0])/this.sizeTile)-1;
	this.TileMaxY = parseInt((this.BBMax[1]-this.BBMin[1])/this.sizeTile)-1;

	/**
	*Current LOD of the scene
	* @property sceneLod
	* @type int
	*/
	this.sceneLod = 0;

	/**
	*Previous LOD of the scene
	* @property previousLod
	* @type int
	*/
	this.previousLod = 0;

	/**
	*Scheduler for request priorities
	* @property scheduler
	* @type VCC.Scheduler
	*/
	this.scheduler = new VCC.Scheduler();

	/**
	* Distance from where only dem il load when computing surrounding tiles
	* @property demDistance
	* @type Int
	*/
	this.demDistance = rangeCameraTile;
};

/**
* Check if the tile exists
* @method tileExist
* @return {bollean}
*/

VCC.TileManager.prototype.tileExist = function(idTile){
	return (this.tabTile[idTile] !== undefined);
};

/**
* Handle tiling management with respect to the range cameraTile property and LOD Strategy. Calls to the create Tile function
* @method tilePriorityManager
*
*/


VCC.TileManager.prototype.tilePriorityManager = function() {

	var idTile = this.mainTileX+"_"+this.mainTileY;
	if (!this.tileExist(idTile)){
		var task= new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM,this.mainTileX,this.mainTileY,"dem");
		task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_HIGH);
		task= new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM,this.mainTileX,this.mainTileY,"build");
		task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_HIGH);
		task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_TEXTURE,this.mainTileX,this.mainTileY);
		task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_HIGH);

	}
	var surroundingTilesIds = this.getSurroundingTilesIds();
	for (id in surroundingTilesIds){
		if (!this.tileExist(surroundingTilesIds[id][0]+"_"+surroundingTilesIds[id][1]) && (surroundingTilesIds[id][2] === undefined) ){
			var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM,surroundingTilesIds[id][0],surroundingTilesIds[id][1],"build");
			task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_LOW);
			task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM,surroundingTilesIds[id][0],surroundingTilesIds[id][1],"dem");
			task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_HIGH);
			surroundingTilesIds[id]["NeedTexture"] = true;
		}else if( !this.tileExist(surroundingTilesIds[id][0]+"_"+surroundingTilesIds[id][1]) && surroundingTilesIds[id][2] == "dem"){
			task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM,surroundingTilesIds[id][0],surroundingTilesIds[id][1],"dem");
			task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_LOW);
			surroundingTilesIds[id]["NeedTexture"] = true;
		}else if (surroundingTilesIds[id][2] === undefined){
			if (VCC.ViewPort.tileManager.tabTile[surroundingTilesIds[id][0]+"_"+surroundingTilesIds[id][1]].meshBuilding === undefined){
				var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM,surroundingTilesIds[id][0],surroundingTilesIds[id][1],"build");
				task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_LOW);
				surroundingTilesIds[id]["NeedTexture"] = true;
			}
			if (VCC.ViewPort.tileManager.tabTile[surroundingTilesIds[id][0]+"_"+surroundingTilesIds[id][1]].meshTerrain === undefined){
				task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM,surroundingTilesIds[id][0],surroundingTilesIds[id][1],"dem");
				task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_LOW);	
				surroundingTilesIds[id]["NeedTexture"] = true;
			}
		}
	}
	for (id in surroundingTilesIds){
		var tileRow = surroundingTilesIds[id][0];
		var tileCol = surroundingTilesIds[id][1];
		var tileId = tileRow+"_"+tileCol;
		if (VCC.ViewPort.tileManager.tabTile[tileId] !== undefined && surroundingTilesIds[id]["NeedTexture"]){
			//VCC.ViewPort.tileManager.tabTile[tileId].texturesManager.isScheduled=true;
			var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_TEXTURE,tileRow,tileCol);
			task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_LOW);
			task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_TEXTURE,tileRow,tileCol);
			task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_HIGH);
		}
	}
};

/**
* Computes the surrounding tiles of the camera
* @method getSurroundingTilesIds
* @return {Array} tileRow and tileCol of the 3 surrounding tiles
*/
VCC.TileManager.prototype.getSurroundingTilesIds = function(tile)
{
	var surroundingTilesIds = [];
	var mainTile = this.tabTile[this.mainTileX+"_"+this.mainTileY];
	if(mainTile === undefined){
		return [];
	}

	var middleX = parseInt((mainTile.BBMin[0]+mainTile.BBMax[0])/2 - VCC.ViewPort.tileManager.BBMin[0]);
	var middleY = parseInt((mainTile.BBMin[1]+mainTile.BBMax[1])/2 - VCC.ViewPort.tileManager.BBMin[1]);
	var mask = 0;
	 if(middleX < VCC.ViewPort.camera.position.x){
	 	mask += 1;
	 }
	if(middleY < VCC.ViewPort.camera.position.z){
		mask += 2;
	}

	switch (mask){
		case 0 :
				for (var x = 0; x <= this.rangeCameraTile; x++){
					for(var y = 0; y <= this.rangeCameraTile; y++){
						if( x >= this.demDistance || y >= this.demDistance){
							surroundingTilesIds.push([this.mainTileX-x,this.mainTileY-y,"dem"]);
						}else {
							surroundingTilesIds.push([this.mainTileX-x,this.mainTileY-y]);
						}
					}
				}
				break;
		 case 1 :
				for (var x = 0; x <= this.rangeCameraTile; x++){
					for(var y = 0; y <= this.rangeCameraTile; y++){
						if( x >= this.demDistance || y >= this.demDistance){
							surroundingTilesIds.push([this.mainTileX+x,this.mainTileY-y,"dem"]);
						}else {
							surroundingTilesIds.push([this.mainTileX+x,this.mainTileY-y]);
						}
					}
				}
				break;
		
		case 2 : case 1 :
				for (var x = 0; x <= this.rangeCameraTile; x++){
					for(var y = 0; y <= this.rangeCameraTile ; y++){
						if( x >= this.demDistance || y >= this.demDistance){
							surroundingTilesIds.push([this.mainTileX-x,this.mainTileY+y,"dem"]);
						}else {
							surroundingTilesIds.push([this.mainTileX-x,this.mainTileY+y]);
						}
					}
				}
				break;
		case 3 : case 1 :
				for (var x = 0; x <= this.rangeCameraTile; x++){
					for(var y = 0; y <= this.rangeCameraTile; y++){
						if( x >= this.demDistance || y >= this.demDistance){
							surroundingTilesIds.push([this.mainTileX+x,this.mainTileY+y,"dem"]);
						}else {
							surroundingTilesIds.push([this.mainTileX+x,this.mainTileY+y]);
						}
					}
				}
				break;
		default:
				console.log("mask error");
				return surroundingTilesIds;
	}
	return surroundingTilesIds;
};
/**
* rebuild scene with a new lod quality
* @TODO: rewrite to make it work with the new scheduler
* @method reloadWithNewLod
*/

VCC.TileManager.prototype.reloadWithNewLod = function(){
	//delete the scene
	for(var idTile in this.tabTile)
	{
		this.deleteTile(idTile,this.previousLod);
	}
	this.updateMainTile();
};

/**
* Request and create a textured Tile
* @method testTileTexture
* @param {String} tileRow identifier of the tile row (described in Json)
* @param {String} tileCol identifier of the tile column (described in Json)
* @param {String} layer   layer wanted, here "build" or "dem"
*/

VCC.TileManager.prototype.createTile = function (tileRow,tileCol,layer){

	this.urlParameters["REQUEST"]   = "GetTile";
	this.urlParameters["LAYER"]     = layer;
	this.urlParameters["TILELEVEL"] = "2";
	this.urlParameters["TILEROW"]   = tileRow;
	this.urlParameters["TILECOL"]   = tileCol;

	var urlServer =VCC.ViewPort.serverUrl+"/api/kvp?";

	for (var key in this.urlParameters)
	{
		urlServer+= key+"="+this.urlParameters[key]+"&";
	}
	//remove last "&"
	urlServer = urlServer.substring(0, urlServer.length - 1);

	var json = $.ajax({
			url: urlServer,
			dataType: 'json',
			async : true,
			success: function()
			{
				try{
		 			var jsonParsed = JSON.parse(json.responseText);
		 		}catch(e)
		 		{
		 			console.error("Parsing error:", e);
		 		}
		 		var tile = VCC.ViewPort.tileManager.tabTile[tileRow+"_"+tileCol];
		 		var addMeshBuildingsToScene = false;
		 		var addMeshTerrainToScene = false;
		 		var geom = new THREE.Geometry();
		 		if (jsonParsed.listBldg !== undefined && !jQuery.isEmptyObject(jsonParsed.listBldg) && tile!==undefined )
		 		{
		 			for(b in jsonParsed.listBldg){
		 				var wallArrayGeom = VCC.ViewPort.tileManager.createGeometries(jsonParsed.listBldg[b].walls, tile.texturesManager,tile.indexBuildingMaterialList);
		 				var roofArrayGeom = VCC.ViewPort.tileManager.createGeometries(jsonParsed.listBldg[b].roofs, tile.texturesManager,tile.indexBuildingMaterialList);
						geom.merge(wallArrayGeom);
						geom.merge(roofArrayGeom);
					}
					addMeshBuildingsToScene = true;
					VCC.ViewPort.tileManager.tabTile[tileRow+"_"+tileCol] = tile;

		 		 }else if (jsonParsed.listTerrain !== undefined && !jQuery.isEmptyObject(jsonParsed.listTerrain)){
		 		 	for(t in jsonParsed.listTerrain){
		 		 		var terrainGeom = VCC.ViewPort.tileManager.createGeometries(jsonParsed.listTerrain[t].terrain, tile.texturesManager, tile.indexTerrainMaterialList);
		 		 		geom.merge(terrainGeom);
		 		 		addMeshTerrainToScene = true;
				 	}
				 	tile.BBMin = jsonParsed.min;
					tile.BBMax = jsonParsed.max;
					VCC.ViewPort.tileManager.tabTile[tileRow+"_"+tileCol] = tile;
		 		}
		 		if (addMeshTerrainToScene){
		 			 VCC.ViewPort.tileManager.tabTile[tileRow+"_"+tileCol].meshTerrain = new THREE.Mesh(geom,new THREE.MeshFaceMaterial(VCC.ViewPort.tileManager.tabTile[tileRow+"_"+tileCol].texturesManager.materialsArray));
					 VCC.ViewPort.scene.add(VCC.ViewPort.tileManager.tabTile[tileRow+"_"+tileCol].meshTerrain);
		 		}
		 		if (addMeshBuildingsToScene){
		 			VCC.ViewPort.tileManager.tabTile[tileRow+"_"+tileCol].meshBuilding = new THREE.Mesh(geom,new THREE.MeshFaceMaterial(VCC.ViewPort.tileManager.tabTile[tileRow+"_"+tileCol].texturesManager.materialsArray));
					VCC.ViewPort.scene.add(VCC.ViewPort.tileManager.tabTile[tileRow+"_"+tileCol].meshBuilding);
		 		}
			},
			error: function(jqhr, status, errorThrown){
				console.log("error : "+ errorThrown );
				delete VCC.ViewPort.tileManager.tabTile[tileRow+"_"+tileCol];
				VCC.ViewPort.tileManager.scheduler.onTaskDone();
			},
			complete: function(){
				VCC.ViewPort.tileManager.scheduler.onTaskDone();
			}

		});
};

/**
* Create geometries and UV mapping for buildings
* @method createGeometries
* @param {String} jsonDataList Json List of items to be created
* @param {VCC.TexturesManager} texturesManager TexturesManager of the tile we are creating
* @param {Array} indexMaterialList List of index material (from VCC.Tile)
* @return {THREE.Geometry} geom Merged geometry of the tile layer
*/

VCC.TileManager.prototype.createGeometries = function(jsonDataList, texturesManager, indexMaterialList){
	var geom = new THREE.Geometry();
	for(w in jsonDataList){
		if (w !== "nbFace"){

			/** For each par of the wall we vreate vertices and faces thar we push in the geometry */
			var wallGeom = new THREE.Geometry();
			var nbVertices = (jsonDataList[w].listGeometries.length)/3;
			for(var v = 0 ; v < nbVertices; v++ ){
				var offset = v*3;
				var vertice = new THREE.Vector3();
				vertice.setX((jsonDataList[w].listGeometries[offset] ) - VCC.ViewPort.tileManager.BBMin[0] - VCC.ViewPort.offsetPosition.x );
				vertice.setY((jsonDataList[w].listGeometries[offset+2])- VCC.ViewPort.tileManager.BBMin[2]);
									vertice.setZ((jsonDataList[w].listGeometries[offset+1])- VCC.ViewPort.tileManager.BBMin[1] - VCC.ViewPort.offsetPosition.z );  //!\\ y is up
									wallGeom.vertices.push(vertice);
			};
			var nbTri = (jsonDataList[w].listIndices.length)/3;
			for(var f = 0; f < nbTri ;f++)
			{
				var offset = f*3;

				var offsetUVs1 = jsonDataList[w].listIndices[offset]*2;
				var offsetUVs2 = jsonDataList[w].listIndices[offset+1]*2;
				var offsetUVs3 = jsonDataList[w].listIndices[offset+2]*2;

				var face = new THREE.Face3();

				face.a = jsonDataList[w].listIndices[offset];
				face.b = jsonDataList[w].listIndices[offset+1];
				face.c = jsonDataList[w].listIndices[offset+2];
				face.normal = new THREE.Vector3(
					jsonDataList[w].listNormals[offset],
					jsonDataList[w].listNormals[offset+1],
					jsonDataList[w].listNormals[offset+2]);
				face.materialIndex = texturesManager.getIndexMaterial(jsonDataList[w].texture, indexMaterialList);
				wallGeom.faces.push(face);
				/** Uv Mapping creation  (try to map index of vertice into listUVs)*/
				wallGeom.faceVertexUvs[0].push([
					new THREE.Vector2(jsonDataList[w].listUVs[offsetUVs1], jsonDataList[w].listUVs[offsetUVs1+1]),
					new THREE.Vector2(jsonDataList[w].listUVs[offsetUVs2], jsonDataList[w].listUVs[offsetUVs2+1]),
					new THREE.Vector2(jsonDataList[w].listUVs[offsetUVs3], jsonDataList[w].listUVs[offsetUVs3+1])
					]);
			}
			geom.merge(wallGeom);
		}
	}
	return geom;
};

/**
* Delete a tile
* @method deleteTile
* @param {int} idTile Id of the tile we want to delete
*/

VCC.TileManager.prototype.deleteTile = function(idTile,layerCode)
{
	if(this.tileExist(idTile)){
		switch(layerCode){

			case VCC.Enum.DELETION_LAYER.DL_ALL : 
				if (VCC.ViewPort.tileManager.tabTile[idTile].meshTerrain !== undefined){
					VCC.ViewPort.scene.remove(VCC.ViewPort.tileManager.tabTile[idTile].meshTerrain);
					//console.log("Removing terrain of tile " + idTile);
					if (VCC.ViewPort.tileManager.tabTile[idTile].meshTerrain.geometry !== undefined){
						VCC.ViewPort.tileManager.tabTile[idTile].meshTerrain.geometry.dispose();
					}
					VCC.ViewPort.tileManager.tabTile[idTile].texturesManager.disposeMaterials(VCC.ViewPort.tileManager.tabTile[idTile].indexTerrainMaterialList);
				}
				if (VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding !== undefined){
					VCC.ViewPort.scene.remove(VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding);
					//console.log("Removing Building of tile " + idTile);
					if (VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding.geometry !== undefined){
						VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding.geometry.dispose();
					}
					VCC.ViewPort.tileManager.tabTile[idTile].texturesManager.disposeMaterials(VCC.ViewPort.tileManager.tabTile[idTile].indexBuildingMaterialList);
				}
				delete VCC.ViewPort.tileManager.tabTile[idTile];
				break;
			case VCC.Enum.DELETION_LAYER.DL_BUILDING :
				if (VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding !== undefined){
					VCC.ViewPort.scene.remove(VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding);
					//console.log("Removing Building of tile " + idTile);
					if (VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding.geometry !== undefined){
						VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding.geometry.dispose();
					}
					VCC.ViewPort.tileManager.tabTile[idTile].texturesManager.disposeMaterials(VCC.ViewPort.tileManager.tabTile[idTile].indexBuildingMaterialList,VCC.ViewPort.tileManager.tabTile[idTile].indexTerrainMaterialList);
					VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding = undefined;
				}
				if (VCC.ViewPort.tileManager.tabTile[idTile].meshTerrain === undefined){
				 	delete VCC.ViewPort.tileManager.tabTile[idTile];
				}
				break;
			case VCC.Enum.DELETION_LAYER.DL_TERRAIN : 
				break;
			default : 
				console.error("Layer not Known : ");
				console.error(layerCode);
				break;
		}
	}
};

/**
* Calculate the current LOD and trigger reloadWithNewLod()
* @method lodChange
*/

VCC.TileManager.prototype.lodChange = function(){
	var y = parseInt(VCC.ViewPort.camera.position.y);

	var lod = parseInt(y/300);
	//if the LOD change
	if(lod !== this.sceneLod)
	{
		this.previousLod = this.sceneLod;
		this.sceneLod = lod;
		//this.reloadWithNewLod();
	}
};

/**
* Calculate the main tile (where the camera belongs) and triger the tilePriorityManager to remove far tiles
* @method updateMainTile
*/

VCC.TileManager.prototype.updateMainTile = function()
{

	var posX, posZ, mTileX, mTileY;
	posX = Math.floor((VCC.ViewPort.camera.position.x + VCC.ViewPort.offsetPosition.x )/this.sizeTile) + this.firstTileX;
	posZ = Math.floor((VCC.ViewPort.camera.position.z + VCC.ViewPort.offsetPosition.z )/this.sizeTile) + this.firstTileY;
	mTileX = posX;
	mTileY = posZ;

	if(mTileX !== this.mainTileX || mTileY !== this.mainTileY)
	{
		this.mainTileX = mTileX;
		this.mainTileY = mTileY;
		this.deleteObjetOutOfScene();
		this.tilePriorityManager();
	}
};

/**
* Check if the tile coordinates given in arguments are in view of the camera and order layer deletion if needed
* @method tileNeedDropLayer
* @return {VCC.Enum.DELETION_LAYER}
*/

VCC.TileManager.prototype.tileNeedDropLayer = function (X, Y)
{
	if(X < this.mainTileX + this.rangeCameraTile && X > this.mainTileX - this.rangeCameraTile && Y < this.mainTileY + this.rangeCameraTile  && Y > this.mainTileY - this.rangeCameraTile)
	{
		return false;
	}
	if(X > this.mainTileX + this.rangeCameraTile || X < this.mainTileX - this.rangeCameraTile || Y > this.mainTileY + this.rangeCameraTile  || Y < this.mainTileY - this.rangeCameraTile)
	{

		return VCC.Enum.DELETION_LAYER.DL_ALL;
	}
	else{
		return VCC.Enum.DELETION_LAYER.DL_BUILDING;
	}
	
};


/**
* Trigger the deleteTile function if a tile is detected as out of view
* @method isInSquare
*/

VCC.TileManager.prototype.deleteObjetOutOfScene = function()
{
	var coord;
	for(var idTile in this.tabTile)
	{
		coord = idTile.split('_');
		var needDrop = this.tileNeedDropLayer(coord[0],coord[1]);

		if(needDrop !== false && needDrop !== undefined)
		{	
			this.scheduler.removeFifo.push([coord,needDrop]);
		}
	}
};

/**
* Remove only Building of a tile
*
*@method cleanBuildings
*@param {String} idTile Id of the tile we want to clean buildings on.
*/

VCC.TileManager.prototype.cleanBuildings = function(idTile){
	if (this.tileExist(idTile)){
		VCC.ViewPort.scene.remove(VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding);
		VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding.geometry.dispose();
		VCC.ViewPort.tileManager.tabTile[idTile].meshBuilding = new THREE.Mesh(new THREE.Geometry(),new THREE.MeshFaceMaterial(VCC.ViewPort.tileManager.tabTile[idTile].texturesManager.materialsArray));
		VCC.ViewPort.tileManager.tabTile[idTile].texturesManager.disposeMaterials(VCC.ViewPort.tileManager.tabTile[idTile].indexBuildingMaterialList,VCC.ViewPort.tileManager.tabTile[idTile].indexTerrainMaterialList);
		VCC.ViewPort.tileManager.tabTile[idTile].hasBuildings = false;
	}
};
