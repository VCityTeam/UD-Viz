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

 VCC.TileManager = function(root, sizeTile, rangeCameraTile, mainTileRow, mainTileCol, BBMin, BBMax, city, demDistance) {
   if (root == null) {
     return;
   }
   this._root = root;


   if (demDistance === undefined)
      demDistance = rangeCameraTile;
   /**
    * Default URL parameters to construct the request getTile.
    * @property urlParameters
    * @type Object
    */
   this.urlParameters = {
     SERVICE: "W3DS",
     REQUEST: "GetTile",
     VERSION: "0.4.0",
     CRS: "lambert93",
     LAYER: "build",
     FORMAT: "application/json",
     TILELEVEL: "2",
     TILEROW: "",
     TILECOL: "",
     CITY: city
   };

   /**
    * Size of a tile
    * @property sizeTile
    * @type int
    */
   this.sizeTile = sizeTile;



   /** HotFix to make update main tile coodinate calculation work*/
   this.firstTileX = VCC.ViewPort.config.firstTileX;
   this.firstTileY = VCC.ViewPort.config.firstTileY;

   /**bounding box of the main tile */
   this.BBMin = BBMin;
   this.BBMax = BBMax;

   /**
    * Array containing all Tiles loadded
    * @property tabTile
    * @type Array<VCC.Tile>
    */
   this.tabTile = [];



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
    * resolution of the main tile's textures 
    * @property mainTileTextureResolution
    * @type Int
    */
   this.mainTileTextureResolution = 1;

   /**
    * resolution of the other tile's textures 
    * @property surroundingTileTextureResolution
    * @type Int
    */
   this.surroundingTileTextureResolution = 0;

   

    /**
    * Array of tooltips, all are displayed 
    * @property tooltipsArray
    * @type Array[VCC.Tooltip]
    */
   this.tooltipsArray = new Array();


    /**
    * Array tile Ids, this is filled when 404 not found errors are returned by the server and is used not to request them again
    * @property noTilesAtPosition
    * @type Array[String]
    */
   this.noTilesAtPosition = new Array(); 

   /**
    * Manager for Web Features Services datas (OpenLayers)
    * @property wfsManager
    * @type VCC.WfsManager
    */
   this.wfsManager = new VCC.WfsManager();
 };;
 /**
  * Check if the tile exists
  * @method tileExist
  * @return {bollean}
  */

 VCC.TileManager.prototype.tileExist = function(idTile) {
   return (this.tabTile[idTile] !== undefined);
 };

 
  /**
  * Check if the tile wa want to create is in data limits (or exists on the server)
  * @method inLimits
  * @param {int} X X coordinate of the tile
  * @param {int} Y Y coordinate of the tile
  */
 VCC.TileManager.prototype.inLimits = function(X,Y){
  if(!(X >= VCC.ViewPort.config.tileXLimit[0] || X <= VCC.ViewPort.config.tileXLimit[1]) && (Y >= VCC.ViewPort.config.tileYLimit[0] || Y <= VCC.ViewPort.config.tileYLimit[1])){
    return false;
  }
  for (var i=0; i < this.noTilesAtPosition.length ; i++){
    if (X == this.noTilesAtPosition[i][0] && Y == this.noTilesAtPosition[i][1]){
      return false;
    }
  }
  return true;
 }

 /**
  * Request and create a textured Tile
  * @method testTileTexture
  * @param {String} tileRow identifier of the tile row (described in Json)
  * @param {String} tileCol identifier of the tile column (described in Json)
  * @param {String} layer   layer wanted, here "build" or "dem"
  */

 VCC.TileManager.prototype.createTile = function(tileRow, tileCol, layer) {

   this.urlParameters["REQUEST"] = "GetTile";
   this.urlParameters["LAYER"] = layer;
   this.urlParameters["TILEROW"] = tileRow;
   this.urlParameters["TILECOL"] = tileCol;

   var urlServer = VCC.ViewPort.serverUrl + "/api/kvp?";

   for (var key in this.urlParameters) {
     urlServer += key + "=" + this.urlParameters[key] + "&";
   }
   //remove last "&"
   urlServer = urlServer.substring(0, urlServer.length - 1);

   var json = $.ajax({
     url: urlServer,
     dataType: 'json',
     async: true,
     success: function() {
       try {
         var startTime = new Date().getTime();
         // var elapsedTime = 0;
          var jsonParsed = JSON.parse(json.responseText);
         // elapsedTime = new Date().getTime() - startTime;
         // console.log("Elapsed time for parsing JSON " + elapsedTime);

       } catch (e) {
         console.error("Parsing error:", e);
       }
       if (layer !=="lidar"){
        VCC.ViewPort.tileManager.generateMesh(jsonParsed, tileRow,tileCol,layer);
       }else{
        VCC.ViewPort.tileManager.generatePointCloud(jsonParsed, tileRow,tileCol,layer);
       }
     },
     error: function(jqhr, status, errorThrown) {
       console.log("error : " + errorThrown);
       if(VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol] === undefined || VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes["dem"] === undefined){
          VCC.ViewPort.tileManager.noTilesAtPosition.push([tileRow,tileCol]);
          delete VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol];
       }
       //VCC.ViewPort.tileManager.scheduler.onTaskDone();
     },
     complete: function() {
       VCC.ViewPort.tileManager.scheduler.onTaskDone();
     }

   });
 };


VCC.TileManager.prototype.generateMesh = function(jsonParsed,tileRow,tileCol,layer){

   var tile = VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol];
       var addMeshTerrainToScene = false;
       startTime = new Date().getTime();
     //  var elapsedTime = 0;


     /*** see if it's possible to replace listBldg eand listTerrain by something elseto do something like:: if layer match layerName in tile.layers DO : parse item + add to scene END*/

       if (jsonParsed.listBldg !== undefined && !jQuery.isEmptyObject(jsonParsed.listBldg) && tile !== undefined && VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0] !== undefined) {
         for (b in jsonParsed.listBldg) {
           var geom = new THREE.Geometry();
           var wallArrayGeom = VCC.ViewPort.tileManager.createGeometries(jsonParsed.listBldg[b].walls, tile.texturesManager, tile.indexBuildingMaterialList);
           var roofArrayGeom = VCC.ViewPort.tileManager.createGeometries(jsonParsed.listBldg[b].roofs, tile.texturesManager, tile.indexBuildingMaterialList, true);
           // geom.merge(wallArrayGeom);
           // geom.merge(roofArrayGeom);
           //VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0].push(new THREE.Mesh(geom, new THREE.MeshFaceMaterial(VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].texturesManager.loadingMaterial)));           
           VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0].push(new THREE.Mesh(roofArrayGeom, new THREE.MeshFaceMaterial(VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].texturesManager.loadingMaterial)));           
           VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0].push(new THREE.Mesh(wallArrayGeom, new THREE.MeshFaceMaterial(VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].texturesManager.loadingMaterial)));           
           //add custom fied semantic to mesh
           VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0][VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0].length-1].semantic = jsonParsed.listBldg[b].semantique;
           VCC.ViewPort.scene.add(VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0][VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0].length-1]);  
           VCC.ViewPort.scene.add(VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0][VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0].length-2]);  

         }
         VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol] = tile;

       } else if (jsonParsed.listTerrain !== undefined && !jQuery.isEmptyObject(jsonParsed.listTerrain)) {
          var geom = new THREE.Geometry();

         for (t in jsonParsed.listTerrain) {
           var terrainGeom = VCC.ViewPort.tileManager.createGeometries(jsonParsed.listTerrain[t].terrain, tile.texturesManager, tile.indexTerrainMaterialList);
           geom.merge(terrainGeom);
           addMeshTerrainToScene = true;
         }

         VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol] = tile;
       }
       if (addMeshTerrainToScene) {
         VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0].push(new THREE.Mesh(geom, new THREE.MeshFaceMaterial(VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].texturesManager.loadingMaterial)));
         VCC.ViewPort.scene.add(VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0][0]);
       }
       // elapsedTime = new Date().getTime() - startTime;
       // console.log("Elapsed time for generating Geometry " + elapsedTime);

};

VCC.TileManager.prototype.generatePointCloud = function(jsonParsed,tileRow,tileCol,layer){
  //  1 Non classé 
  // 4 Végétation moyenne 
  // 8 Model Key Point 
  // 9 Eau   
  // 10 Ponts
  var colorIndex=[];
  colorIndex[1] = 0xffffff; // white
  colorIndex[4] = 0x00ff00; // green
  colorIndex[8] = 0xaaaaaa; // grey
  colorIndex[9] = 0x0000ff; // blue
  var pc_geom = new THREE.BufferGeometry();
  var PI2 = Math.PI * 2;
  var elapsedTime = 0;
  var startTime = new Date().getTime() ;

  var position = new Float32Array( 28668540);
  var colors = new Float32Array( 28668540); 
  var color = new THREE.Color();

  console.log("let's go");
  var i = 0;
  console.log(jsonParsed);
  for (var i = 0; i< 28668540 -3; i+=3){
    position[i] = parseInt(jsonParsed["vertices"][i])-  VCC.ViewPort.tileManager.BBMin[0];
    position[i+2]= parseInt(jsonParsed["vertices"][i+1])- VCC.ViewPort.tileManager.BBMin[1];
    position[i+1]= -parseInt(jsonParsed["vertices"][i+2])- VCC.ViewPort.tileManager.BBMin[2];

    color.setHex(colorIndex[parseInt(jsonParsed["Color"][i/3])]);
    colors[i]   = color.r;
    colors[i+1] = color.g;
    colors[i+2] = color.b;
  }
  console.log("ending loop");

  pc_geom.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ) );
  pc_geom.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

  pc_geom.computeBoundingSphere();

  var pc = new THREE.PointCloud(pc_geom, new THREE.PointCloudMaterial({size:1, sizeAttenuation:false, vertexColors: THREE.VertexColors}));
  //var pc = new THREE.PointCloud(pc_geom, new THREE.PointCloudMaterial({size:1, sizeAttenuation:false, color: 0xff0000}));

  pc.position.x = -0;
  pc.position.y = -0;
  pc.position.z = -0;

  VCC.ViewPort.tileManager.tabTile[tileRow + "_" + tileCol].layersMeshes[layer][0].push(pc);
  VCC.ViewPort.scene.add(pc);

  elapsedTime = new Date().getTime() - startTime;
  console.log("Elapsed gelerating the pointcloud" + elapsedTime);

};

 /**
  * Create geometries and UV mapping for buildings
  * @method createGeometries
  * @param {String} jsonDataList Json List of items to be created
  * @param {VCC.TexturesManager} texturesManager TexturesManager of the tile we are creating
  * @param {Array} indexMaterialList List of index material (from VCC.Tile)
  * @return {THREE.Geometry} geom Merged geometry of the tile layer
    Roof param is a trick to have another default material for roofs
  */

 VCC.TileManager.prototype.createGeometries = function(jsonDataList, texturesManager, indexMaterialList, roof) {
   var geom = new THREE.Geometry();
   for (w in jsonDataList) {
     if (w !== "nbFace") {

       /** For each par of the wall we vreate vertices and faces thar we push in the geometry */
       var wallGeom = new THREE.Geometry();
       var nbVertices = (jsonDataList[w].listGeometries.length) / 3;
       for (var v = 0; v < nbVertices; v++) {
         var offset = v * 3;
         var vertice = new THREE.Vector3();
         vertice.setX((jsonDataList[w].listGeometries[offset]) - VCC.ViewPort.tileManager.BBMin[0] - VCC.ViewPort.offsetPosition.x);
         vertice.setY(-(jsonDataList[w].listGeometries[offset + 2]) - VCC.ViewPort.tileManager.BBMin[2]);
         vertice.setZ((jsonDataList[w].listGeometries[offset + 1]) - VCC.ViewPort.tileManager.BBMin[1] - VCC.ViewPort.offsetPosition.z); //!\\ y is up
         wallGeom.vertices.push(vertice);
       };
       var nbTri = (jsonDataList[w].listIndices.length) / 3;
       for (var f = 0; f < nbTri; f++) {
         var offset = f * 3;

         var offsetUVs1 = jsonDataList[w].listIndices[offset] * 2;
         var offsetUVs2 = jsonDataList[w].listIndices[offset + 1] * 2;
         var offsetUVs3 = jsonDataList[w].listIndices[offset + 2] * 2;

         var face = new THREE.Face3();

         face.a = jsonDataList[w].listIndices[offset];
         face.b = jsonDataList[w].listIndices[offset + 1];
         face.c = jsonDataList[w].listIndices[offset + 2];


          // For the moment recompute the normals (because data values are not Z)
           // face.normal = new THREE.Vector3(
           //   jsonDataList[w].listNormals[offset],
           //   jsonDataList[w].listNormals[offset + 1],
           //   jsonDataList[w].listNormals[offset + 2]);
         if(this.urlParameters.CITY == "paris"){
          face.materialIndex = texturesManager.getIndexMaterial(jsonDataList[w].texture);
         }else {
          face.materialIndex = texturesManager.getIndexMaterial(jsonDataList[w].texture.substring(jsonDataList[w].texture.lastIndexOf("/")+1,jsonDataList[w].texture.length), indexMaterialList, roof);
         }
         wallGeom.faces.push(face);
         /** Uv Mapping creation  (try to map index of vertice into listUVs)*/
         wallGeom.faceVertexUvs[0].push([
           new THREE.Vector2(jsonDataList[w].listUVs[offsetUVs1], jsonDataList[w].listUVs[offsetUVs1 + 1]),
           new THREE.Vector2(jsonDataList[w].listUVs[offsetUVs2], jsonDataList[w].listUVs[offsetUVs2 + 1]),
           new THREE.Vector2(jsonDataList[w].listUVs[offsetUVs3], jsonDataList[w].listUVs[offsetUVs3 + 1])
         ]);
       }
       geom.merge(wallGeom);
     }
   }
   geom.computeFaceNormals();
   return geom;
 };

 /**
  * Delete a tile
  * @method deleteTile
  * @param {int} idTile Id of the tile we want to delete
  */

 VCC.TileManager.prototype.deleteTile = function(idTile, layerCode) {
    if( layerCode ==VCC.Enum.DELETION_LAYER.DL_ALL){
      for (layerCode in this.tabTile[idTile].layersMeshes){
        this.removeLayer(idTile,layerCode);
      }
      this.tabTile[idTile].texturesManager.dispose();
      for (var i in this.tabTile[idTile].openLayerMeshes){
        VCC.ViewPort.scene.remove(this.tabTile[idTile].openLayerMeshes[i]);
        //this.tabTile[idTile].openLayerMeshes[i].geometry.dispose(); //TODO try to remove it to see if merge has worked
        delete this.tabTile[idTile].openLayerMeshes[i];
      }
      delete this.tabTile[idTile];
    }
 };

 /**
  * Calculate the main tile (where the camera belongs) and triger the tilePriorityManager to remove far tiles
  * @method updateMainTile
  */

 VCC.TileManager.prototype.updateMainTile = function() {

   var posX, posZ, mTileX, mTileY;
   posX = Math.floor((VCC.ViewPort.camera.position.x + VCC.ViewPort.offsetPosition.x) / this.sizeTile) + this.firstTileX;
   posZ = Math.floor((VCC.ViewPort.camera.position.z + VCC.ViewPort.offsetPosition.z) / this.sizeTile) + this.firstTileY;
   mTileX = posX;
   mTileY = posZ;

   if (mTileX !== this.strategyManager.mainTileX || mTileY !== this.strategyManager.mainTileY) {
     this.strategyManager.mainTileX = mTileX;
     this.strategyManager.mainTileY = mTileY;
     this.deleteObjetOutOfScene();
     this.tabTile[this.strategyManager.mainTileX + "_" + this.strategyManager.mainTileY].texturesManager.increaseResolution(this.mainTileTextureResolution);
     this.strategyManager.tilePriorityManager();
   }
 };

 /**
  * Check if the tile coordinates given in arguments are in view of the camera and order layer deletion if needed
  * TODO : Move it in strategyManager
  * @method tileNeedDropLayer
  * @return {VCC.Enum.DELETION_LAYER}
  */

 VCC.TileManager.prototype.tileNeedDropLayer = function(X, Y) {
   if (X < this.strategyManager.mainTileX + this.strategyManager.rangeCameraTile && X > this.strategyManager.mainTileX - this.strategyManager.rangeCameraTile && Y < this.strategyManager.mainTileY + this.strategyManager.rangeCameraTile && Y > this.strategyManager.mainTileY - this.strategyManager.rangeCameraTile) {
     return false;
   }
   if (X > this.strategyManager.mainTileX + this.strategyManager.rangeCameraTile || X < this.strategyManager.mainTileX - this.strategyManager.rangeCameraTile || Y > this.strategyManager.mainTileY + this.strategyManager.rangeCameraTile || Y < this.strategyManager.mainTileY - this.strategyManager.rangeCameraTile) {
     return VCC.Enum.DELETION_LAYER.DL_ALL;
   } else if (X >= this.strategyManager.mainTileX + this.strategyManager.demDistance || X <= this.strategyManager.mainTileX - this.strategyManager.demDistance || Y >= this.strategyManager.mainTileY + this.strategyManager.demDistance || Y <= this.strategyManager.mainTileY - this.strategyManager.demDistance){
     return VCC.Enum.DELETION_LAYER.DL_BUILDING;
   }
 };


 /**
  * Trigger the deleteTile function if a tile is detected as out of view
  * @method deleteObjetOutOfScene
  */

 VCC.TileManager.prototype.deleteObjetOutOfScene = function() {
   var coord;
   for (var idTile in this.tabTile) {
     coord = idTile.split('_');
     var needDrop = this.tileNeedDropLayer(coord[0], coord[1]);

     if (needDrop !== false && needDrop !== undefined) {
       this.scheduler.removeFifo.push([coord, needDrop]);
     }
   }
 };

/**
  * Remove a layer given in argument
  * @param {String} idTile Id of the tile we wabt to remove layer from
  * @param {String} layerName layer name of the layer we want to remove
  * @method removeLayer
  * 
  */
VCC.TileManager.prototype.removeLayer = function (idTile, layerName){
  if (this.tabTile[idTile].layersMeshes[layerName] !== undefined){
    for (key in this.tabTile[idTile].layersMeshes[layerName][0]){
        VCC.ViewPort.scene.remove(this.tabTile[idTile].layersMeshes[layerName][0][key]);
        this.tabTile[idTile].layersMeshes[layerName][0][key].geometry.dispose();
    }
    console.log("deleting layer : " + layerName  + "of tile : " + idTile);
    delete this.tabTile[idTile].layersMeshes[layerName][0];
  }
};



/**
  * When clicking on screen, will invoque a raycaster to detect an intersection. If so, will load create a tooltip and display it on screen and change the material of the building. 
  *
  *@method computeIntersection
  */
 VCC.TileManager.prototype.computeIntersection = function(event) {
  var mouse = new THREE.Vector2(); 

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  var vector = new THREE.Vector3(mouse.x,mouse.y, 0.5);
  vector.unproject(VCC.ViewPort.camera);
  var raycaster = new THREE.Raycaster(VCC.ViewPort.camera.position, vector.sub( VCC.ViewPort.camera.position ).normalize() );
  var intersections;
  for (tileId in VCC.ViewPort.tileManager.tabTile){
    intersections = [];
    if(VCC.ViewPort.tileManager.tabTile[tileId].layersMeshes["noticeableBuild"][0] !== undefined){
      intersections = raycaster.intersectObjects( VCC.ViewPort.tileManager.tabTile[tileId].layersMeshes["noticeableBuild"][0] );
      if(intersections.length > 0 ){
          if (VCC.ViewPort.tileManager.tooltipsArray[tileId] === undefined){
            VCC.ViewPort.tileManager.tooltipsArray[tileId] = new Array();
          }
          if(VCC.ViewPort.tileManager.tooltipsArray[tileId][intersections[0].object.id] === undefined){
            var tooltip = new VCC.Tooltips(intersections[0].point.x,intersections[0].point.y,intersections[0].point.z, intersections[0].object.semantic);
            var idTile = tileId; // trick ?? 
            tooltip.close.addEventListener("click",function(event)
            {
              event.stopPropagation();
              VCC.ViewPort.tileManager.deleteTooltip(idTile,intersections[0].object.id);
            },true,10);
            VCC.ViewPort.tileManager.tooltipsArray[tileId][intersections[0].object.id] = tooltip;
          }
        VCC.ViewPort.tileManager.updateTooltips();
        intersections[0].object.material.materials = VCC.ViewPort.tileManager.tabTile[tileId].texturesManager.shaderMaterialArray;

        return; //if intersected, stop the loop (only one intersection per click )
      }
    }
  }
 }

/**
  * Displace the tooltips regarding the position and orientation of the camera. 
  *
  *@method updateTooltips
  */
VCC.TileManager.prototype.updateTooltips = function () {
  var point2D = new THREE.Vector2();
  var maxZindex = 1000000;
    for(var i in this.tooltipsArray)
  {
    for (var j in  this.tooltipsArray[i]){
      /**get the position of intersection between raycast and building */
      var pointTemp = new THREE.Vector3().copy(this.tooltipsArray[i][j].point3D);
      // vector from camera to intersection point in world coordinates
      var vector = new THREE.Vector3().copy(pointTemp).sub(VCC.ViewPort.camera.position);
      // intersection in camera coodinate ?? (need to see the old three code)
      pointTemp.project(VCC.ViewPort.camera);
      // compute new position of the tooltip
      point2D.x = (pointTemp.x +1 ) * window.innerWidth / 2  - this.tooltipsArray[i][j].width/2;
      point2D.y = window.innerHeight + (pointTemp.y - 1) * window.innerHeight / 2 ;
      this.tooltipsArray[i][j].html.style.zIndex =  parseInt(maxZindex-vector.length());
      this.tooltipsArray[i][j].html.style.left = point2D.x+"px";
      this.tooltipsArray[i][j].html.style.bottom = point2D.y +"px";
    }
  }
};


/**
  * Delete a tooltip given in argument
  *
  * @method cleanBuildings
  * @param {String} tileId id of the tile
    @param {Int} buildingId ThreeJS mesh id of the building (to swap materials)
  */
VCC.TileManager.prototype.deleteTooltip= function (tileId, buildingId)
{
  document.body.removeChild(this.tooltipsArray[tileId][buildingId].html);
  delete this.tooltipsArray[tileId][buildingId];
  for (var i = 0; i< VCC.ViewPort.tileManager.tabTile[tileId].layersMeshes["noticeableBuild"][0].length ; i++ ){
    if (VCC.ViewPort.tileManager.tabTile[tileId].layersMeshes["noticeableBuild"][0][i].id == buildingId){
        VCC.ViewPort.tileManager.tabTile[tileId].layersMeshes["noticeableBuild"][0][i].material.materials = VCC.ViewPort.tileManager.tabTile[tileId].texturesManager.materialsArray;
        return; 
    }
  }
  
};


VCC.TileManager.prototype.addStrategyManager = function (manager){
  this.strategyManager = manager;
}
