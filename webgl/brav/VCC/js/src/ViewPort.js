
/**
* Main class, it will load and prepare the application and the scene
* @class ViewPort
* @author Alexandre Vienne
* @constructor
*/

VCC.ViewPort = function(){
	
	VCC.ViewPort = this;

	/** Offset to ho have low vertices position (easy computing for graphic cards) */
	this.offsetPosition = {x: 0, z: 0};
	
	/**
	* Server base URL 
	* @property serverUrl 
	* @type String
	*/
	this.serverUrl  = document.location.href.substring(0, document.location.href.lastIndexOf("/test") );

	/**
	* Root node
	* @property root 
	* @type THREE.Object3D
	*/
     this.root = new THREE.Object3D();

	/**Setting Scene*/

	/**
	* Scene of the application
	* @property scene 
	* @type THREE.Scene
	*/
	this.scene = new THREE.Scene();

	this.scene.add(this.root);

	/**
	* WebGl renderer, will draw the scene in the canvas
	* @property renderer 
	* @type THREE.WebGLRenderer
	*/
	this.renderer = new THREE.WebGLRenderer();

	this.renderer.setSize(window.innerWidth, window.innerHeight);
	this.renderer.setClearColor( 0x6699cc, 1 );

	document.body.appendChild(this.renderer.domElement);
	
	/**
	* Camera
	* @property camera 
	* @type THREE.PerspectiveCamera
	*/
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000000);
	
	/**
	* Will handle camera displacement
	* @property control 
	* @type THREE.FirstPersonControls
	*/
	this.control = new THREE.FirstPersonControls(this.camera, this.renderer.domElement);
	
    /**
	* Directionnal light of the scene
	* @property dirLight 
	* @type THREE.DirectionalLight
	*/
    this.dirLight = new THREE.DirectionalLight( 0xffffff );

    this.eventHandler = new VCC.EventHandler();
    
    this.dirLight.position = new THREE.Vector3(/*10000,10000,-1000*/2373,56,2000).normalize();
    this.dirLight.intensity = 0.5;
    this.scene.add( this.dirLight );
    this.scene.add( new THREE.AmbientLight( 0xaaaaaa ));
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.001);

     	
 	/** End Light */
	var config= {rangeCameraTile : 2, mainTuileRow : 1296, mainTuileCol : 13724, sizeTuile : 500, boundingBoxSceneMin : [648000.000000,6862000.000000,0], boundingBoxSceneMax : [648500.000000,6862500.000000,353.54]}
	var rangeCameraTile = config.rangeCameraTile;
	var sizeTuile = config.sizeTuile;
	var mainTuileRow = config.mainTuileRow;
	var mainTuileCol = config.mainTuileCol;
	var boundingBoxSceneMin =config.boundingBoxSceneMin;
	this.tileManager = new VCC.TileManager(this.root,sizeTuile,rangeCameraTile,mainTuileRow,mainTuileCol,config.boundingBoxSceneMin,config.boundingBoxSceneMax);
	this.tileManager.tilePriorityManager();
	/** Place camera in main Tile*/

	 this.camera.position.x = (config.boundingBoxSceneMin[0]+config.boundingBoxSceneMax[0])/2-config.boundingBoxSceneMin[0] - 70;
	 this.camera.position.y = (config.boundingBoxSceneMin[2]+config.boundingBoxSceneMax[2])/2-config.boundingBoxSceneMin[2];
	 this.camera.position.z = (config.boundingBoxSceneMin[1]+config.boundingBoxSceneMax[1])/2-config.boundingBoxSceneMin[1] - 70;


	/** End Tiles management*/

	/**
	* Stat object to have the FPS graph 
	* @property stats
	* @type Stats
	*/
	this.stats = new Stats();
	
	this.stats.setMode(0); // 0: fps, 1: ms	
	/**-----------------*/
	// Align top-left
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.left = '0px';
	this.stats.domElement.style.top = '0px';
	document.body.appendChild( this.stats.domElement );
	
	this.stats.begin();
	
	/*Start app loop**/
	animate();
}

	/**
	* Render the scene 
	* @method
	* 
	*/
VCC.ViewPort.prototype.render = function() {
		this.stats.update();
		this.renderer.render(this.scene, this.camera);	
}



/*********************************************************
 * Animation loop function, update the tile management, process the camera displacement and call the render function.
 * Also log informations on the overlay
 * @method animate
 * @TODO handle lighting
 *********************************************************/
 function animate ()
 {
    requestAnimationFrame(animate);
   	VCC.ViewPort.tileManager.updateMainTile();
    VCC.ViewPort.render();
    VCC.ViewPort.control.update(0.1);
    VCC.ViewPort.dirLight.lookAt(VCC.ViewPort.camera.position);
    VCC.ViewPort.tileManager.scheduler.update();
    log(1,"Memory :" );
    log(2, "Program : " + VCC.ViewPort.renderer.info.memory.programs + " geometry : " + VCC.ViewPort.renderer.info.memory.geometries + " Texture : " + VCC.ViewPort.renderer.info.memory.textures);
    log(3,"Render :" );
    log(4,"Calls : " + VCC.ViewPort.renderer.info.render.calls + " Vertices : " + VCC.ViewPort.renderer.info.render.vertices + " Points : " + VCC.ViewPort.renderer.info.render.points);
    log(5, "camera position : " + VCC.ViewPort.camera.position.x + " " + VCC.ViewPort.camera.position.y + " " + VCC.ViewPort.camera.position.z);
    log(6,"Main tile x : " +VCC.ViewPort.tileManager.mainTileX+" Main Tile y : " + VCC.ViewPort.tileManager.mainTileY);
    log(7,"LOD : " + VCC.ViewPort.tileManager.sceneLod);
}

/**********************************************************
 * Show log text in the bottom left corner. There is max 10 line of log.
 * @method log
 *
 **********************************************************/
function log (id,text){
   document.getElementById("info"+id).innerHTML = text;
}
