/**
 * Generated On: 2016-05-18
 * Class: Document Handler
 * Description : TO DO
 */

THREE = itowns.THREE;

var _this = null;

var _this3 = null;

var docBrowserWindowIsActive = false;
var guidedTourWindowIsActive = false;
var temporalWindowIsActive = false;

var currentDocData;

//var AllDocuments = [];


/**
 * Constructor
 * @param domElement :
 * @param view :
 * @param controls :
 */

function DocumentsHandler(view, controls) {

  this.view = view;

  this.domElement = view.mainLoop.gfxEngine.renderer.domElement;

  this.controls = controls;

  this.camera = view.camera.camera3D;

  this.AllDocuments = [];

  this.view.addFrameRequester(this);

  this.domElement.addEventListener('mousedown', onMouseClick.bind(this), false);

  /**
   * adds a Document to the DocumentHandler.
   *
   * @param event : the mouse down event.
   */
  this.addDocument = function addDocument(docIndex,docImageSource,billboardPosition,docViewPosition,docViewQuaternion,data) {

    var doc = new Document(docIndex,docImageSource,billboardPosition,docViewPosition,docViewQuaternion, data);
    this.AllDocuments.push(doc);
    this.view.scene.add(doc.billboardGeometry);
    this.view.scene.add(doc.billboardGeometryFrame);


};

  /**
   * adds a Document to the DocumentHandler.
   *
   * @param event : the mouse down event.
   */
  this.update = function update() {

    this.AllDocuments.forEach(function(currentValue){
      currentValue.billboardGeometry.lookAt(this.controls.position);
      currentValue.billboardGeometryFrame.lookAt(this.controls.position);
      currentValue.billboardGeometry.updateMatrixWorld();
      currentValue.billboardGeometryFrame.updateMatrixWorld();
    });

};

/**
* TO DO !!!!!!!!!!!!!! in doc handler instead of in controls ?
*/
this.orientViewToDoc = function orientViewToDoc() {

  document.getElementById('docFullImg').style.opacity=1;
  document.getElementById('docOpaSlider').value = 100;
  document.querySelector('#docOpacity').value = 100;

  document.getElementById('docFull').style.display = "block";
  document.getElementById('docFullImg').src = currentDocData.imageSource;
  document.getElementById('docBrowserPreviewImg').src = currentDocData.imageSource;

  //document.getElementById('docBrowserWindow').style.display = "block";

  this.controls.initiateTravel(currentDocData.viewPosition,"auto",currentDocData.viewQuaternion,true);

};


}

var onMouseClick = function onMouseClick(event){

    var onDoc = false;

    var mouse = new THREE.Vector2();

    var raycaster = new THREE.Raycaster();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, this.camera );
    var intersects = raycaster.intersectObjects( this.view.scene.children );
    for ( var i = 0; i < intersects.length; i++ ) {

      if( intersects[ i ].object.userData.type === 'billboard'){

        onDoc = true;
        currentDocData = intersects[i].object.userData;

      }

    }

    if(onDoc){

      this.orientViewToDoc();

    }

    return onDoc;

};





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
