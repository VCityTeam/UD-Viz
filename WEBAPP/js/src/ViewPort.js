/** 
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 * Main class, it will load and prepare the application and the scene
 * @class ViewPort
 * @constructor
 */

VCC.ViewPort = function(city) {

	VCC.ViewPort = this;
	/** Offset to ho have low vertices position (easy computing for graphic cards)  Not used now but still here because used somewhere ^^ */
	this.offsetPosition = {
		x: 0,
		z: 0
	};

	/**
	 * Server base URL
	 * @property serverUrl
	 * @type String
	 */
	this.serverUrl = document.location.href.substring(0, document.location.href.lastIndexOf("/test"));

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
	this.renderer = new THREE.WebGLRenderer({ antialias: true });

	this.renderer.setSize(window.innerWidth, window.innerHeight);
	this.renderer.setClearColor(0x6699cc, 1);

	document.body.appendChild(this.renderer.domElement);

	/**
	 * Camera
	 * @property camera
	 * @type THREE.PerspectiveCamera
	 */
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000);
	this.camera.up = new THREE.Vector3(0,-1,0);

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
	this.dirLight = new THREE.DirectionalLight(0xffffff,1);
	this.dirLight.up = new THREE.Vector3(0,-1,0);

	/**
	 * Handler for UI action (click on button for now)
	 * @property eventHandler
	 * @type VCC.EventHandler
	 */
	this.eventHandler = new VCC.EventHandler();

	this.dirLight.intensity = 0.4;
	//this.dirLight.position.normalize();


	this.scene.add(this.dirLight);
	this.scene.add(new THREE.AmbientLight(0x888888));
	//this.scene.fog = new THREE.FogExp2(0xffffff, 0.001);


	/** End Light */

	/** Tile Management */


	/**
	 * Configuration of the city requested
	 * @property config
	 * @type Json object
	 */
	this.config = {};
	var urlServer = VCC.ViewPort.serverUrl + "/api/kvp?REQUEST=GetConfig&CITY=" + city;
	var json = $.ajax({
		url: urlServer,
		dataType: 'json',
		async: false,
	});
	try {
		this.config = JSON.parse(json.responseText);
	} catch (e) {
		console.error("Parsing error:", e);
	}
	this.tileManager = new VCC.TileManager(this.root, this.config.sizeTuile, this.config.rangeCameraTile, this.config.mainTuileRow, this.config.mainTuileCol, this.config.boundingBoxSceneMin, this.config.boundingBoxSceneMax, city, this.config.demDistance);
	this.tileManager.addStrategyManager(new VCC.StrategyManager(VCC.ViewPort.config));


	
	if(VCC.ViewPort.config.cameraPosition !== undefined){
		VCC.ViewPort.camera.position.x =  VCC.ViewPort.config.cameraPosition[0];
		VCC.ViewPort.camera.position.y =  VCC.ViewPort.config.cameraPosition[2];
		VCC.ViewPort.camera.position.z =  VCC.ViewPort.config.cameraPosition[1];
	} else {
		VCC.ViewPort.camera.position.x = (VCC.ViewPort.config.boundingBoxSceneMin[0] + VCC.ViewPort.config.boundingBoxSceneMax[0]) / 2 - VCC.ViewPort.config.boundingBoxSceneMin[0] ;
		VCC.ViewPort.camera.position.y = -(VCC.ViewPort.config.boundingBoxSceneMin[2] + VCC.ViewPort.config.boundingBoxSceneMax[2]) / 2 - VCC.ViewPort.config.boundingBoxSceneMin[2] ;  // Warning, in three -y is up whereas z is up in data (so here bBox[2] is the up of data (z axis) that goes in -y)
		VCC.ViewPort.camera.position.z = (VCC.ViewPort.config.boundingBoxSceneMin[1] + VCC.ViewPort.config.boundingBoxSceneMax[1]) / 2 - VCC.ViewPort.config.boundingBoxSceneMin[1] ;
	}
	/*orient the camera */
	if(VCC.ViewPort.config.cameraOrientation !== undefined){
		VCC.ViewPort.control.lat   = VCC.ViewPort.config.cameraOrientation[0];
		VCC.ViewPort.control.lon   = VCC.ViewPort.config.cameraOrientation[1];
		VCC.ViewPort.control.phi   = VCC.ViewPort.config.cameraOrientation[2];
		VCC.ViewPort.control.theta = VCC.ViewPort.config.cameraOrientation[3];
	}
	this.renderer.domElement.addEventListener( 'click', VCC.ViewPort.tileManager.computeIntersection, false );
	
	
	/** Twice is a hack one should be enouth */
	this.tileManager.strategyManager.tilePriorityManager();
	this.tileManager.strategyManager.tilePriorityManager();
	/***/

		

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
	document.body.appendChild(this.stats.domElement);
	this.stats.begin();
	window.addEventListener( 'resize', onWindowResize, false );

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
 *********************************************************/
function animate() {

	VCC.ViewPort.dirLight.position.x = VCC.ViewPort.camera.position.x - VCC.ViewPort.control.target.x;
	VCC.ViewPort.dirLight.position.y =   	(VCC.ViewPort.camera.position.y - VCC.ViewPort.control.target.y);
	VCC.ViewPort.dirLight.position.z =   VCC.ViewPort.camera.position.z - VCC.ViewPort.control.target.z ;
	VCC.ViewPort.dirLight.position.normalize();
	VCC.ViewPort.dirLight.position.y -= 1 ;
	VCC.ViewPort.dirLight.position.normalize();


	requestAnimationFrame(animate);
	VCC.ViewPort.tileManager.updateMainTile();
	VCC.ViewPort.render();
	VCC.ViewPort.control.update(0.1);

	VCC.ViewPort.tileManager.scheduler.update();
	log(1, "Memory :");
	log(2, "Program : " + VCC.ViewPort.renderer.info.memory.programs + " geometry : " + VCC.ViewPort.renderer.info.memory.geometries + " Texture : " + VCC.ViewPort.renderer.info.memory.textures);
	log(3, "Render :");
	log(4, "Calls : " + VCC.ViewPort.renderer.info.render.calls + " Vertices : " + VCC.ViewPort.renderer.info.render.vertices + " Points : " + VCC.ViewPort.renderer.info.render.points);
	log(5, "camera position : " + VCC.ViewPort.camera.position.x + " " + VCC.ViewPort.camera.position.y + " " + VCC.ViewPort.camera.position.z);
	log(6, "Main tile x : " + VCC.ViewPort.tileManager.strategyManager.mainTileX + " Main Tile y : " + VCC.ViewPort.tileManager.strategyManager.mainTileY);
	log(7, "LOD : " + VCC.ViewPort.tileManager.sceneLod + " BBmin : "+VCC.ViewPort.tileManager.BBMin +" BBmax : " + VCC.ViewPort.tileManager.BBMax);
	log(8, "Size fifos :  High : "+ VCC.ViewPort.tileManager.scheduler.highPriorityFifo.length +" Low : " + VCC.ViewPort.tileManager.scheduler.lowPriorityFifo.length);
	log(9, "x light "  + VCC.ViewPort.dirLight.position.x +" y "+ VCC.ViewPort.dirLight.position.y + "z " +VCC.ViewPort.dirLight.position.z);


}

/**********************************************************
 * Show log text in the bottom left corner. There is max 10 line of log.
 * @method log
 *
 **********************************************************/
function log(id, text) {
	//document.getElementById("info" + id).innerHTML = text;
}


/*********************************************************
 * Change renderer configuration when modifying bowser window size
 * @method onWindowResize
 *********************************************************/
function onWindowResize(){
	VCC.ViewPort.camera.aspect = window.innerWidth / window.innerHeight;
	VCC.ViewPort.camera.updateProjectionMatrix();
	VCC.ViewPort.renderer.setSize( window.innerWidth, window.innerHeight );
}
