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

VCC.Tile = function(_tileId){
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
	this.texturesManager = new VCC.TexturesManager(_tileId);
	/**
	* Mesh containing all dem geometry and materials
	* @property meshTerrain
	* @type THREE.Mesh
	*/
	this.meshTerrain = undefined;	
	/**
	* Mesh containing all buildings geometry and materials
	* @property meshBuilding 
	* @type THREE.Mesh
	*/
	this.meshBuilding = undefined;
}
