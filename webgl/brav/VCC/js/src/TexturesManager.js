/**
* Caches the images textures into memory using microcache library
* @class VCC.TexturesManager
* @author Alexandre Vienne, Remi Baume
* @constructor
*/

VCC.TexturesManager = function (_tileId)
{
	this._microCache = new MicroCache();
	this.imageType = 'DDS/1024/';
	this.imageType = 'DDS/128/';
	this.urlImgPrefix = 'dyn/textures/10240/';
	//this.urlImgPrefix = 'static/textures/';
	this.maxResolution = 1024;
	this.currentResolution=128;

	this.tileId = _tileId;
	this.isScheduled=false;
	
	this.anisotropy=VCC.ViewPort.renderer.getMaxAnisotropy();

	/**
	* Array of materials needed for the Tile
	* @property materialsArray
	* @type Array
	*/
	this.materialsArray 	= [];
	/**
	* Array of texture name use for each material 
	* @property texturesNamesArray
	* @type Array
	*/
	this.texturesNameArray 	= [];


	/**
	* Hold a texture Counter to know when all textures are loaded should be equal to materialsArray.lenght
	* @property textureLoadedCount
	* @type int
	*/
	this.textureLoadedCount = 0;

};


/**
 *return the material index of the desired texture if it doesn't exists, will load the texture and returs its index
 *
 *@return {int} index for the desired texture
 *@method getIndexMaterials
 *@param {string} textureName name of texture found in Json
 *@param {Array} indexMaterialList List of index Material used by the mesh (maps index to textureName)
 */
VCC.TexturesManager.prototype.getIndexMaterial= function(textureName, indexMaterialList)
{

	if(!this._microCache.contains(textureName)){
		this._microCache.set(textureName, this.createMaterial(textureName));
		this.texturesNameArray.push(textureName);
	}

	if ((indexMaterialList !== undefined) && (indexMaterialList[this._microCache.get(textureName)] === undefined)){
		indexMaterialList[this._microCache.get(textureName)] = textureName;
	}
	return this._microCache.get(textureName);
};



/**
 *initialise materails with empty texture
 *@method createMaterial
 */
VCC.TexturesManager.prototype.createMaterial = function(){
	var texture = new THREE.CompressedTexture();
	var material = new THREE.MeshBasicMaterial({map: texture});
	material.side = THREE.BackSide;
	this.materialsArray.push(material);
	return this.materialsArray.length-1;
};


/**
 *generate the task and add them to scheduler to increase texture resolution
 *Warning : bug can be espected with a reduce resolution function 
 *@method increaseResolution
 *@param {int} targetResolution resolution we want to have  
 *@param {SCHEDULER_PRIO} priority priority of the increase resolution request
 */
VCC.TexturesManager.prototype.increaseResolution = function(targetResolution,priority){
	if(priority===undefined){
		priority=VCC.Enum.SCHEDULER_PRIO.SP_LOW;
	}
	if(!VCC.Utils.isPowerOfTwo(targetResolution)){
		console.log("increase resolution : Error resoltion param must be a power of 2");
		return;
	}
	if((targetResolution <= this.currentResolution) || (this.currentResolution===this.maxResolution)){
		console.log ("increase resolution tile "+this.tileId+": nothing to do");
		return;
	}
	//all is good proceed
	var tileCoord=this.tileId.split('_');
	for(var i=this.currentResolution*2; (i<=this.maxResolution) && (i<=targetResolution); i=i*2){
		var task= new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_HIGHER_RES,parseInt(tileCoord[0]),parseInt(tileCoord[1]),i);
		task.addToScheduler(priority);
	}

};


/**
 *not used ?
 *@method needToDL
 */
VCC.TexturesManager.prototype.needToDL = function(){
	return !(this.textureLoadedCount===this.materialsArray.length);
};


/**
 *launch the load of the texture to the base resolution
 *@method loadTextures
 */
VCC.TexturesManager.prototype.loadTextures= function(){
	if(this.textureLoadedCount===this.materialsArray.length){//protection for abusive loading call (somme "abusive" call may be normal)
		VCC.ViewPort.tileManager.scheduler.onAbort();
	}else{
		this.currentResolution = 128;
		for (var i=this.textureLoadedCount; i<this.materialsArray.length; i++){
			var texture = THREE.ImageUtils.loadCompressedTexture('/'+this.urlImgPrefix+this.imageType+this.texturesNameArray[i]+'.dds', THREE.UVMapping,this.onTextureLoad.bind(null,this.tileId));
			texture.anisotropy = this.anisotropy ;
			this.materialsArray[i].map=texture;
		}
	}
};


/**
 *function call by the scheduler to increase resolution of texture
 *if failled call sheduler.onAbort else lanch the load of new mipmaps in new textures
 *@method loadMipmaps
 *@param {int} res resolution in pixels
 */
VCC.TexturesManager.prototype.loadMipmaps = function(res){
	if(this.currentResolution !== res/2){
		console.log("load mipmaps fail because specified resolution is not two time superior from the curent resolution Please check your scheduling order ");
		VCC.ViewPort.tileManager.scheduler.onAbort();
	}else{
		this.textureLoadedCount=0;
		for (var i=0; i<this.materialsArray.length; i++){
			if(this.materialsArray[i].map.image.height < res){ //current res represent the lower res in the tile but somme texture may have been allready load at higher res
				var texture = THREE.ImageUtils.loadCompressedTexture('/'+this.urlImgPrefix+"DDS/"+res+"/"+this.texturesNameArray[i]+'.dds',THREE.UVMapping ,this.onMipmapLoad.bind(null,this.tileId,this.materialsArray[i].map));
			}else{
				this.onMipmapLoad(this.tileId,false);
			}
		}
	}
};


/**
 *Dispose materials listed in disposeList if not present in exludeList, if exludeList is undefined, dispose all materials of disposeList
 *@method disposeMaterials
 *@param {Array} disposeList array containing names of the texture to be disposed
 *@param {Array} exludeList array containing names of the texture not to be disposed
 */
VCC.TexturesManager.prototype.disposeMaterials = function (disposeList, excludeList){

	if (excludeList === undefined){
		for (index in disposeList){
			if (this._microCache.get(disposeList[index])!== undefined){
				this.materialsArray[this._microCache.get(disposeList[index])].map.dispose();
				this.materialsArray[this._microCache.get(disposeList[index])].dispose();
				this._microCache.remove(disposeList[index]);
			}
		}
	}else{
			for (index in disposeList){
				if((excludeList.indexOf(disposeList[index]) === -1) && (this._microCache.get(disposeList[index])!== undefined)){
						this.materialsArray[this._microCache.get(disposeList[index])].map.dispose();
						this.materialsArray[this._microCache.get(disposeList[index])].dispose();
						this._microCache.remove(disposeList[index]);
				}
			}
		}
};



/**
 *callback when first loading base resolution texture
 *call Scheduler.onTextureLoad when all texture havebeen loaded
 *@method onTextureLoad
 *@param {string} tileId Tile Identifier 
 */
/**Use Ugly globals in the callback no more ;p but still use global*/
VCC.TexturesManager.prototype.onTextureLoad = function(tileId){
	var texturesManager = VCC.ViewPort.tileManager.tabTile[tileId].texturesManager;
	texturesManager.textureLoadedCount++;
	if (texturesManager.textureLoadedCount === texturesManager.materialsArray.length){
		texturesManager.increaseResolution(1024,VCC.Enum.SCHEDULER_PRIO.SP_LOW);
		VCC.ViewPort.tileManager.scheduler.onTextureLoaded();
	}
};


/**
 *callback when a higher resolution mipmap is load
 *add mipmap level to the mipmap chain of the texture.
 *@method onMipmapLoad
 *@param {string} tileId, Tile Identifier 
 *@param {THREE.CompressedTexture} texture texture to modify
 *@param {THREE.CompressedTexture} mipmap texture where the new mipmaplevel is loaded
 */
VCC.TexturesManager.prototype.onMipmapLoad = function(tileId, texture, mipmap){
	var texturesManager = VCC.ViewPort.tileManager.tabTile[tileId].texturesManager;
	texturesManager.textureLoadedCount++;
	//maybe use an argument mipmaploaded instead of texture laoded ?
	
	if(texture){
		texture.image = mipmap.image;
		texture.mipmaps.splice(0,0,mipmap.mipmaps[0]);
		texture.needsUpdate = true;
	}
	
	if (texturesManager.textureLoadedCount === texturesManager.materialsArray.length){
			VCC.ViewPort.tileManager.scheduler.onTextureLoaded();
			texturesManager.currentResolution = texturesManager.currentResolution*2;
	}
};
