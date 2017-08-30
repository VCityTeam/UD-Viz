/**
* Generated On: 2016-05-18
* Class: Document Handler
* Description : TO DO
*/

THREE = itowns.THREE;

var docBrowserWindowIsActive = false;
var billboardsAreActive = true;



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

    // Create the event.
    this.event = document.createEvent('Event');

    // Define that the event name is 'build'.
    this.event.initEvent('docInit', true, true);



    /**
    * adds a Document to the DocumentHandler.
    *
    * @param event : the mouse down event.
    */
    this.addDocument = function addDocument(docIndex,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion,data) {

        var doc = new Document(docIndex,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion, data);
        this.AllDocuments.push(doc);

    };

    // called by loadDocsFromFile() when loading is done
    // do not call by another way !
    // docDataFromFile is a data array obtained from the file
    this.initialize = function initialize(docDataFromFile){

        for (var i=0; i<docDataFromFile.length; i++) {

            var docData = docDataFromFile[i];
            var docIndex = i;
            var docImageSourceHD = "Docs/"+docData[0];
            var docImageSourceBD = "Docs/"+docData[1];

            var docViewPos = new THREE.Vector3();
            docViewPos.x = parseFloat(docData[4]);
            docViewPos.y = parseFloat(docData[5]);
            docViewPos.z = parseFloat(docData[6]);

            var docViewQuat = new THREE.Quaternion();
            docViewQuat.x = parseFloat(docData[7]);
            docViewQuat.y = parseFloat(docData[8]);
            docViewQuat.z = parseFloat(docData[9]);
            docViewQuat.w = parseFloat(docData[10]);

            this.addDocument(docIndex,docImageSourceHD,docImageSourceBD,"none",docViewPos,docViewQuat,"");

        }

        this.currentDoc = this.AllDocuments[0];

        this.updateBrowser();
        console.log("doc init : ",this.AllDocuments);

        // target can be any Element or other EventTarget.
        window.dispatchEvent(this.event);


    }

    this.loadDocsFromFile = function loadDocsFromFile(filePath){

        readCSVFile(filePath, this.initialize.bind(this));

    }

    /**
    * adds a Document to the DocumentHandler.
    *
    * @param event : the mouse down event.
    */
    this.update = function update() {

        this.AllDocuments.forEach(function(element){
            if(!element.useBillboard){
                return;
            }
            element.billboardGeometry.lookAt(this.controls.camera.position);
            element.billboardGeometryFrame.lookAt(this.controls.camera.position);
            element.billboardGeometry.updateMatrixWorld();
            element.billboardGeometryFrame.updateMatrixWorld();
        });

    };

    this.nextDoc = function nextDoc(){

        const index = this.currentDoc.index;

        if(index+1 >= this.AllDocuments.length){

            return;
        }
        else {

            this.currentDoc = this.AllDocuments[index+1];
            this.updateBrowser();
        }


    }

    this.previousDoc = function previousDoc(){

        const index = this.currentDoc.index;
        if(index === 0){
            return;
        }
        else {

            this.currentDoc = this.AllDocuments[index-1];
            this.updateBrowser();
        }


    }


    this.updateBrowser = function updateBrowser(){

        // update text TO DO
        document.getElementById('docBrowserPreviewImg').src = this.currentDoc.imageSourceBD;


    }

    this.showBillboards = function showBillboards(){

        document.getElementById("docBrowserToggleBillboard").innerHTML = "MASQUER DOCS";

        this.AllDocuments.forEach(function(element){
            if(!element.useBillboard){
                return;
            }
            this.view.scene.add(element.billboardGeometry);
            this.view.scene.add(element.billboardGeometryFrame);
            element.billboardGeometry.updateMatrixWorld();
            element.billboardGeometryFrame.updateMatrixWorld();
        });

        this.view.notifyChange(true);
    }

    this.hideBillboards = function hideBillboards(){

        document.getElementById("docBrowserToggleBillboard").innerHTML = "AFFICHER DOCS";

        this.AllDocuments.forEach(function(element){
            if(!element.useBillboard){
                return;
            }
            this.view.scene.remove(element.billboardGeometry);
            this.view.scene.remove(element.billboardGeometryFrame);
            element.billboardGeometry.updateMatrixWorld();
            element.billboardGeometryFrame.updateMatrixWorld();
        });

        this.view.notifyChange(true);
    }

    this.toggleBillboards = function toggleBillboards(){

        billboardsAreActive = !billboardsAreActive;

        if(billboardsAreActive){
            this.showBillboards();

        }
        else{
            this.hideBillboards();

        }
    }

    /**
    * TO DO !!!!!!!!!!!!!! in doc handler instead of in controls ?
    */
    this.focusOnDoc = function focusOnDoc() {

        document.getElementById('docFullImg').style.opacity=1;
        document.getElementById('docOpaSlider').value = 100;
        document.querySelector('#docOpacity').value = 100;

        document.getElementById('docFull').style.display = "block";
        document.getElementById('docFullImg').src = this.currentDoc.imageSourceHD;
        document.getElementById('docBrowserPreviewImg').src = this.currentDoc.imageSourceBD;

        //document.getElementById('docBrowserWindow').style.display = "block";

        if(!isNaN(this.currentDoc.viewPosition.x) && !isNaN(this.currentDoc.viewQuaternion.x)){
            console.log(this.currentDoc.viewPosition);
            this.controls.initiateTravel(this.currentDoc.viewPosition,"auto",this.currentDoc.viewQuaternion,true);
        }

    };

    this.closeDocFull = function closeDocFull(){
        document.getElementById('docFull').style.display = "none";
        document.getElementById('docFullImg').src = null;
    }

    // check if clicking on a billboard document, if yes : orient view
    this.onMouseClick = function onMouseClick(event){

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
            this.focusOnDoc();
        }
    };

    this.onKeyDown = function onKeyDown(event){
        if (event.keyCode === 79) {
            console.log("camera position : ",this.controls.camera.position);
            console.log("camera quaternion : ",this.controls.camera.quaternion);
        }
    }

    this.domElement.addEventListener('mousedown', this.onMouseClick.bind(this), false);
    window.addEventListener('keydown',this.onKeyDown.bind(this),false);

    document.getElementById("docFullOrient").addEventListener('mousedown', this.focusOnDoc.bind(this),false);
    document.getElementById("docFullClose").addEventListener('mousedown',this.closeDocFull.bind(this),false);
    document.getElementById("docBrowserToggleBillboard").addEventListener('mousedown',this.toggleBillboards.bind(this),false);
    document.getElementById("docBrowserNextButton").addEventListener('mousedown',this.nextDoc.bind(this),false);
    document.getElementById("docBrowserPreviousButton").addEventListener('mousedown',this.previousDoc.bind(this),false);
    document.getElementById("docBrowserOrientButton").addEventListener('mousedown', this.focusOnDoc.bind(this),false);

    /*
    this.addDocument(
    0,
    'test1.png',
    'test1BD.png',
    target.add(new THREE.Vector3(200,-200,0)),
    new THREE.Vector3(1844763,5174252,620),
    new THREE.Quaternion(0.6081,0.10868,0.13836,0.77414),
    'doc 0 data'
);

this.addDocument(
1,
'test2.png',
'test2.png',
target.add(new THREE.Vector3(300,000,0)),
new THREE.Vector3(1844789,5172976,628),
new THREE.Quaternion(0.625,0.105,0.128,0.762),
'doc 1 data'
);

this.addDocument(
2,
'test3.png',
'test3.png',
"none",
new THREE.Vector3(1842789,5173976,628),
new THREE.Quaternion(0.625,0.105,0.128,0.762),
'doc 2 data'
);

this.addDocument(
3,
'test4.png',
'test4.png',
target.add(new THREE.Vector3(-600,-300,0)),
new THREE.Vector3(1844018,5175759,1908),
new THREE.Quaternion(0.000,0.0000,0.0800,1.0),
'doc 3 data'
);
*/



this.loadDocsFromFile("docs.csv");




}

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

    this.useBillboard = (billboardPosition!=="none");

    this.billboardPosition = billboardPosition;

    this.viewPosition = docViewPosition;
    this.viewQuaternion = docViewQuaternion;

    this.billboardGeometry = null;
    this.billboardGeometryFrame = null;
    this.docBillboardData = null;

    this.createBillboard = function createBillboard(){

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

    if(this.useBillboard){
        this.createBillboard();
    }
}





// Document User Interface ===========================================================

function docOpaUpdate(opa){
    document.querySelector('#docOpacity').value = opa;
    document.getElementById('docFullImg').style.opacity = opa/100;
}


document.getElementById("docBrowserTab").onclick = function () {
    document.getElementById('docBrowserWindow').style.display = docBrowserWindowIsActive ? "none" : "block";
    docBrowserWindowIsActive = docBrowserWindowIsActive ? false : true;


};

document.getElementById("docBrowserText").innerHTML = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis augue velit, egestas eu posuere faucibus, aliquet sed eros. Donec vel dictum lorem. Sed sed commodo turpis.Vestibulum ornare sapien et purus sollicitudin egestas. Nunc rutrum ac dolor eu imperdiet. Cras lacinia, odio sitamet scelerisque porttitor, nisi mi pharetra tellus, non sagittis est lorem finibus nisi. Aliquam sed dolor quis esttempus finibus quis uturna.Aeneacommodoat sapien quis eleifend. Sed blandit nisi eu nisl dapibus, in efficitur mauris accumsan. Suspendisse potenti. Aenean lacus ex, aliquet at mauris a, vulputate tincidunt nibh. Interdum et malesuada fames ac ante ipsum primis in faucibus.";
