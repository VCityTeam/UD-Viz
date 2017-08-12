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

var _this2 = null;

var _this3 = null;

var AllDocuments = [];


/**
 * Constructor
 * @param domElement :
 * @param view :
 * @param clock :
 */

function DocumentsHandler(domElement, view, controls) {

  _this2 = this;

  _this2.view = view;

  _this2.controls = controls;

}

/**
 * Constructor
 * @param domElement :
 * @param view :
 * @param clock :
 */

function Document(billboardPosition) {

  _this3 = this;

  _this3.image = null;

  _this3.billboardPosition = billboardPosition;

  var texture = new THREE.TextureLoader().load('test.png');
  console.log(texture);
  var material = new THREE.MeshBasicMaterial({map: texture});

  _this3.billboardGeometry = new THREE.Mesh( new THREE.PlaneGeometry( 60, 40, 1 , 1), material );

  _this3.billboardGeometry.position.copy(billboardPosition);

  _this3.billboardGeometry.updateMatrixWorld();

  _this3.billboardGeometry.userData = "myawesomedata";

}

/**
 * adds a Document to the DocumentHandler.
 *
 * @param event : the mouse down event.
 */
DocumentsHandler.prototype.addDocument = function addDocument(position) {

  var doc = new Document(position);
  AllDocuments.push(doc);
  _this2.view.scene.add(doc.billboardGeometry);

}

/**
 * adds a Document to the DocumentHandler.
 *
 * @param event : the mouse down event.
 */
DocumentsHandler.prototype.update = function update() {

  AllDocuments.forEach(function(currentValue){
    currentValue.billboardGeometry.lookAt(_this2.controls.position);
    currentValue.billboardGeometry.updateMatrixWorld();
  });

}
