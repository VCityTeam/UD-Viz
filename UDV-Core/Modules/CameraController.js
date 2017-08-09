/**
 * Generated On: 2016-05-18
 * Class: CameraController
 * Description: Camera controls adapted for a planar view.
 * Left mouse button translates the camera on the horizontal (xy) plane.
 * Ctrl + left mouse button rotates around the camera's focus point.
 * Scroll wheel zooms and dezooms.
 * Right mouse (or R/F keys) moves the camera up and down.
 */

THREE = itowns.THREE;


//import * as THREE from 'three';
//
//var _this = null;

var keys = { CTRL: 17, R: 82, F: 70, S: 83 };
var mouseButtons = { LEFTCLICK: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, RIGHTCLICK: THREE.MOUSE.RIGHT };

var STATE = { NONE: -1, PAN: 0, ZOOM: 1, ROTATE: 2, PANUP: 3, TRAVEL: 4 };
var state = STATE.NONE;

var isCtrlDown = false;
var select = false;

var cityCenter = new THREE.Vector3();
var camStartPos = new THREE.Vector3();

//var mousePos = new THREE.Vector2();
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

var debugCube = new THREE.Mesh( new THREE.BoxGeometry( 50, 50, 50 ), new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} ) );

var travelEndPos = new THREE.Vector3();
var targetLook = new THREE.Vector3();

var travelStartPos = new THREE.Vector3();
var travelStartRot = new THREE.Quaternion();
var travelEndRot = new THREE.Quaternion();

var travelAlpha = 0;
var travelDuration = 0;

var travelUseLookAt = false;
var travelUseSmooth = false;


var deltaTime = 0;
var lastElapsedTime = 0;

var travelStarted = false;

var hasChanged = false;




/**
 * Constructor
 * @param domElement :
 * @param view :
 * @param clock :
 */

function CameraController(domElement, view, clock, startPos, startLook, center) {

  _this = this;

  _this.clock = clock;
  _this.camera = view.camera.camera3D;
  _this.domElement = domElement;
  _this.engine = view.mainLoop.engine;
  _this.view = view;
  _this.position = _this.camera.position;
  _this.rotation = _this.camera.rotation;

  cityCenter.copy(center);


  //pref
  _this.travelTimeZoom = 0.3;
  _this.travelTimeMoveTo = 3.0;

  _this.zoomInFactor = 0.35;
  _this.zoomOutFactor = 0.7;

  //_this.smartZoomFactor = 0.85;

  _this.rotateSpeed = 3;

  _this.groundHeight = 170;

  _this.minZenithAngle = 0.0;

  _this.maxZenithAngle = 1.425;

  _this.domElement.addEventListener('contextmenu', _this.onContextMenu, false);

  _this.addInputListeners();

  _this.position.copy(startPos);

  _this.camera.lookAt(startLook);

  _this.view.scene.add(centerPointObj);

  _this.view.scene.add(debugCube);


  debugCube.position.copy(startLook);
  debugCube.updateMatrixWorld();

}

CameraController.prototype = Object.create(THREE.EventDispatcher.prototype);
CameraController.prototype.constructor = CameraController;

CameraController.prototype.smooth = function smooth(x) {

  var smoothed = x*x * (3-2*x);
  //smoothed = x;

  return smoothed;

  }

  CameraController.prototype.getMousePos = function getMousePos(event) {



    var mousePos = new THREE.Vector2();
    mousePos.x = event.clientX;
    mousePos.y = event.clientY;


    return mousePos;

    }



CameraController.prototype.handleTravel = function handleTravel(dt) {



  var alpha = 0;

  if(!travelStarted){
    travelStarted = true;
    return;
  }

  travelAlpha += dt / travelDuration;

  alpha = (travelUseSmooth) ? _this.smooth(travelAlpha) : travelAlpha;


  _this.position.lerpVectors(travelStartPos, travelEndPos, alpha);


  if(travelUseLookAt===true){
      THREE.Quaternion.slerp(travelStartRot, travelEndRot, _this.camera.quaternion, alpha);
  }

  if(travelAlpha > 1){
    _this.endTravel();
  }

}

CameraController.prototype.startTravel = function startTravel(targetPos, travelTime, useLookAt, targetLookAt, useSmooth) {


  state=STATE.TRAVEL;

  _this.updateCursorType();

  _this.removeInputListeners();

  travelUseLookAt = useLookAt;
  travelUseSmooth = useSmooth;

  travelDuration=travelTime;

  travelStartPos.copy(_this.position);


  travelStartRot.copy( _this.camera.quaternion );

  if(targetPos !== targetLookAt){

    _this.position.copy(targetPos);
  }

  _this.camera.lookAt( targetLookAt );

  travelEndRot.copy( _this.camera.quaternion );

  _this.camera.quaternion.copy(travelStartRot);

  travelEndPos.copy(targetPos);

  if(targetPos !== targetLookAt){
    _this.position.copy(travelStartPos);
  }


  travelAlpha = 0;

  travelStarted = false;

  _this.update();

  //console.log("start travel to ", targetPos, " from ", _this.position, " whith duration : ", travelDuration, " using LookAt : ", travelUseLookAt);

}

CameraController.prototype.endTravel = function endTravel() {


  _this.addInputListeners();

  state = STATE.NONE;

  _this.updateCursorType();

}

CameraController.prototype.update = function update() {

  deltaTime = clock.getElapsedTime() - lastElapsedTime;
  lastElapsedTime = clock.getElapsedTime();

  if(state===STATE.TRAVEL){
    _this.handleTravel(deltaTime);
  }

  if(state!==STATE.NONE){

    view.camera.update(window.innerWidth, window.innerHeight);

    view.notifyChange(true);

  }

};

/**
 * returns the point under the mouse cursor in 3d space (world space)
 * @param event : the mouse down event.
 */
CameraController.prototype.get3DPointUnderCursor = function get3DPointUnderCursor(posXY, height) {

  var vector = new THREE.Vector3();

  vector.set(
    ( posXY.x / window.innerWidth ) * 2 - 1,
    - ( posXY.y / window.innerHeight ) * 2 + 1,
    0.5 );

  vector.unproject( _this.camera );

  var dir = vector.sub( _this.position ).normalize();

  var distance = (height - _this.position.z) / dir.z;
  //distance =

  var pos = _this.position.clone().add( dir.multiplyScalar( distance ) );

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
CameraController.prototype.get3DPointAtScreenXY = function get3DPointAtScreenXY(posXY) {


  var result = new THREE.Vector3();

  if(typeof _this.view.getPickingPositionFromDepth(posXY) !== 'undefined'){

    result.copy(_this.view.getPickingPositionFromDepth(posXY));
  }

  else{

    result.copy(_this.get3DPointUnderCursor(posXY, _this.groundHeight));

  }

  //console.log("start ",result);



  return result;

};




/**
 * Handle the left mouse down event. Get the specified datas from the movement of the mouse along both x and y axis.
 * Init the pan value to the position of the mouse during the event.
 * @param event : the mouse down event.
 */
CameraController.prototype.handleMouseDownPan = function handleMouseDownPan(event) {

panStart.copy(_this.get3DPointAtScreenXY(_this.getMousePos(event)));
    //panStart.copy(_this.get3DPointUnderCursor(event,_this.groundHeight));
    panDelta.set(0,0,0);
    //panEnd.copy(panStart);



};

/**
 * Handle the mouse move event. Get the specified datas from the movement of the mouse along both x and y axis.
 * Compute the pan value and update the camera controls.
 * @param event : the mouse move event.
 */
CameraController.prototype.handleMouseMovePan = function handleMouseMovePan(event) {

    panEnd.copy(_this.get3DPointUnderCursor(_this.getMousePos(event),panStart.z));
    //panEnd.copy(_this.get3DPointAtScreenXY(new THREE.Vector2(event.clientX,event.clientY)));

    panDelta.subVectors(panEnd,panStart);

    //panStart.copy(panEnd);

    //_this.pan();

    _this.position.sub(panDelta);

    //requestupdate
    _this.update();
};

/**
 * Handle the mouse wheel actionned event. Get the specified data from the movement of the wheel. compute the scale
 * (zoom) value and update the camera controls.
 * @param event : the mouse wheel event.
 */
CameraController.prototype.smartZoom = function smartZoom(event) {


    var pointUnderCursor = _this.get3DPointAtScreenXY(_this.getMousePos(event));

    var moveLook = new THREE.Vector3();
    moveLook.copy(pointUnderCursor);

    var dir = new THREE.Vector3();
    dir.copy(pointUnderCursor).sub(_this.position);
    dir.z = 0;
    dir.normalize();

    var distanceToPoint = _this.position.distanceTo(pointUnderCursor);

    //console.log(distanceToPoint);

    var moveTarget = new THREE.Vector3();

    moveTarget.copy(pointUnderCursor).add(dir.multiplyScalar(-300));
    moveTarget.z = pointUnderCursor.z + 200;

    var duration = _this.travelTimeMoveTo * (0.5+ Math.min( 0.5*distanceToPoint / 1000, 0.5)) ;


    _this.startTravel(moveTarget,duration, true, moveLook, true);

};

CameraController.prototype.handleMouseMoveRotate = function handleMouseMoveRotate(event) {


    thetaDelta = -this.rotateSpeed*deltaMousePos.x/window.innerWidth;
    phiDelta = -this.rotateSpeed*deltaMousePos.y/window.innerHeight;

    var offset = new THREE.Vector3();
    offset.copy(_this.position).sub(centerPoint);
    offset.multiplyScalar(1);


    var quat = new THREE.Quaternion().setFromUnitVectors(_this.camera.up, new THREE.Vector3(0, 0, 1));
    var quatInverse = quat.clone().inverse();

    if (thetaDelta !== 0 || phiDelta !== 0) {
        if ((phi + phiDelta >= _this.minZenithAngle)
            && (phi + phiDelta <= _this.maxZenithAngle)
            && phiDelta !== 0) {

                phi += phiDelta;



      offset.applyQuaternion(quat);


                    var rotationXQuaternion = new THREE.Quaternion();
                    var vector = new THREE.Vector3();
                    vector.setFromMatrixColumn(_this.camera.matrix, 0);
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


    _this.position.copy(offset).add(centerPoint);

    _this.camera.lookAt(centerPoint);

    //requestupdate;
        _this.update();

};

/**
 * Handle the mouse wheel actionned event. Get the specified data from the movement of the wheel. compute the scale
 * (zoom) value and update the camera controls.
 * @param event : the mouse wheel event.
 */
CameraController.prototype.goToTopView = function goToTopView() {



  var topViewPos = new THREE.Vector3();
  var lookTarget = new THREE.Vector3();

  var topViewAltitude = 10000;

  topViewPos.set(cityCenter.x, cityCenter.y, topViewAltitude);



  _this.startTravel(topViewPos,this.travelTimeMoveTo*1.5,true,cityCenter, true);



}

/**
 * Handle the mouse wheel actionned event. Get the specified data from the movement of the wheel. compute the scale
 * (zoom) value and update the camera controls.
 * @param event : the mouse wheel event.
 */
CameraController.prototype.goToStartView = function goToStartView() {



  var topViewPos = new THREE.Vector3();
  var lookTarget = new THREE.Vector3();

  var topViewAltitude = 10000;

  topViewPos.set(cityCenter.x, cityCenter.y, topViewAltitude);



  _this.startTravel(topViewPos,this.travelTimeMoveTo*1.5,true,cityCenter, true);



}

/**
 * Handle the mouse wheel actionned event. Get the specified data from the movement of the wheel. compute the scale
 * (zoom) value and update the camera controls.
 * @param event : the mouse wheel event.
 */
CameraController.prototype.startZoom = function startZoom(event) {


    if (event.wheelDelta !== undefined) {
        delta = event.wheelDelta;
    } else if (event.detail !== undefined) {
        delta = -event.detail;
    }

    var screenCenter = new THREE.Vector2();
    screenCenter.x=0.5*window.innerWidth;
    screenCenter.y=0.5*window.innerHeight;

    var pointUnderScreenCenter = _this.get3DPointAtScreenXY(screenCenter);

    var mouse = new THREE.Vector2(event.clientX,event.clientY);

    var pointUnderCursor = _this.get3DPointAtScreenXY(mouse);

    var zoomTarget = new THREE.Vector3();
    zoomTarget.copy(pointUnderScreenCenter);
    zoomTarget.copy(pointUnderCursor);


    var newPos = new THREE.Vector3();

    if(delta>0){

      newPos.lerpVectors(_this.position,zoomTarget,_this.zoomInFactor);
      _this.startTravel(newPos,_this.travelTimeZoom, false, newPos, false);

    }
    else if(delta<0){

      newPos.lerpVectors(_this.position,zoomTarget,-1*_this.zoomOutFactor);
      _this.startTravel(newPos,_this.travelTimeZoom, false, newPos, false);

    }



};





/**
 * Catch and manage the event when the mouse wheel is rolled.
 * @param event: the current event
 */
CameraController.prototype.onMouseWheel = function onMouseWheel(event) {


    event.preventDefault();
    event.stopPropagation();

    if(state===STATE.NONE){
      _this.startZoom(event);
    }

};




/**
 * Catch and manage the event when a touch on the mouse is down.
 * @param event: the current event (mouse left button clicked or mouse wheel button actionned)
 */
CameraController.prototype.onMouseDown= function onMouseDown (event) {

    event.preventDefault();
/*
    mousePos.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mousePos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    mousePos.x =  event.clientX;
    mousePos.y =  event.clientY;


    */

    lastMousePos.copy(_this.getMousePos(event));



    if (event.button === mouseButtons.LEFTCLICK) {

var mouse = new THREE.Vector2();


  mouse.x = ( event.clientX );
  mouse.y =  ( event.clientY);



      var raycaster = new THREE.Raycaster();
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      raycaster.setFromCamera( mouse, _this.camera );
      var intersects = raycaster.intersectObjects( view.scene.children );
      for ( var i = 0; i < intersects.length; i++ ) {


        if( typeof intersects[ i ].object.material.color !== 'undefined'){

          intersects[ i ].object.material.color.set( 0xff0000 );
        }


  }


        if (select) {
            //_this.handlePick(event);
        } else if (isCtrlDown) {
            //_this.handleMouseDownRotate(event);
            //state = STATE.ROTATE;
        } else {

          //view.removeFrameRequester(controls);

            _this.handleMouseDownPan(event);
            state = STATE.PAN;
        }
    } else if (event.button === mouseButtons.ZOOM) {

      _this.smartZoom(event);


    } else if (event.button === mouseButtons.RIGHTCLICK) {

      //view.removeFrameRequester(controls);


        var screenCenter = new THREE.Vector2();
        screenCenter.x=0.5*window.innerWidth;
        screenCenter.y=0.5*window.innerHeight;
        centerPoint.copy(_this.get3DPointAtScreenXY(screenCenter));


        var r = _this.position.distanceTo(centerPoint);
        phi = Math.acos((_this.position.z-centerPoint.z) / r);
      //  console.log((_this.position.z-centerPoint.z) / r);

      debugCube.position.copy(centerPoint);
      debugCube.updateMatrixWorld();




        state = STATE.ROTATE;
    }

    if (state !== STATE.NONE) {
        _this.domElement.addEventListener('mousemove', _this.onMouseMove, false);
        _this.domElement.addEventListener('mouseup', _this.onMouseUp, false);
    }

      _this.updateCursorType();
};

/**
 * Catch the event when a touch on the mouse is uped. Reinit the state of the controller and disable.
 * the listener on the move mouse event.
 * @param event: the current event
 */
CameraController.prototype.onMouseUp = function onMouseUp(event) {
    event.preventDefault();



    _this.domElement.removeEventListener('mousemove', _this.onMouseMove, false);
    _this.domElement.removeEventListener('mouseup', _this.onMouseUp, false);

    panDelta.set(0,0,0);



    if(state!==STATE.TRAVEL){
      state = STATE.NONE;
      //view.addFrameRequester(controls);
    }

      _this.updateCursorType();
};

/**
 * Catch and manage the event when the mouse is moved, depending of the current state of the controller.
 * Can be called when the state of the controller is different of NONE.
 * @param event: the current event
 */
CameraController.prototype.onMouseMove = function onMouseMove(event) {
    event.preventDefault();

    //lastMousePos.copy(_this.getMousePos(event));

    //console.log(deltaMousePos);


    deltaMousePos.copy(_this.getMousePos(event)).sub(lastMousePos);

    lastMousePos.copy(_this.getMousePos(event));


    if (state === STATE.ROTATE)
        { _this.handleMouseMoveRotate(event); }
    else if (state === STATE.PAN)
        { _this.handleMouseMovePan(event); }
    else if (state === STATE.PANUP)
        { /*_this.handleMouseMovePan(event);*/ }
};

/**
 * Catch and manage the event when a key is down.
 * @param event: the current event
 */
CameraController.prototype.onKeyDown = function onKeyDown(event) {

if (event.keyCode === keys.S) {

    _this.goToTopView();

}

    window.addEventListener('keyup', _this.onKeyUp, false);
};

/**
 * Catch and manage the event when a key is up.
 * @param event: the current event
 */
CameraController.prototype.onKeyUp = function onKeyUp(event) {

    if (event.keyCode == keys.CTRL) {
        isCtrlDown = false;
        window.removeEventListener('keyup', _this.onKeyUp, false);
    } else if (event.keyCode === keys.S) {
        //select = false;
        window.removeEventListener('keyup', _this.onKeyUp, false);
    }
};

/**
 * Catch and manage the event when the context menu is called (by a right click on the window).
 * We use _this to prevent the context menu from appearing, so we can use right click for other inputs.
 * @param event: the current event
 */
CameraController.prototype.onContextMenu = function onContextMenu(event) {
    event.preventDefault();

};

CameraController.prototype.removeInputListeners = function removeInputListeners() {

  //* *********************Keys***********************//
  window.removeEventListener('keydown', _this.onKeyDown, false);

  _this.domElement.removeEventListener('mousedown', _this.onMouseDown, false);
_this.domElement.removeEventListener('mousewheel', _this.onMouseWheel, false);
  // For firefox
 _this.domElement.removeEventListener('MozMousePixelScroll', _this.onMouseWheel, false);

};

CameraController.prototype.addInputListeners = function addInputListeners() {

  //* *********************Keys***********************//
  window.addEventListener('keydown', _this.onKeyDown, false);

  _this.domElement.addEventListener('mousedown', _this.onMouseDown, false);

 _this.domElement.addEventListener('mousewheel', _this.onMouseWheel, false);
  // For firefox
  _this.domElement.addEventListener('MozMousePixelScroll', _this.onMouseWheel, false);


};

CameraController.prototype.updateCursorType = function updateCursorType() {

  if(state===STATE.NONE){

    _this.domElement.style.cursor = "auto";

  }
  else if(state===STATE.PAN){

    _this.domElement.style.cursor = "move";

  }
  else if(state===STATE.TRAVEL){

    _this.domElement.style.cursor = "wait";

  }
  else if(state===STATE.ROTATE){

    _this.domElement.style.cursor = "move";

  }


};
