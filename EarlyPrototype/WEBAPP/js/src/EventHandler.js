/** 
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 * Event handler for UI button, checkboxes...
 * Get configuration information and fill the user interface
 * @class VCC.EventHandler
 */

VCC.EventHandler = function() {}


/**
 * Trigger texture increase resolution if needed when clicking, set the value of main and surrounding tileTextureResolution
 * @method changeTextureResolution
 * @params {Int} rez new texture resolution level
 */
VCC.EventHandler.prototype.changeTextureResolution = function(rez) {
	if (rez === "UP" && VCC.ViewPort.tileManager.mainTileTextureResolution < 3){
		for (tile in VCC.ViewPort.tileManager.tabTile) {
			if (VCC.ViewPort.tileManager.tabTile[tile].texturesManager.textureLoadedCount === VCC.ViewPort.tileManager.tabTile[tile].texturesManager.materialsArray.length  ) {
				VCC.ViewPort.tileManager.tabTile[tile].texturesManager.increaseResolution(VCC.ViewPort.tileManager.tabTile[tile].texturesManager.textureLevel+1, VCC.Enum.SCHEDULER_PRIO.SP_LOW);
			}
		}
		VCC.ViewPort.tileManager.mainTileTextureResolution += 1;
		VCC.ViewPort.tileManager.surroundingTileTextureResolution += 1;
	}
	else if (rez === "DOWN" && VCC.ViewPort.tileManager.mainTileTextureResolution > 0){
		VCC.ViewPort.tileManager.mainTileTextureResolution -= 1;
		VCC.ViewPort.tileManager.surroundingTileTextureResolution -= 1;

	}
}

/**
 * When Scheduler Fifos are not empty, unactivate UI Button. Update on screen informations
 * @method updateUi
 * @params {boolean} disable new state of button disable tag
 */
VCC.EventHandler.prototype.updateUi = function (disable){
	$("button").each(function(){
		$(this).attr("disabled",disable);
	});
	$("input").each(function(){
		$(this).attr("disabled",disable);
	});

	$("#mainTileRezUi").text(VCC.ViewPort.tileManager.mainTileTextureResolution);
	$("#otherTileRezUi").text(VCC.ViewPort.tileManager.surroundingTileTextureResolution);
	if(disable){
		$("#isLoading").show();
	}else{
	    $("#isLoading").hide();
	}
}

/**
 * retreive the list of noticeable buildings and their locations and print them on the screen
 * @method getNoticeableBuildingList
 */
VCC.EventHandler.prototype.getNoticeableBuildingList = function(){
	if( VCC.ViewPort.config.noticeableBuildings !== undefined){
		for (var i = 0; i < VCC.ViewPort.config.noticeableBuildings.length; i++){
			$("#overlayNoticeableBuildings .collapse").append("<a id ='"+i+"' class ='clickable'>"+ VCC.ViewPort.config.noticeableBuildings[i].name+"</a> <br />");
		}
	}
}


/**
 * retreive the list of noticeable buildings and their locations to print it on the screen
 * @method changeTextureResolution
 * @params {Int} rez new texture resolution level
 */
VCC.EventHandler.prototype.goToBuilding = function(id){
	VCC.ViewPort.control.relocateCamera(VCC.ViewPort.config.noticeableBuildings[id].position);
}




/**
 * Launch a load texture. 
 * TODO : finish the mock up mode 
 * @method swapAllToTextures
 */
VCC.EventHandler.prototype.swapAllToTextures = function(){
	for(id in VCC.ViewPort.tileManager.tabTile){
		var tileiD = id.split("_");

		var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_TEXTURE, tileiD[0],tileiD[1]);
	    task.addToScheduler();
	}
}

VCC.EventHandler.prototype.modeChanged = function(texturedMode){
	VCC.ViewPort.tileManager.strategyManager.mockupMode = !texturedMode;
	if(texturedMode){
		this.swapAllToTextures();
	}
	else{
		this.dropTextures();
	}
}


VCC.EventHandler.prototype.dropTextures = function(){
	for(id in VCC.ViewPort.tileManager.tabTile){
		VCC.ViewPort.tileManager.tabTile[id].swapToDefault();
		VCC.ViewPort.tileManager.tabTile[id].texturesManager.textureLoadedCount = 0;
		VCC.ViewPort.tileManager.tabTile[id].texturesManager.mipmapLoadedCount = 0;
		VCC.ViewPort.tileManager.tabTile[id].texturesManager.disposeMaterials(VCC.ViewPort.tileManager.tabTile[id].texturesManager.texturesNameArray);
	}
}


VCC.EventHandler.prototype.getLayerList = function(){
	for(id in VCC.ViewPort.config.layersList){
		$("#layerConfig .collapse table").append("<tr><td>"+VCC.ViewPort.config.layersList[id][0]+"</td><td><input type=\"checkbox\" id=\"layerVisible_"+id+"\" >"+"</td><td><input type=\"checkbox\" id=\"layerMandatory_"+id+"\" >"+"</td></td>");
		if( VCC.ViewPort.config.layersList[id][1]){
			$("#layerVisible_"+id).attr("checked","checked");
		}
		if( VCC.ViewPort.config.layersList[id][2]){
			$("#layerMandatory_"+id).attr("checked","checked");
		}
	}
};

VCC.EventHandler.prototype.getOpenLayersData = function(){
	for(id in VCC.ViewPort.tileManager.wfsManager.urlDatas){
		$("#openLayerData .collapse table").append("<tr><td>"+id+"</td><td><input type=\"checkbox\" id=\""+id+"\" >"+"</td></td>");
	}
}

VCC.EventHandler.prototype.layerConfigChanged = function(LayerCode, idCase, checked){

	VCC.ViewPort.tileManager.strategyManager.layerList[LayerCode][idCase]= checked;

	if (!checked){
		for (tile in VCC.ViewPort.tileManager.tabTile){
			 VCC.ViewPort.tileManager.removeLayer(tile, VCC.ViewPort.tileManager.strategyManager.layerList[LayerCode][0] );
		}
	}else{
		VCC.ViewPort.tileManager.strategyManager.tilePriorityManager();
	}
}
VCC.EventHandler.prototype.openLayerConfigChanged = function(LayerCode, checked){
	if (!checked){
		VCC.ViewPort.tileManager.wfsManager.urlDatas[LayerCode][1]= false;
		for (var tile in VCC.ViewPort.tileManager.tabTile){
	        VCC.ViewPort.scene.remove(VCC.ViewPort.tileManager.tabTile[tile].openLayerMeshes[LayerCode]);
	        if (VCC.ViewPort.tileManager.tabTile[tile].openLayerMeshes[LayerCode].geometry !== undefined){
	       		VCC.ViewPort.tileManager.tabTile[tile].openLayerMeshes[LayerCode].geometry.dispose();
	        }
	        delete VCC.ViewPort.tileManager.tabTile[tile].openLayerMeshes[LayerCode];
		}
	}else{
		/**Need to force openLayer requests*/
		VCC.ViewPort.tileManager.wfsManager.urlDatas[LayerCode][1]= true;
		VCC.ViewPort.tileManager.strategyManager.tilePriorityManager();		
	}
}
	
