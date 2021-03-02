/** 
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 *
 *Default strategy Class, Choose wich layer/tiles to load based on position of the camera  
 * @class VCC.DefaultStrategy
 */

 VCC.DefaultStrategy = function(){
 }


/**
 * Will add loadGeom and texture tasks to sceduler based on camera position and surrounding tiles distance
 * @method tilePriorityManager
 */

VCC.DefaultStrategy.prototype.tilePriorityManager = function(){
	var layerList = VCC.ViewPort.tileManager.strategyManager.layerList;

	/*****/
	var idTile = VCC.ViewPort.tileManager.strategyManager.mainTileX + "_" + VCC.ViewPort.tileManager.strategyManager.mainTileY;
	var surroundingTilesIds = this.getSurroundingTilesIds();
	var loadTexturesTab = {};
	for(var i = 0 ; i < layerList.length ; ++i){

    if(layerList[i][1]){
  		if (!VCC.ViewPort.tileManager.tileExist(idTile)) {
  			if(!VCC.ViewPort.tileManager.strategyManager.isHigh){
  				var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM, VCC.ViewPort.tileManager.strategyManager.mainTileX, VCC.ViewPort.tileManager.strategyManager.mainTileY, layerList[i][0]);
  				task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_HIGH);
  				loadTexturesTab[idTile] = [VCC.ViewPort.tileManager.strategyManager.mainTileX,VCC.ViewPort.tileManager.strategyManager.mainTileY,VCC.ViewPort.tileManager.mainTileTextureResolution,VCC.Enum.SCHEDULER_PRIO.SP_HIGH];
  			}else if(layerList[i][2]){
  				var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM, VCC.ViewPort.tileManager.strategyManager.mainTileX, VCC.ViewPort.tileManager.strategyManager.mainTileY, layerList[i][0]);
  				task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_HIGH);
  				loadTexturesTab[idTile] = [VCC.ViewPort.tileManager.strategyManager.mainTileX,VCC.ViewPort.tileManager.strategyManager.mainTileY,VCC.ViewPort.tileManager.mainTileTextureResolution,VCC.Enum.SCHEDULER_PRIO.SP_HIGH];
  			}
  		}else if ((VCC.ViewPort.tileManager.tabTile[idTile].layersMeshes[layerList[i][0]][0] === undefined) && (!VCC.ViewPort.tileManager.strategyManager.isHigh || (!VCC.ViewPort.tileManager.strategyManager.isHigh && layerList[i][2]))){
  			var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM, VCC.ViewPort.tileManager.strategyManager.mainTileX, VCC.ViewPort.tileManager.strategyManager.mainTileY, layerList[i][0]);
  			task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_HIGH);
  			loadTexturesTab[idTile] = [VCC.ViewPort.tileManager.strategyManager.mainTileX,VCC.ViewPort.tileManager.strategyManager.mainTileY,VCC.Enum.SCHEDULER_PRIO.SP_HIGH];
  		}
      for (id in surroundingTilesIds) {
   			var idSurroundingTile = surroundingTilesIds[id][0] +"_"+surroundingTilesIds[id][1]; 

        if(!VCC.ViewPort.tileManager.tileExist(idSurroundingTile)){
          if(layerList[i][2]){
            var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM, surroundingTilesIds[id][0], surroundingTilesIds[id][1], layerList[i][0]);
            task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_HIGH);
            loadTexturesTab[idSurroundingTile] = [surroundingTilesIds[id][0],surroundingTilesIds[id][1], VCC.ViewPort.tileManager.surroundingTileTextureResolution,VCC.Enum.SCHEDULER_PRIO.SP_HIGH];
          }else if (!VCC.ViewPort.tileManager.strategyManager.isHigh && surroundingTilesIds[id][2] === undefined  && !layerList[i][2]){
            var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM, surroundingTilesIds[id][0], surroundingTilesIds[id][1], layerList[i][0]);
            task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_LOW);
            loadTexturesTab[idSurroundingTile] = [surroundingTilesIds[id][0],surroundingTilesIds[id][1], VCC.ViewPort.tileManager.surroundingTileTextureResolution,VCC.Enum.SCHEDULER_PRIO.SP_LOW];
          }
        }else{
          if (VCC.ViewPort.tileManager.tabTile[idSurroundingTile].layersMeshes[layerList[i][0]][0] === undefined){
            if(layerList[i][2]){
              var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM, surroundingTilesIds[id][0], surroundingTilesIds[id][1], layerList[i][0]);
              task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_LOW);
              loadTexturesTab[idSurroundingTile] = [surroundingTilesIds[id][0],surroundingTilesIds[id][1], VCC.ViewPort.tileManager.surroundingTileTextureResolution,VCC.Enum.SCHEDULER_PRIO.SP_LOW];
            }else if (!VCC.ViewPort.tileManager.strategyManager.isHigh && surroundingTilesIds[id][2] === undefined ){
              var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_GEOM, surroundingTilesIds[id][0], surroundingTilesIds[id][1], layerList[i][0]);
              task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_LOW);
              loadTexturesTab[idSurroundingTile] = [surroundingTilesIds[id][0],surroundingTilesIds[id][1], VCC.ViewPort.tileManager.surroundingTileTextureResolution,VCC.Enum.SCHEDULER_PRIO.SP_LOW];
            }
          }
        }
  		}
    }
	}
  //Load Open Layer stuffs
 for (idLayer in VCC.ViewPort.tileManager.wfsManager.urlDatas){
    if (VCC.ViewPort.tileManager.wfsManager.urlDatas[idLayer][1]){
      for (tileId in VCC.ViewPort.tileManager.tabTile){
        if(VCC.ViewPort.tileManager.tabTile[tileId].openLayerMeshes[idLayer] === undefined){
          var tile = tileId.split("_");
          var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_OPENLAYER,tile[0],tile[1],idLayer);
          task.addToScheduler(VCC.Enum.SCHEDULER_PRIO.SP_LOW);
        }
      }
    }
  }
  if (!VCC.ViewPort.tileManager.strategyManager.mockupMode){
	 for (key in loadTexturesTab){	
		  task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_TEXTURE, loadTexturesTab[key][0], loadTexturesTab[key][1],loadTexturesTab[key][2]);
	      task.addToScheduler(loadTexturesTab[key][3]);
	 }
  }
};


/**
 * Based on camera position, find out wich tiles are surrounding cameras main tile and add return a tab containing thoses ids
 * @method tilePriorityManager
 * @param tile id of the main tile
 * @return {Array[Array]} surroundingTilesIds array containing ids and if we load only dem for surrounding tiles. 
 */


  VCC.DefaultStrategy.prototype.getSurroundingTilesIds = function(tile) {
   var surroundingTilesIds = [];
   var mainTile = VCC.ViewPort.tileManager.tabTile[VCC.ViewPort.tileManager.strategyManager.mainTileX + "_" + VCC.ViewPort.tileManager.strategyManager.mainTileY];
   if (mainTile === undefined) {
     return [];
   }
   var middleX = parseInt((mainTile.BBMin[0] + mainTile.BBMax[0]) / 2 - VCC.ViewPort.tileManager.BBMin[0]);
   var middleY = parseInt((mainTile.BBMin[1] + mainTile.BBMax[1]) / 2 - VCC.ViewPort.tileManager.BBMin[1]);
   var mask = 0;
   if (middleX < VCC.ViewPort.camera.position.x) {
     mask += 1;
   }
   if (middleY < VCC.ViewPort.camera.position.z) {
     mask += 2;
   }
   switch (mask) {
     case 0:
       for (var x = 0; x <= VCC.ViewPort.tileManager.strategyManager.rangeCameraTile; x++) {
         for (var y = 0; y <= VCC.ViewPort.tileManager.strategyManager.rangeCameraTile; y++) {
           if(VCC.ViewPort.tileManager.inLimits(VCC.ViewPort.tileManager.strategyManager.mainTileX - x, VCC.ViewPort.tileManager.strategyManager.mainTileY - y)){
             if (x >= VCC.ViewPort.tileManager.strategyManager.demDistance || y >= VCC.ViewPort.tileManager.strategyManager.demDistance) {
               surroundingTilesIds.push([VCC.ViewPort.tileManager.strategyManager.mainTileX - x, VCC.ViewPort.tileManager.strategyManager.mainTileY - y, "dem"]);
             } else {
               surroundingTilesIds.push([VCC.ViewPort.tileManager.strategyManager.mainTileX - x, VCC.ViewPort.tileManager.strategyManager.mainTileY - y]);
             }
            }
          }
       }
       break;
     case 1:
       for (var x = 0; x <= VCC.ViewPort.tileManager.strategyManager.rangeCameraTile; x++) {
         for (var y = 0; y <= VCC.ViewPort.tileManager.strategyManager.rangeCameraTile; y++) {
           if(VCC.ViewPort.tileManager.inLimits(VCC.ViewPort.tileManager.strategyManager.mainTileX + x, VCC.ViewPort.tileManager.strategyManager.mainTileY - y)){
             if (x >= VCC.ViewPort.tileManager.strategyManager.demDistance || y >= VCC.ViewPort.tileManager.strategyManager.demDistance) {
               surroundingTilesIds.push([VCC.ViewPort.tileManager.strategyManager.mainTileX + x, VCC.ViewPort.tileManager.strategyManager.mainTileY - y, "dem"]);
             } else {
               surroundingTilesIds.push([VCC.ViewPort.tileManager.strategyManager.mainTileX + x, VCC.ViewPort.tileManager.strategyManager.mainTileY - y]);
             }
           }
         }
       }
       break;
     case 2:
       for (var x = 0; x <= VCC.ViewPort.tileManager.strategyManager.rangeCameraTile; x++) {
         for (var y = 0; y <= VCC.ViewPort.tileManager.strategyManager.rangeCameraTile; y++) {
           if(VCC.ViewPort.tileManager.inLimits(VCC.ViewPort.tileManager.strategyManager.mainTileX - x, VCC.ViewPort.tileManager.strategyManager.mainTileY + y)){
             if (x >= VCC.ViewPort.tileManager.strategyManager.demDistance || y >= VCC.ViewPort.tileManager.strategyManager.demDistance) {
               surroundingTilesIds.push([VCC.ViewPort.tileManager.strategyManager.mainTileX - x, VCC.ViewPort.tileManager.strategyManager.mainTileY + y, "dem"]);
             } else {
               surroundingTilesIds.push([VCC.ViewPort.tileManager.strategyManager.mainTileX - x, VCC.ViewPort.tileManager.strategyManager.mainTileY + y]);
             }
           }
         }
       }
       break;
     case 3:
       for (var x = 0; x <= VCC.ViewPort.tileManager.strategyManager.rangeCameraTile; x++) {
         for (var y = 0; y <= VCC.ViewPort.tileManager.strategyManager.rangeCameraTile; y++) {
           if(VCC.ViewPort.tileManager.inLimits(VCC.ViewPort.tileManager.strategyManager.mainTileX + x, VCC.ViewPort.tileManager.strategyManager.mainTileY + y)){
             if (x >= VCC.ViewPort.tileManager.strategyManager.demDistance || y >= VCC.ViewPort.tileManager.strategyManager.demDistance) {
               surroundingTilesIds.push([VCC.ViewPort.tileManager.strategyManager.mainTileX + x, VCC.ViewPort.tileManager.strategyManager.mainTileY + y, "dem"]);
             } else {
               surroundingTilesIds.push([VCC.ViewPort.tileManager.strategyManager.mainTileX + x, VCC.ViewPort.tileManager.strategyManager.mainTileY + y]);
             }
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
  * Called by strategy manager when moving up/down to load/unload building layer and in/decrease range camera view
  *
  *@method updateViewableLayers
  * TODO : See if it still works
  */
 VCC.DefaultStrategy.prototype.updateViewableLayers = function(){
  //Remember that up axis is -y (because of the datas orientation)


  for (layerCode in this.layerList){
    if (!this.layerList[layerCode][1]){
      if (VCC.ViewPort.camera.position.y < - 800 && !VCC.ViewPort.tileManager.strategyManager.isHigh){
        for (tileId in VCC.ViewPort.tileManager.tabTile){
          var tileCoord = tileId.split("_");
          VCC.ViewPort.tileManager.scheduler.removeFifo.push([tileCoord, this.layerList[layerCode][0]]);
        }
        VCC.ViewPort.tileManager.strategyManager.isHigh = true;
        VCC.ViewPort.tileManager.strategyManager.rangeCameraTile = VCC.ViewPort.tileManager.strategyManager.rangeCameraTile *2;
        VCC.ViewPort.tileManager.strategyManager.demDistance = VCC.ViewPort.tileManager.strategyManager.rangeCameraTile;
        this.tilePriorityManager();
      }
      else if (VCC.ViewPort.camera.position.y > - 800 && VCC.ViewPort.tileManager.strategyManager.isHigh){
        VCC.ViewPort.tileManager.strategyManager.isHigh = false;
        VCC.ViewPort.tileManager.strategyManager.rangeCameraTile = VCC.ViewPort.config.rangeCameraTile;
        VCC.ViewPort.tileManager.strategyManager.demDistance = VCC.ViewPort.config.demDistance;
        VCC.ViewPort.tileManager.deleteObjetOutOfScene();
        VCC.ViewPort.tileManager.strategyManager.tilePriorityManager();
      }
    }
  }
 }
