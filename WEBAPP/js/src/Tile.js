/** 
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 * Contain all tile informations
 * @class VCC.Tile
 * @constructor
 */

VCC.Tile = function(_tileId, resolution, layersList) {


	this.tileId = _tileId;
	/**
	 * Tile bounding box Min used to load surrounding tiles
	 * @property BBMin
	 * @type Array[x,y,z]
	 */
	this.BBMin = 0;

	/**
	 * Tile bounding box Max used to load surrounding tiles
	 * @property BBMax
	 * @type Array[x,y,z]
	 */
	this.BBMax = 0;

	/**
	 * Array containing all indexes of Material and Texture name needed by meshTerrain to be corectly rendered used when disposing Textures in texturesManager
	 * @property indexTerrainMaterialList
	 * @type Array
	 */
	this.indexTerrainMaterialList = new Array();
	/**
	 * Array containing all indexes of Material and Texture name needed by meshBuilding to be corectly rendered used when disposing Textures in texturesManager
	 * @property indexBuildingMaterialList
	 * @type Array
	 */
	this.indexBuildingMaterialList = new Array();
	/**
	 * textures manager of the current tile
	 * @property texturesManager
	 * @type VCC.TexturesManager
	 */
	this.texturesManager = new VCC.TexturesManager(_tileId, resolution);
	/**
	 * Mesh containing all dem geometry and materials
	 * @property layersMeshes
	 * @type Object { <String> idLayer : [THREE.Mesh]}
	 */
	this.layersMeshes = {};
	for (var i = 0; i< layersList.length ; i++){
		this.layersMeshes[layersList[i][0]] = [undefined];
	}

	/**
	 * Mesh containing geometries and textures of open layers data (if any)
	 * @property meshTerrain
	 * @type THREE.Mesh
	 */
	this.openLayerMeshes = [];


	this.computeTileBBoxes();
}

/**
 * Replace default material in mesh by a textured one
 * @method swapTextures
 */
VCC.Tile.prototype.swapToTextures = function(){
	for (layerCode in this.layersMeshes){
		if(this.layersMeshes[layerCode][0] !== undefined){
			for( var j =0; j <this.layersMeshes[layerCode][0].length;j++ ){
				this.layersMeshes[layerCode][0][j].material.materials = this.texturesManager.materialsArray;
			}
		}
	}
}

/**
 * Replace textured material in mesh by a default one
 * TODO : merge swapToDefaut and swapToTexture
 * @method swapTextures
 */
VCC.Tile.prototype.swapToDefault = function(){
	for (layerCode in this.layersMeshes){
		if(this.layersMeshes[layerCode][0] !== undefined){
			for( var j =0; j <this.layersMeshes[layerCode][0].length;j++ ){
				this.layersMeshes[layerCode][0][j].material.materials = this.texturesManager.loadingMaterial;
			}
		}
	}
}

/**
 * Recompute boundaries of the tile with respect to tileId and sizeTile
 * BBMin = tileCol * sizeTile
 * BBMax = tileRow *sizeTile
 * @method swapTextures
 */
VCC.Tile.prototype.computeTileBBoxes = function(){
	var splitedId= this.tileId.split("_");
	this.BBMin = [splitedId[0]* VCC.ViewPort.tileManager.sizeTile,splitedId[1]* VCC.ViewPort.tileManager.sizeTile];
	this.BBMax = [this.BBMin[0] + VCC.ViewPort.tileManager.sizeTile, this.BBMin[1] + VCC.ViewPort.tileManager.sizeTile];
};
