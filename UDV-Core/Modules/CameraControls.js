/**
 * Generated On: 2016-05-18
 * Class: CameraControls
 * Description: Camera controls adapted for a planar view.
 * Left mouse button translates the camera on the horizontal (xy) plane.
 * Ctrl + left mouse button rotates around the camera's focus point.
 * Scroll wheel zooms and dezooms.
 * Right mouse (or R/F keys) moves the camera up and down.
 */

THREE = itowns.THREE;


//import * as THREE from 'three';

var scope = null;

var keys = { CTRL: 17, R: 82, F: 70, S: 83 };
var mouseButtons = { LEFTCLICK: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, RIGHTCLICK: THREE.MOUSE.RIGHT };

var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, PANUP: 3, TRAVEL: 4 };
var state = STATE.NONE;

var isCtrlDown = false;
var select = false;

var panCamStart = new THREE.Vector3();
var panStart = new THREE.Vector3();
var panEnd = new THREE.Vector3();
var panDelta = new THREE.Vector3();

var targetPos = new THREE.Vector3();
var targetLook = new THREE.Vector3();

var travelStartPos = new THREE.Vector3();
var travelStartRot = new THREE.Quaternion();

var travelAlpha = 0;
var travelDuration = 1;

var travelTimeZoom = 0.5;
var travelTimeMoveTo = 2.5;

var scale = 1;
var oldScale = 1;

var lastElapsedTime = 0;

var travelling = false;
var travelStarted = false;

var targetReached = true;



/**
 * Constructor
 * @param domElement :
 * @param view :
 * @param clock :
 */

function CameraControls(domElement, view, clock, startpos, looktarget) {

  scope = this;

  this.clock = clock;
  this.camera = view.camera.camera3D;
  this.domElement = domElement;
  this.engine = view.mainLoop.engine;
  this.view = view;
  this.position = this.camera.position;

  this.lookTarget = looktarget;

  this.minDistanceUp = 1000;
  this.maxDistanceUp = Infinity;

  this.minScale = 0;
  this.maxScale = Infinity;

  this.minZoom = 0;
  this.maxZoom = Infinity;

  this.zoomSpeed = 10;

  this.groundHeight = 200;


  this.domElement.addEventListener('contextmenu', this.onContextMenu, false);


  this.addInputListeners();

  this.position.copy(startpos);

  this.camera.lookAt(this.lookTarget);

  this.update();


}

CameraControls.prototype = Object.create(THREE.EventDispatcher.prototype);
CameraControls.prototype.constructor = CameraControls;

CameraControls.prototype.smooth = function smooth(x) {

  var smoothed = x*x * (3-2*x);
  //smoothed = x;

  return smoothed;

  }

CameraControls.prototype.handleTravel = function handleTravel(dt) {

  if(!travelStarted){
    travelStarted = true;
    return;
  }

  travelAlpha += dt / travelDuration;

  //console.log("dt ", dt  ," travelalpha ", travelAlpha, " position : ", scope.position);

  scope.position.lerpVectors(travelStartPos, targetPos, scope.smooth(travelAlpha));



  if(travelAlpha > 1){
    scope.endTravel();
  }

}

CameraControls.prototype.startTravel = function startTravel(targetpos, traveltime) {


  scope.removeInputListeners();

  view.addFrameRequester(control);
    console.log("framerequesters : ",view._frameRequesters);

        console.log("addingFrameRequesters");

  travelDuration=traveltime;

  targetPos.copy(targetpos);

  travelling = true;
  travelAlpha = 0;

  travelStarted = false;

  travelStartPos.copy(scope.position);
  //travelStartRot =
  scope.update();

    console.log("start travel to ", targetpos, " from ", scope.position, " whith duration : ", travelDuration);




}

CameraControls.prototype.endTravel = function endTravel() {

  travelling = false;
  scope.addInputListeners();

  view.removeFrameRequester(control);
    console.log("framerequesters : ",view._frameRequesters);

  console.log("end travel");







}




CameraControls.prototype.update = function update() {

  //console.log("travelling : ",travelling);

  var deltaTime = clock.getElapsedTime() - lastElapsedTime;
  lastElapsedTime = clock.getElapsedTime();
  //console.log(deltaTime);

  //var animating = travelling;
  //var animating = false;

  var position = scope.position;

  if(travelling){
    scope.handleTravel(deltaTime);
  }


  // Handle dolly
  scale = Math.max(scope.minScale, Math.min(scope.maxScale, scale));

  // Handle dolly
  var currentScale = scale / oldScale;
  //offset.multiplyScalar(currentScale);

  // Move the target to the panned location
  //scope.target.add(panOffset);
  /*
  if ((position.z + panUpOffset.z > scope.minDistanceUp) &&
      (position.z + panUpOffset.z < scope.maxDistanceUp))
      { scope.target.add(panUpOffset); }
      */
  //var targetPanPos = position.clone().add(panDelta);

  //var movedir = panDelta.clone();
  //console.log("movedir :", movedir);
  if(state === STATE.PAN) {
    //console.log(movedir);
    position.sub(panDelta.multiplyScalar(0.75));
  }

  /*
    //console.log("dist :", position.distanceTo(targetPanPos));
  if(!targetReached && position.distanceTo(targetPanPos)>2){
    var movedir = panDelta;
    console.log("movedir :", movedir);
    position.add(movedir.multiplyScalar(0.75));
    //panDelta.sub(movedir.multiplyScalar(deltaTime));
    //updateAgain = true;
  }
  else if(!targetReached) {startTr
    targetReached = true;
    //position.copy(targetPanPos);
    console.log("target reached");
  }
  */
  //console.log("updt");

  //position.copy(scope.target).add(offset);

    view.camera.update();

    view.notifyChange(true);

    //console.log(clock.getElapsedTime());

    // Reset elements
    //thetaDelta = 0;
    //phiDelta = 0;
    oldScale = scale;
    //panOffset.set(0, 0, 0);
    //panUpOffset.set(0, 0, 0);

    //if(animating){window.setTimeout(function(){update()},1000/30);}

};

/**
 * returns the point under the mouse cursor in 3d space (world space)
 * @param event : the mouse down event.
 */
CameraControls.prototype.get3DPointUnderCursor = function get3DPointUnderCursor(event) {

  var vector = new THREE.Vector3();

  vector.set(
    ( event.clientX / window.innerWidth ) * 2 - 1,
    - ( event.clientY / window.innerHeight ) * 2 + 1,
    0.5 );

  vector.unproject( scope.camera );

  var dir = vector.sub( scope.position ).normalize();

  var distance = - scope.position.z / dir.z;

  var pos = scope.position.clone().add( dir.multiplyScalar( distance ) );

  pos.set(pos.x,pos.y,this.groundHeight);

  return pos;

};

CameraControls.prototype.zoom = function zoom() {

  //var move = new THREE.Vector3(0,0,0);
  //console.log("move : ", move);
  //move.add(panDelta);
  //console.log("move : ", move);

  //scope.position.add(panDelta);

  //console.log("camposafter : ",scope.position);

};

CameraControls.prototype.pan = function pan() {

  //var move = new THREE.Vector3(0,0,0);
  //console.log("move : ", move);
  //move.add(panDelta);
  //console.log("move : ", move);

  //scope.position.add(panDelta);

  //console.log("camposafter : ",scope.position);

};

/**
 * Handle the left mouse down event. Get the specified datas from the movement of the mouse along both x and y axis.
 * Init the pan value to the position of the mouse during the event.
 * @param event : the mouse down event.
 */
CameraControls.prototype.handleMouseDownPan = function handleMouseDownPan(event) {


    panStart.copy(scope.get3DPointUnderCursor(event));
    panDelta.set(0,0,0);
    panEnd.copy(panStart);
    //panCamStart.copy(scope.position);
    //targetReached = false;

  //console.log("camstart : ",scope.position);
    //scope.camera.lookAt(pos);

    //scope.update();


};

/**
 * Handle the mouse move event. Get the specified datas from the movement of the mouse along both x and y axis.
 * Compute the pan value and update the camera controls.
 * @param event : the mouse move event.
 */
CameraControls.prototype.handleMouseMovePan = function handleMouseMovePan(event) {

    panEnd.copy(scope.get3DPointUnderCursor(event));

    panDelta.subVectors(panEnd,panStart);

    scope.pan();

    //panStart.copy(panEnd);

    //console.log("pan start : ", panStart);
    //console.log("pan end : ", panEnd);
    //console.log("pan delta : ", panDelta);

    scope.update();
};

/**
 * Handle the mouse wheel actionned event. Get the specified data from the movement of the wheel. compute the scale
 * (zoom) value and update the camera controls.
 * @param event : the mouse wheel event.
 */
CameraControls.prototype.handleMouseMiddle = function handleMouseMiddle(event) {

  var mouse = new THREE.Vector2(event.clientX,event.clientY);

    var pointUnderCursor = scope.view.getPickingPositionFromDepth(mouse);
    //  console.log("pointundercursor ", pointUnderCursor);
    var moveTarget = new THREE.Vector3();
    moveTarget.lerpVectors(scope.position,pointUnderCursor,0.75);

    scope.startTravel(moveTarget,travelTimeMoveTo);


    //scope.startTravel

    //scope.update();
};

/**
 * Handle the mouse wheel actionned event. Get the specified data from the movement of the wheel. compute the scale
 * (zoom) value and update the camera controls.
 * @param event : the mouse wheel event.
 */
CameraControls.prototype.handleMouseWheel = function handleMouseWheel(event) {
    var delta = 0;

    if (event.wheelDelta !== undefined) {
        delta = event.wheelDelta;
    } else if (event.detail !== undefined) {
        delta = -event.detail;
    }

    if (delta > 0) {
        scale *= scope.zoomSpeed;
    }
    else {
        scale /= scope.zoomSpeed;
    }

    var mouse = new THREE.Vector2(event.clientX,event.clientY);

      var pointUnderCursor = scope.view.getPickingPositionFromDepth(mouse);
      console.log("pointundercursor ", pointUnderCursor);
    var zoomTarget = pointUnderCursor.sub(scope.position).normalize().multiplyScalar(delta).multiplyScalar(scope.zoomSpeed);

    scope.startTravel(zoomTarget.add(scope.position),travelTimeZoom);


    //scope.startTravel

    //scope.update();
};


/**
 * Catch and manage the event when the mouse wheel is rolled.
 * @param event: the current event
 */
CameraControls.prototype.onMouseWheel = function onMouseWheel(event) {

    //console.log("mouse wheel event");

    event.preventDefault();
    event.stopPropagation();

    scope.handleMouseWheel(event);

    //scope.update();


};

/**
 * Catch and manage the event when a touch on the mouse is down.
 * @param event: the current event (mouse left button clicked or mouse wheel button actionned)
 */
CameraControls.prototype.onMouseDown= function onMouseDown (event) {

    event.preventDefault();

    //console.log("mouse down event");

    if (event.button === mouseButtons.LEFTCLICK) {

var mouse = new THREE.Vector2();
mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  mouse.x = ( event.clientX );
  	mouse.y =  ( event.clientY);
//
  //console.log(mouse);

  console.log(scope.view.getPickingPositionFromDepth(mouse));

      var raycaster = new THREE.Raycaster();
      raycaster.setFromCamera( mouse, scope.camera );
      var intersects = raycaster.intersectObjects( view.scene.children );
      for ( var i = 0; i < intersects.length; i++ ) {

        //console.log(intersects[i].point);

		intersects[ i ].object.material.color.set( 0xff0000 );

  }
/*


    const imageryLayers = scope.view.getLayers(a => a.type == 'planar');
        for (const node of layer.level0Nodes) {
            node.traverse((n) => {
                if (n.material && n.material.visible) {
                  //  n.material.checkLayersConsistency(n, imageryLayers);
                  console.log("test");
                }
}

	}

*/

        if (select) {
            //scope.handlePick(event);
        } else if (isCtrlDown) {
            //scope.handleMouseDownRotate(event);
            //state = STATE.ROTATE;
        } else {
            scope.handleMouseDownPan(event);
            state = STATE.PAN;
        }
    } else if (event.button === mouseButtons.ZOOM) {

      scope.handleMouseMiddle(event);
        //scope.handleMouseDownDolly(event);
        //state = STATE.DOLLY;
    } else if (event.button === mouseButtons.RIGHTCLICK) {

        //scope.handleMouseDownRotate(event);
        state = STATE.ROTATE;
    }

    if (state != STATE.NONE) {
        scope.domElement.addEventListener('mousemove', scope.onMouseMove, false);
        scope.domElement.addEventListener('mouseup', scope.onMouseUp, false);
    }
};

/**
 * Catch the event when a touch on the mouse is uped. Reinit the state of the controller and disable.
 * the listener on the move mouse event.
 * @param event: the current event
 */
CameraControls.prototype.onMouseUp = function onMouseUp(event) {
    event.preventDefault();

    //console.log("mouse up event");

    scope.domElement.removeEventListener('mousemove', scope.onMouseMove, false);
    scope.domElement.removeEventListener('mouseup', scope.onMouseUp, false);

    panDelta.set(0,0,0);

    state = STATE.NONE;
};

/**
 * Catch and manage the event when the mouse is moved, depending of the current state of the controller.
 * Can be called when the state of the controller is different of NONE.
 * @param event: the current event
 */
CameraControls.prototype.onMouseMove = function onMouseMove(event) {
    event.preventDefault();

    if (state === STATE.ROTATE)
        { /*scope.handleMouseMoveRotate(event);*/ }
    else if (state === STATE.PAN)
        { scope.handleMouseMovePan(event); }
    else if (state === STATE.PANUP)
        { /*scope.handleMouseMovePan(event);*/ }
};

/**
 * Catch and manage the event when a key is down.
 * @param event: the current event
 */
CameraControls.prototype.onKeyDown = function onKeyDown(event) {
    //scope.handleKeyDown(event);

    //console.log("key down event");

    window.addEventListener('keyup', scope.onKeyUp, false);
};

/**
 * Catch and manage the event when a key is up.
 * @param event: the current event
 */
CameraControls.prototype.onKeyUp = function onKeyUp(event) {

    //console.log("key up event");

    if (event.keyCode == keys.CTRL) {
        isCtrlDown = false;
        window.removeEventListener('keyup', scope.onKeyUp, false);
    } else if (event.keyCode === keys.S) {
        //select = false;
        window.removeEventListener('keyup', scope.onKeyUp, false);
    }
};

/**
 * Catch and manage the event when the context menu is called (by a right click on the window).
 * We use this to prevent the context menu from appearing, so we can use right click for other inputs.
 * @param event: the current event
 */
CameraControls.prototype.onContextMenu = function onContextMenu(event) {
    event.preventDefault();

};

CameraControls.prototype.removeInputListeners = function removeInputListeners() {

  //* *********************Keys***********************//
  window.removeEventListener('keydown', this.onKeyDown, false);

  this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
  this.domElement.removeEventListener('mousewheel', this.onMouseWheel, false);
  // For firefox
  this.domElement.removeEventListener('MozMousePixelScroll', this.onMouseWheel, false);

};

CameraControls.prototype.addInputListeners = function addInputListeners() {

  //* *********************Keys***********************//
  window.addEventListener('keydown', this.onKeyDown, false);

  this.domElement.addEventListener('mousedown', this.onMouseDown, false);
  this.domElement.addEventListener('mousewheel', this.onMouseWheel, false);
  // For firefox
  this.domElement.addEventListener('MozMousePixelScroll', this.onMouseWheel, false);

};
