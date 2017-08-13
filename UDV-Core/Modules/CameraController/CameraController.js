/**
* Generated On: 2016-05-18
* Class: CameraController
* Description: Camera controls adapted for a planar view.
* Left mouse button translates the camera on the horizontal (xy) plane.
* Right mouse button rotates around the camera's focus point.
* Scroll wheel zooms toward cursor position.
* Middle mouse button (wheel click) "smart zooms" at cursor location.
*/

THREE = itowns.THREE;


//scope
var _this = null;

var keys = { CTRL: 17, R: 82, F: 70, S: 83 };
var mouseButtons = { LEFTCLICK: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, RIGHTCLICK: THREE.MOUSE.RIGHT };

//control state
var STATE = { NONE: -1, PAN: 0, ZOOM: 1, ROTATE: 2, PANUP: 3, TRAVEL: 4 };
var state = STATE.NONE;
var isCtrlDown = false;
var select = false;

var cityCenter = new THREE.Vector3();

//starting camera position
var camStartPos = new THREE.Vector3();

//mouse movement
var lastMousePos = new THREE.Vector2();
var deltaMousePos = new THREE.Vector2(0,0);

//camera translation
var panCamStart = new THREE.Vector3();
var panStart = new THREE.Vector3();
var panEnd = new THREE.Vector3();
var panDelta = new THREE.Vector3();

//camera focus point : ground point at screen center
var centerPoint = new THREE.Vector3(0,0,0);

//camera rotation
var theta = 0.0;
var phi = 0.0;
var thetaDelta = 0;
var phiDelta = 0;

//debug shape
var debugCube = new THREE.Mesh( new THREE.BoxGeometry( 50, 50, 50 ), new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} ) );

//animated travel
var travelStarted = false;

var travelEndPos = new THREE.Vector3();
var targetLook = new THREE.Vector3();

var travelStartPos = new THREE.Vector3();
var travelStartRot = new THREE.Quaternion();
var travelEndRot = new THREE.Quaternion();

var travelAlpha = 0;
var travelDuration = 0;

var travelUseLookAt = false;
var travelUseSmooth = false;

//time management
var deltaTime = 0;
var lastElapsedTime = 0;

/**
* Constructor
* @param domElement : the webgl div (city visualization)
* @param view : the itowns view (planar view)
* @param clock : THREE.js clock used for time
* @param center : city center point
* more parameters can be set by adding {param: value} after the 'center' param, when creating the instance.
* example : var controls = new CameraController(domElement, view, clock, center, {zoomTravelTime: 0.4, groundHeight: 200});
*/

function CameraController(domElement, view, clock, center) {

  //extra options : some parameters have default value but can be modified with this
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  _this = this;

  _this.clock = clock;
  _this.camera = view.camera.camera3D;
  _this.domElement = domElement;
  _this.engine = view.mainLoop.engine;
  _this.view = view;
  _this.position = _this.camera.position;
  _this.rotation = _this.camera.rotation;

  cityCenter.copy(center);


  //options
  _this.zoomTravelTime = options.zoomTravelTime || 0.3;
  _this.smartZoomTravelTimeMin = options.smartZoomTravelTimeMin || 1.5;
  _this.smartZoomTravelTimeMax = options.smartZoomTravelTimeMax || 3.0;

  _this.smartZoomHeightMin = options.smartZoomHeightMin || 100;
  _this.smartZoomHeightMax = options.smartZoomHeightMax || 600;

  _this.zoomInFactor = options.zoomInFactor || 0.35;
  _this.zoomOutFactor = options.zoomOutFactor || 0.7;

  _this.rotateSpeed = options.rotateSpeed || 3;

  _this.groundHeight = options.groundHeight || 170;

  _this.minZenithAngle = options.minZenithAngle || 0.0;
  _this.maxZenithAngle = options.maxZenithAngle || 1.425;

  //starting camera position & rotation
  _this.position.copy(options.startPos || cityCenter.clone().add(new THREE.Vector3(5000,0,5000)));
  _this.camera.lookAt(options.startLook || cityCenter);

  //prevent the default contextmenu from appearing when right-clicking
  //this allows to use right-click for input without the menu appearing
  _this.domElement.addEventListener('contextmenu', _this.onContextMenu, false);

  //event listeners for user input
  _this.addInputListeners();

  //DEBUG
  _this.view.scene.add(debugCube);
  debugCube.position.copy(options.startLook || cityCenter);
  debugCube.updateMatrixWorld();

  //add this CameraController instance to the view's framerequesters
  //with this, CameraController.update() will be called each frame
  _this.view.addFrameRequester(this);


}

CameraController.prototype = Object.create(THREE.EventDispatcher.prototype);
CameraController.prototype.constructor = CameraController;


/**
* smoothing function (sigmoid) : h01 Hermite function
* @param x : the value to be smoothed, between 0 and 1
*/
CameraController.prototype.smooth = function smooth(x) {

  var smoothed = x*x * (3-2*x);
  //smoothed = x;

  return smoothed;

}

/**
* return the mouse pixel position (x,y) on screen as a vector2
* @param event : the mouse event
*/
CameraController.prototype.getMousePos = function getMousePos(event) {

  var mousePos = new THREE.Vector2();
  mousePos.x = event.clientX;
  mousePos.y = event.clientY;

  return mousePos;

}

/**
* triggers an animated movement & rotation for the camera
* @param targetPos : the target position of the camera (reached at the end)
* @param travelTime : the animation (travel) duration in seconds
* @param useLookAt : if true, the camera will be oriented toward targetLookAt.
* if false, camera will be oriented toward targetPos (direction of the movement)
* @param targetLookAt : the camera target focus point if useLookAt is true
* @param useSmooth : if true, movement is smoothed (slower at start & end)
*/
CameraController.prototype.startTravel = function startTravel(targetPos, travelTime, useLookAt, targetLookAt, useSmooth) {

  //control state
  state=STATE.TRAVEL;

  //update cursor
  _this.updateCursorType();

  //prevent input
  _this.removeInputListeners();

  travelUseLookAt = useLookAt;
  travelUseSmooth = useSmooth;

  travelDuration=travelTime;

  //start position (current camera position)
  travelStartPos.copy(_this.position);

  //start rotation (current camera rotation)
  travelStartRot.copy( _this.camera.quaternion );

  //setup the end rotation
  if(targetPos !== targetLookAt){

    _this.position.copy(targetPos);
  }

  _this.camera.lookAt( targetLookAt );

  travelEndRot.copy( _this.camera.quaternion );

  _this.camera.quaternion.copy(travelStartRot);

  if(targetPos !== targetLookAt){
    _this.position.copy(travelStartPos);
  }

  //end position
  travelEndPos.copy(targetPos);


  travelAlpha = 0;
  travelStarted = false;

  _this.update();

}

/**
* resume normal behavior after a travel is completed
*/
CameraController.prototype.endTravel = function endTravel() {

  _this.addInputListeners();

  state = STATE.NONE;

  _this.updateCursorType();

}

/**
* handle the animated movement and rotation of the camera in "travel" state
* @param dt : the deltatime between two updates
*/
CameraController.prototype.handleTravel = function handleTravel(dt) {

  if(!travelStarted){
    travelStarted = true;
    return;
  }

  travelAlpha += dt / travelDuration;

  //the animation alpha, between 0 (start) and 1 (finish)
  var alpha = (travelUseSmooth) ? _this.smooth(travelAlpha) : travelAlpha;

  //new position
  _this.position.lerpVectors(travelStartPos, travelEndPos, alpha);

  //new rotation
  if(travelUseLookAt===true){
    THREE.Quaternion.slerp(travelStartRot, travelEndRot, _this.camera.quaternion, alpha);
  }

  //completion test
  if(travelAlpha > 1){
    _this.endTravel();
  }

}


/**
* CameraController update function : called each frame
* also called
* updates the view and camera if needed, and handles the animated travel
*/
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
* returns the point (xyz) under the mouse cursor in 3d space (world space)
* the point belong to an abstract mathematical plane of specified height (doesnt use actual geometry)
* this will work even when the cursor is over nothing (out of city limits)
* @param posXY : the mouse position in screen space (unit : pixel)
* @param height : the height of the mathematical plane (ground height)
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
  * returns the point (xyz) under the mouse cursor in 3d space (world space)
  * if geometry is under the cursor, the point in obtained with getPickingPositionFromDepth
  * if no geometry is under the cursor, the point is obtained with get3DPointUnderCursor
  * @param posXY : the mouse position in screen space (unit : pixel)
  */
  CameraController.prototype.get3DPointAtScreenXY = function get3DPointAtScreenXY(posXY) {

    //the returned value
    var result = new THREE.Vector3();

    //check if there is valid geometry under cursor
    if(typeof _this.view.getPickingPositionFromDepth(posXY) !== 'undefined'){
      result.copy(_this.view.getPickingPositionFromDepth(posXY));
    }
    //if not, we use the mathematical plane at height = groundHeight
    else{
      result.copy(_this.get3DPointUnderCursor(posXY, _this.groundHeight));
    }

    return result;

  };


  /**
  * Initiate a pan movement (translation on xy plane) when user does a left-click
  * The movement value is derived from the actual world point under the mouse cursor
  * This allows the user to "grab" a world point and drag it to move (eg : google map)
  * @param event : the mouse down event.
  */
  CameraController.prototype.handleMouseDownPan = function handleMouseDownPan(event) {
    
    //the world point under mouse cursor when the pan movement is started
    panStart.copy(_this.get3DPointAtScreenXY(_this.getMousePos(event)));

    //the difference between start and end cursor position
    panDelta.set(0,0,0);

  };

  /**
  * Handle the pan movement (translation on xy plane) when user moves the mouse
  * The pan movement is previously initiated when user does a left-click, by handleMouseDownPan()
  * Compute the pan value and update the camera controls.
  * The movement value is derived from the actual world point under the mouse cursor
  * This allows the user to "grab" a world point and drag it to move (eg : google map)
  * @param event : the mouse move event.
  */
  CameraController.prototype.handleMouseMovePan = function handleMouseMovePan(event) {

    //the world point under the current mouse cursor position, at same height than panStart
    panEnd.copy(_this.get3DPointUnderCursor(_this.getMousePos(event),panStart.z));

    //the difference between start and end cursor position
    panDelta.subVectors(panEnd,panStart);
    
    //new camera position
    _this.position.sub(panDelta);

    //request update
    _this.update();
  };

  /**
  * Triggers a "smart zoom" animated movement (travel) toward the point under mouse cursor
  * The camera will be smoothly moved and oriented close to the target, at a determined height and distance
  * @param event : the mouse wheel click (middle mouse button) event.
  */
  CameraController.prototype.smartZoom = function smartZoom(event) {

    //point under mouse cursor
    var pointUnderCursor = _this.get3DPointAtScreenXY(_this.getMousePos(event));

    //camera focus point (the lookAt target) at the end of the travel
    var moveLook = new THREE.Vector3();
    moveLook.copy(pointUnderCursor);

    //direction of the movement, projected on xy plane and normalized
    var dir = new THREE.Vector3();
    dir.copy(pointUnderCursor).sub(_this.position);
    dir.z = 0;
    dir.normalize();

    var distanceToPoint = _this.position.distanceTo(pointUnderCursor);

    //camera height (altitude) at the end of the travel
    var targetHeight = THREE.Math.lerp(this.smartZoomHeightMin, this.smartZoomHeightMax, Math.min(distanceToPoint/5000,1)); ;

    //camera position at the end of the travel
    var moveTarget = new THREE.Vector3();

    moveTarget.copy(pointUnderCursor).add(dir.multiplyScalar(-targetHeight*1.5));
    moveTarget.z = pointUnderCursor.z + targetHeight;

    //animated movement duration (proportional to the travel distance)
    var duration = THREE.Math.lerp(this.smartZoomTravelTimeMin, this.smartZoomTravelTimeMax, Math.min(distanceToPoint/5000,1));

    //debug
    debugCube.position.copy(moveLook);
    debugCube.updateMatrixWorld();

    //initiate the travel
    _this.startTravel(moveTarget,duration, true, moveLook, true);

  };

 /**
  * Handle the rotate movement (orbit) when user moves the mouse
  * the movement is an orbit around "centerPoint", the camera focus point (ground point at screen center)
  * The rotate movement is previously initiated when user does a right-click
  * Compute the new position value and update the camera controls.
  */
  CameraController.prototype.handleMouseMoveRotate = function handleMouseMoveRotate() {

    //angle deltas
    //deltaMousePos is computed in onMouseMove / onMouseDown functions
    thetaDelta = -this.rotateSpeed*deltaMousePos.x/window.innerWidth;
    phiDelta = -this.rotateSpeed*deltaMousePos.y/window.innerHeight;
    
    //the vector from centerPoint (focus point) to camera position
    var offset = new THREE.Vector3();
    offset.copy(_this.position).sub(centerPoint);
    
    var quat = new THREE.Quaternion().setFromUnitVectors(_this.camera.up, new THREE.Vector3(0, 0, 1));
    var quatInverse = quat.clone().inverse();

    if (thetaDelta !== 0 || phiDelta !== 0) {
      if ((phi + phiDelta >= _this.minZenithAngle)
      && (phi + phiDelta <= _this.maxZenithAngle)
      && phiDelta !== 0) {

        //rotation around X (altitude)
        
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
        
        //rotation around Z (azimuth)
        
        var rotationZQuaternion = new THREE.Quaternion();
        rotationZQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), thetaDelta);
        offset.applyQuaternion(rotationZQuaternion);
      }
    }
    
    //new camera position
    _this.position.copy(offset).add(centerPoint);

    //new focus point
    _this.camera.lookAt(centerPoint);

    //requestupdate;
    _this.update();

  };

  /**
  * Triggers an animated movement (travel) to set the camera to top view
  * Camera will be moved above cityCenter at a 10km altitude, looking at cityCenter
  */
  CameraController.prototype.goToTopView = function goToTopView() {

    var topViewPos = new THREE.Vector3();
    var lookTarget = new THREE.Vector3();

    var topViewAltitude = 10000;

    //the final position
    topViewPos.set(cityCenter.x, cityCenter.y, topViewAltitude);

    //initiate the travel
    _this.startTravel(topViewPos,3,true,cityCenter, true);

  }

  /**
  * TO DO
  */
  CameraController.prototype.goToStartView = function goToStartView() {

/*    var topViewPos = new THREE.Vector3();
    var lookTarget = new THREE.Vector3();

    var topViewAltitude = 10000;

    topViewPos.set(cityCenter.x, cityCenter.y, topViewAltitude);



    _this.startTravel(topViewPos,this.travelTimeMoveTo*1.5,true,cityCenter, true);

*/

  }

  /**
  * Triggers a Zoom animated movement (travel) toward the point under mouse cursor
  * The camera will be moved toward / away from the point under mouse cursor
  * The zoom intensity varies according to the distance to the point.
  * The closer to the ground, the lower the intensity
  * This means that user can zoom infinitly closer to the ground, but cannot go through it 
  * Orientation will not change (TO DO : test with orientation change)
  * @param event : the mouse wheel event.
  */
  CameraController.prototype.startZoom = function startZoom(event) {
    
    //mousewheel delta
    if (event.wheelDelta !== undefined) {
      delta = event.wheelDelta;
    } else if (event.detail !== undefined) {
      delta = -event.detail;
    }

    //center of the screen, in screen space (xy)
    var screenCenter = new THREE.Vector2();
    screenCenter.x=0.5*window.innerWidth;
    screenCenter.y=0.5*window.innerHeight;

    //world point (xyz) under screen center
    var pointUnderScreenCenter = _this.get3DPointAtScreenXY(screenCenter);

    var pointUnderCursor = _this.get3DPointAtScreenXY(_this.getMousePos(event));

    var zoomTarget = new THREE.Vector3();
    zoomTarget.copy(pointUnderScreenCenter);
    zoomTarget.copy(pointUnderCursor);

    var newPos = new THREE.Vector3();

    //Zoom IN
    if(delta>0){

      //debug
      debugCube.position.copy(zoomTarget);
      debugCube.updateMatrixWorld();

      //target position
      newPos.lerpVectors(_this.position,zoomTarget,_this.zoomInFactor);
      
      //initiate travel
      _this.startTravel(newPos,_this.zoomTravelTime, false, newPos, false);

    }
    //Zoom OUT
    else if(delta<0){

      //debug
      debugCube.position.copy(zoomTarget);
      debugCube.updateMatrixWorld();

      //target position
      newPos.lerpVectors(_this.position,zoomTarget,-1*_this.zoomOutFactor);
      
       //initiate travel
      _this.startTravel(newPos,_this.zoomTravelTime, false, newPos, false);

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

          console.log(intersects[i].object.userData);

          //intersects[ i ].object.material.color.set( 0xff0000 );
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
