/**
 * Camera movement contoler, triggers tilemanagement functions 
 * Modifed by Alexandre Vienne to call change lod method when displacing the camera
 *
 * @class FirstPersonControls
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */



THREE.FirstPersonControls = function(object, domElement) {

	this.object = object;
	this.camRoot = new THREE.Object3D();
	this.target = new THREE.Vector3(0, 0, 5);

	this.domElement = (domElement !== undefined) ? domElement : document;

	this.movementSpeed = 10.0;
	this.lookSpeed = 3;

	this.lookVertical = true;
	this.autoForward = false;
	// this.invertVertical = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI*2;

	this.autoSpeedFactor = 0.0;

	/** Handle camera orientation fromkeyboard */

	this.keyLookX = 0;
	this.keyLookY = 0;

	/**------*/

	this.lat = 0;
	this.lon = 230;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;


	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if (this.domElement !== document) {

		this.domElement.setAttribute('tabindex', -1);

	}

	this.handleResize = function() {

		if (this.domElement === document) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	this.onKeyDown = function(event) {

		//event.preventDefault();
		switch (event.keyCode) {

			case 38:
				/*up*/
				this.keyLookY = -this.lookSpeed;
				break;
			case 90:
				/*Z*/
				this.moveForward = true;
				break;
			case 37:
				/*left*/
				this.keyLookX = this.lookSpeed;
				break;
			case 81:
				/*Q*/
				this.moveLeft = true;
				break;
			case 40:
				/*down*/
				this.keyLookY = this.lookSpeed;
				break;
			case 83:
				/*S*/
				this.moveBackward = true;
				break;
			case 39:
				/*right*/
				this.keyLookX = -this.lookSpeed;
				break;
			case 68:
				/*D*/
				this.moveRight = true;
				break;
			case 82:
				/*R*/
				this.moveUp = true;
				break;
			case 70:
				/*F*/
				this.moveDown = true;
				break;
			case 81:
				/*Q*/
				this.freeze = !this.freeze;
				break;

		}

	};

	this.onKeyUp = function(event) {

		switch (event.keyCode) {

			case 38:
				/*up*/
				this.keyLookY = 0;
				break;
			case 90:
				/*Z*/
				this.moveForward = false;
				break;
			case 37:
				/*left*/
				this.keyLookX = 0;
				break;
			case 81:
				/*Q*/
				this.moveLeft = false;
				break;
			case 40:
				/*down*/
				this.keyLookY = 0;
				break;
			case 83:
				/*S*/
				this.moveBackward = false;
				break;
			case 39:
				/*right*/
				this.keyLookX = 0;
				break;
			case 68:
				/*D*/
				this.moveRight = false;
				break;

			case 82:
				/*R*/
				this.moveUp = false;
				break;
			case 70:
				/*F*/
				this.moveDown = false;
				break;

		}

	};

	this.update = function(delta) {

		if (this.freeze) {

			return;

		}

		if (this.heightSpeed) {

			var y = THREE.Math.clamp(this.object.position.y, this.heightMin, this.heightMax);
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * (heightDelta * this.heightCoef);

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = delta * this.movementSpeed;
		var actualY = this.object.position.y;

		if (this.moveForward || (this.autoForward && !this.moveBackward)) {
			this.object.translateZ(-(actualMoveSpeed + this.autoSpeedFactor));
			this.object.position.y = actualY;
			//VCC.ViewPort.tileManager.lodChange();
		}
		if (this.moveBackward) {
			this.object.translateZ(actualMoveSpeed);
			this.object.position.y = actualY;
		}

		if (this.moveLeft) {
			this.object.translateX(-actualMoveSpeed);
		}
		if (this.moveRight) {
			this.object.translateX(actualMoveSpeed);
		}

		if (this.moveUp) {
			this.object.translateY(actualMoveSpeed);
			//VCC.ViewPort.tileManager.lodChange();
			VCC.ViewPort.tileManager.strategyManager.updateViewableLayers();
		}
		if (this.moveDown) {
			this.object.translateY(-actualMoveSpeed);
			//VCC.ViewPort.tileManager.lodChange();
			VCC.ViewPort.tileManager.strategyManager.updateViewableLayers();
		}

		var actualLookSpeed = delta * this.lookSpeed;

		if (!this.activeLook) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if (this.constrainVertical) {

			verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);

		}

		this.lon += this.keyLookX * actualLookSpeed;
		if (this.lookVertical) {
			this.lat -= this.keyLookY * actualLookSpeed * verticalLookRatio;
		}

		this.lat = Math.max(-85, Math.min(85, this.lat));
		this.phi = THREE.Math.degToRad(90 - this.lat);

		this.theta = THREE.Math.degToRad(this.lon);


		if (this.constrainVertical) {

			this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax);

		}

		var targetPosition = this.target,
		position = this.object.position;
		targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
		targetPosition.y = position.y + 100 * Math.cos(this.phi);
		targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);
		this.object.lookAt(targetPosition);

		if (this.moveBackward || this.moveLeft || this.moveRight || this.moveForward) {
			VCC.ViewPort.tileManager.strategyManager.tilePriorityManager();
		}
		if (this.keyLookX !== 0 || this.keyLookY!==0 || this.moveBackward || this.moveLeft || this.moveRight || this.moveForward || this.moveUp ||  this.moveDown){
				VCC.ViewPort.tileManager.updateTooltips();
			}
	};
	this.domElement.addEventListener('contextmenu', function(event) {
		event.preventDefault();
	}, false);
	window.addEventListener('keydown', bind(this, this.onKeyDown), false);
	window.addEventListener('keyup', bind(this, this.onKeyUp), false);

	function bind(scope, fn) {
		return function() {
			fn.apply(scope, arguments);
		};
	};
	this.handleResize();
};


THREE.FirstPersonControls.prototype.relocateCamera = function (position){
	if (position instanceof(Array)){
		var pos = new THREE.Vector3(position[0],position[1],position[2]);
	}
	else if (!position instanceof(THREE.Vector3)){
		return;
	}
	this.object.position.x = position[0];
	this.object.position.y = position[1];
	this.object.position.z = position[2];
}
