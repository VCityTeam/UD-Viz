/**
 * Generated On: 2016-05-18
 * Class: Document Handler
 * Description : TO DO
 */

THREE = itowns.THREE;

var _this2 = null;

var _this3 = null;

var docBrowserWindowIsActive = false;
var guidedTourWindowIsActive = false;
var temporalWindowIsActive = false;

//var AllDocuments = [];


/**
 * Constructor
 * @param domElement :
 * @param view :
 * @param controls :
 */

function DocumentsHandler(view, controls) {

  _this2 = this;

  _this2.view = view;

  _this2.controls = controls;

  _this2.AllDocuments = [];

  _this2.view.addFrameRequester(this);

}

/**
 * Constructor
 * @param domElement :
 * @param view :
 * @param clock :
 */

function Document(docIndex,docImageSource,billboardPosition,docViewPosition,docViewQuaternion,data) {

  _this3 = this;

  _this3.image = docImageSource;

  _this3.billboardPosition = billboardPosition;

  var texture = new THREE.TextureLoader().setCrossOrigin("anonymous").load(docImageSource);
  var billboardMaterial = new THREE.MeshBasicMaterial({map: texture});
  var frameMaterial = new THREE.MeshBasicMaterial( {color: 0x00ffaa,wireframe: true});

  _this3.billboardGeometry = new THREE.Mesh( new THREE.PlaneGeometry( 80, 50, 1 , 1), billboardMaterial );


  _this3.billboardGeometryFrame =  new THREE.Mesh(new THREE.PlaneGeometry( 80, 50, 1 , 1), frameMaterial );

  _this3.billboardGeometry.position.copy(billboardPosition);

  _this3.billboardGeometryFrame.position.copy(billboardPosition);

  _this3.billboardGeometry.updateMatrixWorld();

 _this3.billboardGeometryFrame.updateMatrixWorld();




  var docBillboardData = {
    type : "billboard",
    index : docIndex,
    imageSource : docImageSource,
    viewPosition : docViewPosition,
    viewQuaternion : docViewQuaternion,
    metadata : data
  };

  _this3.billboardGeometry.userData = docBillboardData;

}

/**
 * adds a Document to the DocumentHandler.
 *
 * @param event : the mouse down event.
 */
DocumentsHandler.prototype.addDocument = function addDocument(docIndex,docImageSource,billboardPosition,docViewPosition,docViewQuaternion,data) {

  var doc = new Document(docIndex,docImageSource,billboardPosition,docViewPosition,docViewQuaternion, data);
  _this2.AllDocuments.push(doc);
  _this2.view.scene.add(doc.billboardGeometry);
  _this2.view.scene.add(doc.billboardGeometryFrame);


}

/**
 * adds a Document to the DocumentHandler.
 *
 * @param event : the mouse down event.
 */
DocumentsHandler.prototype.update = function update() {

  _this2.AllDocuments.forEach(function(currentValue){
    currentValue.billboardGeometry.lookAt(_this2.controls.position);
    currentValue.billboardGeometryFrame.lookAt(_this2.controls.position);
    currentValue.billboardGeometry.updateMatrixWorld();
    currentValue.billboardGeometryFrame.updateMatrixWorld();
  });

}

// Document User Interface ===========================================================

function docOpaUpdate(opa){
  document.querySelector('#docOpacity').value = opa;
  document.getElementById('docFullImg').style.opacity = opa/100;
}

document.getElementById("docFullClose").onclick = function () {
    document.getElementById('docFull').style.display = "none";
    document.getElementById('docFullImg').src = null;


};

document.getElementById("docFullOrient").onclick = function () {
    controls.orientViewToDoc();


};

document.getElementById("docBrowserTab").onclick = function () {
    document.getElementById('docBrowserWindow').style.display = docBrowserWindowIsActive ? "none" : "block";
    docBrowserWindowIsActive = docBrowserWindowIsActive ? false : true;


};

document.getElementById("guidedTourTab").onclick = function () {
    document.getElementById('guidedTourWindow').style.display = guidedTourWindowIsActive ? "none" : "block";
    guidedTourWindowIsActive = guidedTourWindowIsActive ? false : true;


};

document.getElementById("temporalTab").onclick = function () {
    document.getElementById('temporalWindow').style.display = temporalWindowIsActive ? "none" : "block";
    temporalWindowIsActive = temporalWindowIsActive ? false : true;


};
