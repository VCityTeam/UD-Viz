/**
* Generated On: 2016-05-18
* Class: Document Handler
* Description : TO DO
*/

THREE = itowns.THREE;

var docBrowserWindowIsActive = false;
var guidedTourWindowIsActive = false;
var temporalWindowIsActive = false;

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

    this.currentDoc = null;

    this.view.addFrameRequester(this);



    /**
    * adds a Document to the DocumentHandler.
    *
    * @param event : the mouse down event.
    */
    this.addDocument = function addDocument(docIndex,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion,data) {

        var doc = new Document(docIndex,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion, data);
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
            currentValue.billboardGeometry.lookAt(this.controls.camera.position);
            currentValue.billboardGeometryFrame.lookAt(this.controls.camera.position);
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
        document.getElementById('docFullImg').src = this.currentDoc.imageSourceHD;
        document.getElementById('docBrowserPreviewImg').src = this.currentDoc.imageSourceBD;

        //document.getElementById('docBrowserWindow').style.display = "block";

        this.controls.initiateTravel(this.currentDoc.viewPosition,"auto",this.currentDoc.viewQuaternion,true);

    };

    this.domElement.addEventListener('mousedown', onMouseClick.bind(this), false);
    document.getElementById("docFullOrient").addEventListener('mousedown', this.orientViewToDoc.bind(this),false);




}

// check if clicking on a billboard document, if yes : orient view
var onMouseClick = function onMouseClick(event){

    var onBillboard = false;

    var mouse = new THREE.Vector2();

    var raycaster = new THREE.Raycaster();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, this.camera );
    var intersects = raycaster.intersectObjects( this.view.scene.children );
    for ( var i = 0; i < intersects.length; i++ ) {

        if( intersects[ i ].object.userData.type === 'billboard'){

            onBillboard = true;
            this.currentDoc = intersects[i].object.userData.doc;
        }
    }

    if(onBillboard){
        this.orientViewToDoc();
    }
};





/**
* Constructor
* @param domElement :
* @param view :
* @param clock :
*/

function Document(docIndex,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion,data) {

    this.index = docIndex;
    this.imageSourceHD = docImageSourceHD;
    this.imageSourceBD = docImageSourceBD;

    this.billboardPosition = billboardPosition;

    this.viewPosition = docViewPosition;
    this.viewQuaternion = docViewQuaternion;

    const texture = new THREE.TextureLoader().setCrossOrigin("anonymous").load(docImageSourceBD);
    const billboardMaterial = new THREE.MeshBasicMaterial({map: texture});
    const frameMaterial = new THREE.MeshBasicMaterial( {color: 0x00ffaa,wireframe: true});

    this.billboardGeometry = new THREE.Mesh( new THREE.PlaneGeometry( 80, 50, 1 , 1), billboardMaterial );
    this.billboardGeometryFrame =  new THREE.Mesh(new THREE.PlaneGeometry( 80, 50, 1 , 1), frameMaterial );

    this.billboardGeometry.position.copy(billboardPosition);
    this.billboardGeometryFrame.position.copy(billboardPosition);
    this.billboardGeometry.updateMatrixWorld();
    this.billboardGeometryFrame.updateMatrixWorld();

    this.docBillboardData = {
        type : "billboard",
        index : docIndex,
        doc : this,
        imageSourceHD : docImageSourceHD,
        imageSourceBD : docImageSourceBD,
        viewPosition : docViewPosition,
        viewQuaternion : docViewQuaternion,
        metadata : data
    };

    this.billboardGeometry.userData = this.docBillboardData;

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
