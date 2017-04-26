/** 
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 * Caches the images textures into memory using microcache library
 * @class VCC.TexturesManager
 * @constructor
 */

VCC.TexturesManager = function(_tileId) {

	/*
	 * Handler to store textures and texture names. See http://notes.jetienne.com/2011/09/05/microcache.js.html
	 * @property _microcache
	 * @type MicreCache
	 */
	this._microCache = new MicroCache();
	/*
	 * Retrieve in city config file the path to texture
	 * @property imagePath
	 * @type String
	 **/
	this.imagePath = VCC.ViewPort.config.texturePath;
	/**
	 * Url prefix to get textures
	 * @property urlImgPrefix
	 * @type String
	 */
	this.urlImgPrefix = 'dyn/textures/10240/';


	/*
	 * identifier of the tile this textureManager belongs
	 * @property _tileId
	 * @type String
	 */
	this.tileId = _tileId;

	/**
	 * Used when creating textures, makes textures looks better
	 * @property anisotropy
	 * @type int
	 **/
	this.anisotropy = VCC.ViewPort.renderer.getMaxAnisotropy();
	/**
	 * Array of materials needed for the Tile
	 * @property materialsArray
	 * @type Array
	 */
	this.materialsArray = [];
	/**
	 * Array of texture name use for each material
	 * @property texturesNamesArray
	 * @type Array
	 */
	this.texturesNameArray = [];


	/**
	 * Hold a texture Counter to know when all textures are loaded should be equal to materialsArray.length
	 * @property textureLoadedCount
	 * @type int
	 */
	this.textureLoadedCount = 0;

	/**
	 * Hold a mipmap loaded Counter to know when all mipmaps are loaded should be equal to materialsArray.length when loaded
	 * @property mipmapLoadedCount
	 * @type int
	 */
	this.mipmapLoadedCount = 0 ;


	/** 
	 * Contains the THREE JS texture loader needed since r68 
	 *
	 * @property loader
	 * @type THREE.DDSLoader
	 **/

	this.loader = new THREE.DDSLoader();

	/*
	 * Texture Level of detail 0 = min
	 * @property textureLevel
	 * @type int
	 */
	this.textureLevel = 0;

	/*
	 * maximum texture Level of detail
	 * @property MaxTextureLevel
	 * @type int
	 */
	this.maxTextureLevel = 3;

	/*
	 * Array of shader material, used to replace THREE.MeshFaceMaterial.materials array when picking a building to change building color by blending its texture with red
	 * TODO : Not needed if we set texture.color attribute to red, it will produce the same effect
	 * @property shaderMaterialArray
	 * @type Array[THREE.ShaderMaterial]
	 */
	this.shaderMaterialArray = [];



	/*
	 * Array of material used for mock up mode or when loading new geometries. Contain occurenctes to defaultMaterial. When textures are loaded this material array is replaced by materialsArray (in mesh) 
	 * @property loadingMaterial
	 * @type Array[THREE.MeshLambertMaterial]
	 */

	this.loadingMaterial = [];

	/*
	 * default material used for walls in mockup mode or when new geometries waits for textures to be loaded
	 * @property loadingMaterial
	 * @type THREE.MeshLambertMaterial
	 */

	this.defaultMaterial = new THREE.MeshLambertMaterial({color: 0xB9B2B9, ambient: 0xB9B2B9}); //, map:this.loader.load("wall.dds")

	/*
	 * default material used for roofs in mockup mode or when new geometries waits for textures to be loaded
	 * @property loadingMaterial
	 * @type THREE.MeshLambertMaterial
	 */

	this.defaultRoofMaterial = new THREE.MeshLambertMaterial({color: 0xB7887C, ambient: 0xB7887C }); //, map:this.loader.load("toit.dds")


};


/**
 *Return the material index of the desired texture if it doesn't exists, will load the texture and returns its index
 *
 *@return {int} index for the desired texture
 *@method getIndexMaterials
 *@param {string} textureName name of texture found in Json
 *@param {Array} indexMaterialList List of index Material used by the mesh (maps index to textureName)
 */
VCC.TexturesManager.prototype.getIndexMaterial = function(textureName, indexMaterialList, roof) {

	if (!this._microCache.contains(textureName)) {
		this._microCache.set(textureName, this.createMaterial(textureName,roof));
		this.texturesNameArray.push(textureName);
	}
	if ((indexMaterialList !== undefined) && (indexMaterialList[this._microCache.get(textureName)] === undefined)) {
		indexMaterialList[this._microCache.get(textureName)] = textureName;
	}
	return this._microCache.get(textureName);
};

/**
 *initialise materials with empty texture
 *@method createMaterial
 */
VCC.TexturesManager.prototype.createMaterial = function(texture,roof) {
	var texture = new THREE.CompressedTexture();
	var material = new THREE.MeshBasicMaterial({
		map: texture,
	});
	if(roof){
		this.loadingMaterial.push(this.defaultRoofMaterial);
	}else{
		this.loadingMaterial.push(this.defaultMaterial);
	}
	this.materialsArray.push(material);
	return this.materialsArray.length - 1;
};


/**
 * Generate the task and add them to scheduler to increase texture resolution
 * Warning : bug can be espected with a reduce resolution function
 *@method increaseResolution
 *@param {int} targetResolution resolution we want to have
 *@param {SCHEDULER_PRIO} priority priority of the increase resolution request
 */
VCC.TexturesManager.prototype.increaseResolution = function(targetResolution, priority) {
	if (priority === undefined) {
		priority = VCC.Enum.SCHEDULER_PRIO.SP_LOW;
	}
	if ((targetResolution <= this.textureLevel) || (this.textureLevel === this.maxTextureLevel)) {
		console.log("increase resolution tile " + this.tileId + ": nothing to do");
		return;
	}
	if (this.materialsArray.length == 0) {
		console.log("There is no material in this tile. Do not create a task");
		return;
	}
	//all is good proceed
	var tileCoord = this.tileId.split('_');
	for (var i = this.textureLevel + 1;
		(i <= this.maxTextureLevel) && (i <= targetResolution); i = i + 1) {
		var task = new VCC.SchedulerTask(VCC.Enum.SCHEDULER_TASK.ST_LOAD_HIGHER_RES, parseInt(tileCoord[0]), parseInt(tileCoord[1]), i);
		task.addToScheduler(priority);
	}

};

/**
 *launch the load of the texture to the base resolution
 *@method loadTextures
 */
VCC.TexturesManager.prototype.loadTextures = function(targetTextureLevel) {
	if (targetTextureLevel === undefined) {
		targetTextureLevel = this.textureLevel;
	}
	if (this.textureLoadedCount === this.materialsArray.length) { //protection for abusive loading call (somme "abusive" call may be normal)
		console.log("abording");
		VCC.ViewPort.tileManager.tabTile[this.tileId].swapToTextures();
		VCC.ViewPort.tileManager.scheduler.onAbort();
	} else {
		for (var i = this.textureLoadedCount; i < this.materialsArray.length; i++) {
			var texture = this.loader.load('/' + this.urlImgPrefix + this.imagePath + this.texturesNameArray[i] + '.dds?CITY=' + VCC.ViewPort.tileManager.urlParameters["CITY"], this.onTextureLoad.bind(null, this.tileId, this.materialsArray[i].map, targetTextureLevel));
			texture.anisotropy = this.anisotropy;
			this.materialsArray[i].map = texture;
		}
	}
};



/**
 * Function call by the scheduler to increase resolution of texture
 * if failled call sheduler.onAbort else launch the load of new mipmaps in new textures
 * @method loadMipmaps
 * @param {int} res resolution in pixels
 */
VCC.TexturesManager.prototype.loadMipmaps = function(res) {
	if (this.textureLevel !== res - 1) {
		console.log("load mipmaps fail because specified resolution is not two time superior from the curent resolution Please check your scheduling order " + this.textureLevel + "res = " + res + " tile id" + this.tileId);
		VCC.ViewPort.tileManager.scheduler.onAbort();
	} else {
		this.mipmapLoadedCount = 0;
		for (var i = 0; i < this.materialsArray.length; i++) {
			// if texture image size < base image size * power(2, targetLevel)  
			// example : base size  = 128px, imgSize = 256             curentlevel = 1 (level is targeted 2)
			// will make 256 < pow(2,2) * 128 whitch makes 256 < 4*128=512 so need to DL mipmap
			if (this.materialsArray[i].map.image.height < Math.pow(2, this.textureLevel + 1) * this.materialsArray[i].map.baseSize) {
				var texture = this.loader.load('/' + this.urlImgPrefix + "DDS/" + res + "/" + this.texturesNameArray[i] + '.dds?CITY=' + VCC.ViewPort.tileManager.urlParameters["CITY"], this.onMipmapLoad.bind(null, this.tileId, this.materialsArray[i].map));
			} else {
				this.onMipmapLoad(this.tileId, false);
			}
		}
	}
};

/**
 *Dispose materials listed in disposeList if not present in exludeList, if exludeList is undefined, dispose all materials of disposeList
 *Warning, this only dispose Images not the material (used if we need to unload images when switching to mockup mode and we eventualy want to reload images after a while)
 *@method disposeMaterials
 *@param {Array} disposeList array containing names of the texture to be disposed
 *@param {Array} exludeList array containing names of the texture not to be disposed
 */


 // TODO : Check if the is memory leaks or not (check if materials are disposed when destroying textureManager)  
VCC.TexturesManager.prototype.disposeMaterials = function(disposeList, excludeList) {

	if (excludeList === undefined) {
		for (index in disposeList) {
			if (this._microCache.get(disposeList[index]) !== undefined) {
				this.materialsArray[this._microCache.get(disposeList[index])].map.dispose();
				//this.materialsArray[this._microCache.get(disposeList[index])].dispose();
				//this._microCache.remove(disposeList[index]);
			}
		}
	} else {
		for (index in disposeList) {
			if ((excludeList.indexOf(disposeList[index]) === -1) && (this._microCache.get(disposeList[index]) !== undefined)) {
				this.materialsArray[this._microCache.get(disposeList[index])].map.dispose();
			//	this.materialsArray[this._microCache.get(disposeList[index])].dispose();
			//	this._microCache.remove(disposeList[index]);
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

VCC.TexturesManager.prototype.onTextureLoad = function(tileId, map, targetResolution) {

	var texturesManager = VCC.ViewPort.tileManager.tabTile[tileId].texturesManager;

	texturesManager.textureLoadedCount++;
	if (texturesManager.textureLoadedCount === texturesManager.materialsArray.length) {
		texturesManager.textureLevel = 0; // a new texture has been loaded with low res, reset textureLevel to minimum
		// fill custom parameters (baseSize)
		for (textureId in texturesManager.materialsArray) {
			if (texturesManager.materialsArray[textureId].map.baseSize === undefined) {
				texturesManager.materialsArray[textureId].map.baseSize = texturesManager.materialsArray[textureId].map.image.height;
			}
		}
		if (targetResolution !== undefined && targetResolution > texturesManager.textureLevel) {
			texturesManager.increaseResolution(targetResolution, VCC.Enum.SCHEDULER_PRIO.SP_LOW);
		}
		VCC.ViewPort.tileManager.scheduler.onTextureLoaded();
		VCC.ViewPort.tileManager.tabTile[tileId].swapToTextures();
		// When all textures are loaded, create a tab of shadersMaterial to make visual picking works, vertex and fragment shaders are in app.html page

		// TODO: see if we can generate this tab when picking is done to move load to the picking
		for (var i = texturesManager.shaderMaterialArray.length; i < texturesManager.materialsArray.length; i++) {
			var vertShader = document.getElementById('vertexshader').innerHTML;
			var fragShader = document.getElementById('fragmentshader').innerHTML;
			var uniforms = { // custom uniforms (texture)
				tOne: {
					type: "t",
					value: texturesManager.materialsArray[i].map
				},
			};
			var material_shh = new THREE.ShaderMaterial({
				uniforms: uniforms,
				vertexShader: vertShader,
				fragmentShader: fragShader
			});
			texturesManager.shaderMaterialArray.push(material_shh);
		}
	}
};

/**
 *callback when a higher resolution mipmap is loaded
 *add mipmap level to the mipmap chain of the texture.
 *@method onMipmapLoad
 *@param {string} tileId, Tile Identifier
 *@param {THREE.CompressedTexture} texture texture to modify
 *@param {THREE.CompressedTexture} mipmap texture where the new mipmaplevel is loaded
 */
VCC.TexturesManager.prototype.onMipmapLoad = function(tileId, texture, mipmap) {
	var texturesManager = VCC.ViewPort.tileManager.tabTile[tileId].texturesManager;
	texturesManager.mipmapLoadedCount++;
	//maybe use an argument mipmaploaded instead of texture laoded ?
	if (texture && (texture.image.height === mipmap.image.height / 2)) {
		texture.image = mipmap.image;
		texture.mipmaps.splice(0, 0, mipmap.mipmaps[0]);
		texture.needsUpdate = true;
	}
	if (texturesManager.mipmapLoadedCount === texturesManager.materialsArray.length) {
		VCC.ViewPort.tileManager.scheduler.onTextureLoaded();
		texturesManager.textureLevel += 1;
	}
};


/** Remove every thing from here */
VCC.TexturesManager.prototype.dispose = function (){
	for (index in this.texturesNameArray) {
		if (this._microCache.get(this.texturesNameArray[index]) !== undefined) {
			this.materialsArray[this._microCache.get(this.texturesNameArray[index])].map.dispose();
			this.materialsArray[this._microCache.get(this.texturesNameArray[index])].dispose();
			this._microCache.remove(this.texturesNameArray[index]);
		}
	}
}
