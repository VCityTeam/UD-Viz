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

var STATE = { NONE: -1, PAN: 0, ZOOM: 1, ROTATE: 2, PANUP: 3, TRAVEL: 4 };
var state = STATE.NONE;

var isCtrlDown = false;
var select = false;

var cameraGuide = new THREE.Object3D();

var mousePos = new THREE.Vector2();
var lastMousePos = new THREE.Vector2();
var deltaMousePos = new THREE.Vector2(0,0);


var panCamStart = new THREE.Vector3();
var panStart = new THREE.Vector3();
var panEnd = new THREE.Vector3();
var panDelta = new THREE.Vector3();

var centerPoint = new THREE.Vector3(0,0,0);
var centerPointObj = new THREE.Object3D();

var theta = 0.0;
var phi = 0.0;
var thetaDelta = 0;
var phiDelta = 0;

var debugCube = new THREE.Mesh();

var targetPos = new THREE.Vector3();
var targetLook = new THREE.Vector3();

var travelStartPos = new THREE.Vector3();
var travelStartRot = new THREE.Quaternion();
var travelEndRot = new THREE.Quaternion();

var travelAlpha = 0;
var travelDuration = 0;

//pref
var travelTimeZoom = 0.33;
var travelTimeMoveTo = 1.75;

var travelUseLookAt = false;

var scale = 1;
var oldScale = 1;

var deltaTime = 0;
var lastElapsedTime = 0;

var travelStarted = false;

var targetReached = false;



/**
 * Constructor
 * @param domElement :
 * @param view :
 * @param clock :
 */

function CameraControls(domElement, view, clock, startPos, startLook) {

  scope = this;

  this.clock = clock;
  this.camera = view.camera.camera3D;
  this.domElement = domElement;
  this.engine = view.mainLoop.engine;
  this.view = view;
  this.position = this.camera.position;
  this.rotation = this.camera.rotation;

  this.lookTarget = startLook;

  this.minDistanceUp = 1000;
  this.maxDistanceUp = Infinity;

  this.minScale = 0;
  this.maxScale = Infinity;

  this.minZoom = 0;
  this.maxZoom = Infinity;

  this.zoomSpeed = 10;

  this.groundHeight = 170;

  this.minZenithAngle = 0.0*Math.PI;

  //
  this.maxZenithAngle = 1.425;


  this.domElement.addEventListener('contextmenu', this.onContextMenu, false);


  this.addInputListeners();

  this.position.copy(startPos);

  this.camera.lookAt(this.lookTarget);



  this.view.scene.add(centerPointObj);
  this.view.scene.add(cameraGuide);

  //centerPointObj.add(cameraGuide);

  var geometry = new THREE.BoxGeometry( 50, 50, 50 );
  var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true, wireframeLinewidth: 1} );

  debugCube.material = material;
  debugCube.geometry = geometry;
  debugCube = new THREE.Mesh( geometry, material );
  debugCube.position.copy(target);
  debugCube.updateMatrixWorld();
  this.view.scene.add(debugCube);

    //scope.view.addFrameRequester(control);



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



  scope.position.lerpVectors(travelStartPos, targetPos, scope.smooth(travelAlpha));

  if(travelUseLookAt===true){
      THREE.Quaternion.slerp(travelStartRot, travelEndRot, scope.camera.quaternion, scope.smooth(travelAlpha));
  }





  if(travelAlpha > 1){
    scope.endTravel();
  }

}

CameraControls.prototype.startTravel = function startTravel(targetpos, traveltime, useLookAt) {

  state=STATE.TRAVEL;
  scope.updateCursorType();

  scope.removeInputListeners();

  view.addFrameRequester(control);

  travelUseLookAt = useLookAt;


  travelDuration=traveltime;


  travelStartRot.copy( scope.camera.quaternion );

  scope.camera.lookAt( targetpos );
  travelEndRot.copy( scope.camera.quaternion );

  scope.camera.quaternion.copy(travelStartRot);

  targetPos.copy(targetpos);


  travelAlpha = 0;

  travelStarted = false;

  travelStartPos.copy(scope.position);


  //travelStartRot =
  scope.update();

  //  console.log("start travel to ", targetpos, " from ", scope.position, " whith duration : ", travelDuration, " using LookAt : ", travelUseLookAt);




}

CameraControls.prototype.endTravel = function endTravel() {


  scope.addInputListeners();

  view.removeFrameRequester(control);


  state = STATE.NONE;

  scope.updateCursorType();


}






CameraControls.prototype.update = function update() {



  deltaTime = clock.getElapsedTime() - lastElapsedTime;
  lastElapsedTime = clock.getElapsedTime();

  var position = scope.position;

  if(state===STATE.TRAVEL){
    scope.handleTravel(deltaTime);
  }



    view.camera.update(window.innerWidth, window.innerHeight);


    view.notifyChange(true);


};

/**
 * returns the point under the mouse cursor in 3d space (world space)
 * @param event : the mouse down event.
 */
CameraControls.prototype.get3DPointUnderCursor = function get3DPointUnderCursor(event, height) {

  var vector = new THREE.Vector3();

  vector.set(
    ( event.clientX / window.innerWidth ) * 2 - 1,
    - ( event.clientY / window.innerHeight ) * 2 + 1,
    0.5 );

  vector.unproject( scope.camera );

  var dir = vector.sub( scope.position ).normalize();

  var distance = (height - scope.position.z) / dir.z;
  //distance =

  var pos = scope.position.clone().add( dir.multiplyScalar( distance ) );

  //pos.set(pos.x,pos.y,height);

  //console.log(pos);

  debugCube.position.copy(pos);
  debugCube.updateMatrixWorld();

  return pos;

};


/**
 * returns the point under the mouse cursor in 3d space (world space)
 * @param  : the mouse down event.
 */
CameraControls.prototype.get3DPointAtScreenXY = function get3DPointAtScreenXY(posXY) {


  var result = new THREE.Vector3();

  if(typeof scope.view.getPickingPositionFromDepth(posXY) !== 'undefined'){

    result.copy(scope.view.getPickingPositionFromDepth(posXY));
  }

  else{


    var vector = new THREE.Vector3();

    vector.set(
        ( posXY.x / window.innerWidth ) * 2 - 1,
        - ( posXY.y / window.innerHeight ) * 2 + 1,
        0.5 );

    vector.unproject( scope.camera );

    var dir = vector.sub( scope.position ).normalize();

    var distance = - scope.position.z / dir.z;

    result.copy(scope.position).add( dir.multiplyScalar( distance ) );

    result.set(result.x,result.y,this.groundHeight);

  }

  //console.log("start ",result);



  return result;

};




/**
 * Handle the left mouse down event. Get the specified datas from the movement of the mouse along both x and y axis.
 * Init the pan value to the position of the mouse during the event.
 * @param event : the mouse down event.
 */
CameraControls.prototype.handleMouseDownPan = function handleMouseDownPan(event) {

panStart.copy(scope.get3DPointAtScreenXY(new THREE.Vector2(event.clientX,event.clientY)));
    //panStart.copy(scope.get3DPointUnderCursor(event,this.groundHeight));
    panDelta.set(0,0,0);
    //panEnd.copy(panStart);



};

/**
 * Handle the mouse move event. Get the specified datas from the movement of the mouse along both x and y axis.
 * Compute the pan value and update the camera controls.
 * @param event : the mouse move event.
 */
CameraControls.prototype.handleMouseMovePan = function handleMouseMovePan(event) {

    panEnd.copy(scope.get3DPointUnderCursor(event,panStart.z));
    //panEnd.copy(scope.get3DPointAtScreenXY(new THREE.Vector2(event.clientX,event.clientY)));

    panDelta.subVectors(panEnd,panStart);

    //panStart.copy(panEnd);

    //scope.pan();

    scope.position.sub(panDelta);



    scope.update();
};

/**
 * Handle the mouse wheel actionned event. Get the specified data from the movement of the wheel. compute the scale
 * (zoom) value and update the camera controls.
 * @param event : the mouse wheel event.
 */
CameraControls.prototype.handleMouseMiddle = function handleMouseMiddle(event) {

  var mouse = new THREE.Vector2(event.clientX,event.clientY);

    var pointUnderCursor = scope.get3DPointAtScreenXY(mouse);

    var moveTarget = new THREE.Vector3();
    moveTarget.lerpVectors(scope.position,pointUnderCursor,0.75);



    scope.startTravel(moveTarget,travelTimeMoveTo, true);

};

CameraControls.prototype.handleMouseMoveRotate = function handleMouseMoveRotate(event) {


    thetaDelta = -3*deltaMousePos.x;
    phiDelta = 3*deltaMousePos.y;

    var offset = new THREE.Vector3();
    offset.copy(scope.position).sub(centerPoint);
    offset.multiplyScalar(1);


    var quat = new THREE.Quaternion().setFromUnitVectors(scope.camera.up, new THREE.Vector3(0, 0, 1));
    var quatInverse = quat.clone().inverse();

    if (thetaDelta !== 0 || phiDelta !== 0) {
        if ((phi + phiDelta >= scope.minZenithAngle)
            && (phi + phiDelta <= scope.maxZenithAngle)
            && phiDelta !== 0) {

                phi += phiDelta;



      offset.applyQuaternion(quat);


                    var rotationXQuaternion = new THREE.Quaternion();
                    var vector = new THREE.Vector3();
                    vector.setFromMatrixColumn(scope.camera.matrix, 0);
                    rotationXQuaternion.setFromAxisAngle(vector, phiDelta);
                    offset.applyQuaternion(rotationXQuaternion);
                    offset.applyQuaternion(quatInverse);

    }
    if (thetaDelta !== 0) {


        var rotationZQuaternion = new THREE.Quaternion();
        rotationZQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), thetaDelta);
        offset.applyQuaternion(rotationZQuaternion);
    }
  }


    scope.position.copy(offset).add(centerPoint);

    scope.camera.lookAt(centerPoint);

    scope.update();

};

/**
 * Handle the mouse wheel actionned event. Get the specified data from the movement of the wheel. compute the scale
 * (zoom) value and update the camera controls.
 * @param event : the mouse wheel event.
 */
CameraControls.prototype.startZoom = function startZoom(event) {


    if (event.wheelDelta !== undefined) {
        delta = event.wheelDelta;
    } else if (event.detail !== undefined) {
        delta = -event.detail;
    }

    var screenCenter = new THREE.Vector2();
    screenCenter.x=0.5*window.innerWidth;
    screenCenter.y=0.5*window.innerHeight;

    var pointUnderScreenCenter = scope.get3DPointAtScreenXY(screenCenter);

    var mouse = new THREE.Vector2(event.clientX,event.clientY);

    var pointUnderCursor = scope.get3DPointAtScreenXY(mouse);

    var zoomTarget = new THREE.Vector3();
    zoomTarget.copy(pointUnderScreenCenter);
    zoomTarget.copy(pointUnderCursor);


    var newPos = new THREE.Vector3();

    if(delta>0){

      newPos.lerpVectors(scope.position,zoomTarget,0.3);
      scope.startTravel(newPos,travelTimeZoom, false);

    }
    else if(delta<0){

      newPos.lerpVectors(scope.position,zoomTarget,-0.4);
      scope.startTravel(newPos,travelTimeZoom, false);

    }



};





/**
 * Catch and manage the event when the mouse wheel is rolled.
 * @param event: the current event
 */
CameraControls.prototype.onMouseWheel = function onMouseWheel(event) {


    event.preventDefault();
    event.stopPropagation();

    if(state===STATE.NONE){
      scope.startZoom(event);
    }

};




/**
 * Catch and manage the event when a touch on the mouse is down.
 * @param event: the current event (mouse left button clicked or mouse wheel button actionned)
 */
CameraControls.prototype.onMouseDown= function onMouseDown (event) {

    event.preventDefault();

    mousePos.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mousePos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;



    if (event.button === mouseButtons.LEFTCLICK) {

var mouse = new THREE.Vector2();


  mouse.x = ( event.clientX );
  mouse.y =  ( event.clientY);



      var raycaster = new THREE.Raycaster();
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      raycaster.setFromCamera( mouse, scope.camera );
      var intersects = raycaster.intersectObjects( view.scene.children );
      for ( var i = 0; i < intersects.length; i++ ) {


        if( typeof intersects[ i ].object.material.color !== 'undefined'){

          intersects[ i ].object.material.color.set( 0xff0000 );
        }


  }


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


    } else if (event.button === mouseButtons.RIGHTCLICK) {


        var screenCenter = new THREE.Vector2();
        screenCenter.x=0.5*window.innerWidth;
        screenCenter.y=0.5*window.innerHeight;
        centerPoint.copy(scope.get3DPointAtScreenXY(screenCenter));


        var r = scope.position.distanceTo(centerPoint);
        phi = Math.acos((scope.position.z-centerPoint.z) / r);
      //  console.log((scope.position.z-centerPoint.z) / r);

      debugCube.position.copy(centerPoint);
      debugCube.updateMatrixWorld();




        state = STATE.ROTATE;
    }

    if (state !== STATE.NONE) {
        scope.domElement.addEventListener('mousemove', scope.onMouseMove, false);
        scope.domElement.addEventListener('mouseup', scope.onMouseUp, false);
    }

      scope.updateCursorType();
};

/**
 * Catch the event when a touch on the mouse is uped. Reinit the state of the controller and disable.
 * the listener on the move mouse event.
 * @param event: the current event
 */
CameraControls.prototype.onMouseUp = function onMouseUp(event) {
    event.preventDefault();



    scope.domElement.removeEventListener('mousemove', scope.onMouseMove, false);
    scope.domElement.removeEventListener('mouseup', scope.onMouseUp, false);

    panDelta.set(0,0,0);



    state = (state===STATE.TRAVEL) ? state = STATE.TRAVEL : state = STATE.NONE;

      scope.updateCursorType();
};

/**
 * Catch and manage the event when the mouse is moved, depending of the current state of the controller.
 * Can be called when the state of the controller is different of NONE.
 * @param event: the current event
 */
CameraControls.prototype.onMouseMove = function onMouseMove(event) {
    event.preventDefault();

    lastMousePos.copy(mousePos);

    mousePos.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mousePos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    deltaMousePos.copy(mousePos).sub(lastMousePos);


    if (state === STATE.ROTATE)
        { scope.handleMouseMoveRotate(event); }
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


    window.addEventListener('keyup', scope.onKeyUp, false);
};

/**
 * Catch and manage the event when a key is up.
 * @param event: the current event
 */
CameraControls.prototype.onKeyUp = function onKeyUp(event) {




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

CameraControls.prototype.updateCursorType = function updateCursorType() {

  if(state===STATE.NONE){

    scope.domElement.style.cursor = "auto";

  }
  else if(state===STATE.PAN){

    scope.domElement.style.cursor = "move";

  }
  else if(state===STATE.TRAVEL){

    scope.domElement.style.cursor = "wait";

  }
  else if(state===STATE.ROTATE){

    scope.domElement.style.cursor = "help";

  }


};
