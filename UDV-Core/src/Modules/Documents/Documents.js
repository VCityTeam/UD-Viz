/**
* Classes: Document Handler & Document
* Description :
* The Document Handler is an object holding and managing Document objects
* It handles the display of documents in the document browser window, the central window, and billboards.
* Documents are objects with properties : source image, title, date, metadata, camera position,
* camera quaternion (both for the oriented view) and billboard position
*/

import * as THREE from 'three';
import { MAIN_LOOP_EVENTS } from 'itowns';
import { readCSVFile } from '../../Tools/CSVLoader.js';
import './Documents.css';
import DefaultImage from './DefaultImage.png';

// TO DO : pass showBillboardButton as an option to DocumentsHandler
// currently, BILLBOARDS WILL BE ALWAYS HIDDEN if the showBillboardButton global var is set to false !!

/**
* Constructor for DocumentsHandler Class
* The Document Handler is an object holding and managing Document objects.
* It handles the display of documents in the document browser window and the central window.
* Document data is loaded from a csv file, and initialization is only done after loading (asynchronous)
* @param view : itowns planar view
* @param controls : PlanarControls instance
* @param dataFile : CSV file holding the documents data
* @param options : optional parameters (including TemporalController)
*/
//=============================================================================
export function DocumentsHandler(view, controls, dataFile, options = {}) {

    //update the html with elements for this class (windows, buttons etc)
    var docDiv = document.createElement("div");
    docDiv.id = 'doc';
    document.body.appendChild(docDiv);

    document.getElementById("doc").innerHTML ='<button id="docBrowserTab">DOC</button>\
    <div id="docBrowserWindow">\
    <div id="docBrowserTitle">doc title</div>\
    <div id="docBrowserMetaData">metadata</div>\
    <div id="docBrowserPreview"><img id="docBrowserPreviewImg"/></div>\
    <div id="docBrowserDoc_ID"></div>\
    <div id="guidedTourText2"></div>\
    <div id="docBrowserIndex"></div>\
    <button id="docBrowserNextButton" type=button>⇨</button>\
    <button id="docBrowserPreviousButton" type=button>⇦</button>\
    <button id="docBrowserOrientButton" type=button>ORIENTER</button>\
    </div>\
    <div id="docFull">\
    <img id="docFullImg"/>\
    <div id="docFullPanel">\
    <button id="docFullClose" type=button>FERMER</button>\
    <button id="docFullOrient" type=button>ORIENTER</button>\
    <label id="docOpaLabel" for="docOpaSlider">Opacité</label>\
    <input id="docOpaSlider" type="range" min="0" max="100" value="75"\
    step="1" oninput="docOpaUpdate(value)">\
    <output for="docOpaSlider" id="docOpacity">50</output>\
    </div>\
    </div>\
    <button id="docBrowserToggleBillboard"\
    type=button\
    style="display:none;">Billboard</button>\
    ';

    // Importing the default image (when no document is present)
    var defaultImage = document.getElementById('docBrowserPreviewImg');
    defaultImage.src = DefaultImage;

    /////////////////////////////////////////////////////////////////////
    //dirty variables to test billboards
    var billboardsAreActive = false;
    var showBillboardButton = false;

    // TO DO
    this.view = view;

    // TO DO
    this.domElement = view.mainLoop.gfxEngine.renderer.domElement;

    // PlanarControls instance, required for the oriented view TO DO
    this.controls = controls;

    this.camera = view.camera.camera3D;

    // path to the csv file holding the guided tour data
    const CSVdataFile = dataFile;

    // TemporalController instance (optional)
    // this is used to set the current date according to the selected document
    this.temporal = options.temporal;

    // state of the browser window (open / closed), intial state can be set via options
    this.docBrowserWindowIsActive = options.docBrowserWindowStartActive || false;

    // array containing all the documents loaded from the csv file
    this.AllDocuments = [];

    // currently active document
    this.currentDoc = null;

    // doc fade-in animation duration, in milliseconds
    this.fadeDuration = options.docFadeDuration || 2750;

    // fade animation handlers
    this.isOrientingDoc = false;
    this.isFadingDoc = false;
    this.fadeAlpha = 0;

    // event to be dispatched when this controller has finished initializing
    this.initEvent = document.createEvent('Event');
    this.initEvent.initEvent('docInit', true, true);

    // adds a Document to the DocumentHandler.
    // for a detail of each parameter, see the Document constructor at the end of this file
    //=============================================================================
    this.addDocument = function addDocument(docTitle,docIndex,doc_ID,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion,docStartDate,metaData) {

    };

    /**
    * initialize the controller using data from the csv file
    * this function is called after the completion of readCSVFile() in this.loadDataFromFile()
    * @param docDataFromFile : contains the data loaded from the file
    */
    //==========================================================================
    this.initialize = function initialize(docDataFromFile){

        // fill the AllDocuments array with Documents objects
        // the Documents are placed in the order they are loaded, which is their line order in the csv file
        // the docIndex property is specified to be 0,1,2,3 etc... in the csv
        // therefore docIndex is equal to "i", but we specify it in the csv for clarity (we need docIndex for the guided tour csv)
        // the difference between docIndex and doc_ID (used by historians) should be settled asap
        for (var i=0; i<docDataFromFile.length; i++) {

            var docData = docDataFromFile[i];
            var docIndex = parseFloat(docData[0]);
            var doc_ID = parseFloat(docData[1]);
            var docImageSourceHD = "Vilo3D/Docs/"+docData[2];
            var docImageSourceBD = "Vilo3D/Docs/"+docData[3];
            var docTitle = docData[4].toString();

            var docStartDate = new Date(docData[5].toString());

            var docMetaData = docData[6].toString();

            // camera position for the oriented view
            var docViewPos = new THREE.Vector3();
            docViewPos.x = parseFloat(docData[7]);
            docViewPos.y = parseFloat(docData[8]);
            docViewPos.z = parseFloat(docData[9]);

            // camera orientation for the oriented view
            var docViewQuat = new THREE.Quaternion();
            docViewQuat.x = parseFloat(docData[10]);
            docViewQuat.y = parseFloat(docData[11]);
            docViewQuat.z = parseFloat(docData[12]);
            docViewQuat.w = parseFloat(docData[13]);

            // billboard position
            var docBillboardPos = new THREE.Vector3();
            docBillboardPos.x = parseFloat(docData[14]);
            docBillboardPos.y = parseFloat(docData[15]);
            docBillboardPos.z = parseFloat(docData[16]);

            var doc = new Document(docTitle,docIndex,doc_ID,docImageSourceHD,docImageSourceBD,docBillboardPos,docViewPos,docViewQuat,docStartDate,docMetaData);

            // we fill the AllDocuments array with the new doc
            // this doc is accessed using AllDocuments[docIndex]
            this.AllDocuments.push(doc);

        }

        // load the first doc as current doc
        this.currentDoc = this.AllDocuments[0];

        this.updateBrowser();

        if(billboardsAreActive){
            this.showBillboards(true);
        }
        else{
            this.hideBillboards(true)
        }

        // dispatch the event to notify that Document Handler has finished its initialization
        // classes that depends on Document Handler will catch the event and begin their own initialization
        window.dispatchEvent(this.initEvent);

    }

    //==========================================================================
    this.loadDataFromFile = function loadDataFromFile(){

        readCSVFile(CSVdataFile, this.initialize.bind(this));

    }

    // called regularly by the itowns framerequester
    //=========================================================================
    this.update = function update(dt,updateLoopRestarted) {
        // dt will not be relevant when we just started rendering, we consider a 1-frame move in this case
        if (updateLoopRestarted) {
            dt = 16;
        }

        // controls.state === -1 corresponds to state === STATE.NONE
        // if state is -1 this means the controls have finished the animated travel
        // then we can begin the doc fade animation
        if(this.isOrientingDoc && this.controls.state === -1){

            this.isOrientingDoc = false;
            this.isFadingDoc = true;
            this.fadeAlpha = 0;

            document.getElementById('docOpaSlider').value = 0;
            document.querySelector('#docOpacity').value = 0;
            document.getElementById('docFullImg').style.opacity=0;
            document.getElementById('docFullPanel').style.display = "block";
        }

        // handle fade animation
        if(this.isFadingDoc){

            this.fadeAlpha += dt/this.fadeDuration;
            if(this.fadeAlpha>=1){
                // animation is complete
                this.isFadingDoc = false;
                document.getElementById('docFullImg').style.opacity=1;
                document.getElementById('docOpaSlider').value = 100;
                document.querySelector('#docOpacity').value = 100;
            }
            else{
                // if not complete :
                document.getElementById('docFullImg').style.opacity=this.fadeAlpha;
                document.getElementById('docOpaSlider').value = this.fadeAlpha*100;
                document.querySelector('#docOpacity').value = Math.trunc(this.fadeAlpha*100);
            }

            // request the framerequester for another call to this.update()
            // TO DO : explain false
            this.view.notifyChange(false);

        }

        // billboards lookat camera
        this.AllDocuments.forEach((element)=>{
            if(!element.useBillboard){
                return;
            }
            element.billboardGeometry.lookAt(this.controls.camera.position);
            element.billboardGeometryFrame.lookAt(this.controls.camera.position);
            element.billboardGeometry.updateMatrixWorld();
            element.billboardGeometryFrame.updateMatrixWorld();
        });

    };

    // go to next document (by index) in the browser
    //==========================================================================
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

    // go to previous document (by index) in the browser
    //==========================================================================
    this.previousDoc = function previousDoc(){

        const index = this.currentDoc.index;
        if(index ===0){
            return;
        }
        else {

            this.currentDoc = this.AllDocuments[index-1];
            this.updateBrowser();
        }
    }

    // update doc browser (text, image, index)
    //==========================================================================
    this.updateBrowser = function updateBrowser(){

        document.getElementById('docBrowserPreviewImg').src = this.currentDoc.imageSourceBD;
        document.getElementById('docBrowserMetaData').innerHTML = this.currentDoc.metaData;
        document.getElementById('docBrowserTitle').innerHTML = this.currentDoc.title;
        document.getElementById('docBrowserIndex').innerHTML = "index : " + this.currentDoc.index;
        document.getElementById('docBrowserDoc_ID').innerHTML = "Doc_ID : " + this.currentDoc.doc_ID;

    }

    // show billboards
    // if forceShow is true, show
    // if forceShow is false and billboardsAreActive is false, do not show
    //==========================================================================
    this.showBillboards = function showBillboards(forceShow){

        if(!forceShow && !billboardsAreActive){
            return;
        }

        document.getElementById("docBrowserToggleBillboard").innerHTML = "Masquer Billboards";

        this.AllDocuments.forEach((element)=>{
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

    // hide billboards
    // if forceHide is true, hide
    // if forceHide is false and billboardsAreActive is true, do not hide
    //=============================================================================
    this.hideBillboards = function hideBillboards(forceHide){

        if(!forceHide && billboardsAreActive){
            return;
        }

        document.getElementById("docBrowserToggleBillboard").innerHTML = "Afficher Billboards";

        this.AllDocuments.forEach((element)=>{
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

    // hide or show billboards
    //=============================================================================
    this.toggleBillboards = function toggleBillboards(){

        if(billboardsAreActive){
            billboardsAreActive = false;
            this.hideBillboards(true);

        }
        else{
            billboardsAreActive = true;
            this.showBillboards(true);

        }
    }

    // triggers the "oriented view" of the current docIndex
    // this will display the doc image in the middle of the screen
    // and initiate the animated travel to orient the camera
    //=============================================================================
    this.focusOnDoc = function focusOnDoc() {

        // display the image (begins loading) but with opacity 0 (hidden)
        document.getElementById('docFullImg').src = this.currentDoc.imageSourceHD;
        document.getElementById('docBrowserPreviewImg').src = this.currentDoc.imageSourceBD;
        document.getElementById('docFullImg').style.opacity=0;
        document.getElementById('docOpaSlider').value = 0;
        document.querySelector('#docOpacity').value = 0;
        document.getElementById('docFull').style.display = "block";
        document.getElementById('docFullPanel').style.display = "none";

        // if we have valid data, initiate the animated travel to orient the camera
        if(!isNaN(this.currentDoc.viewPosition.x) && !isNaN(this.currentDoc.viewQuaternion.x)){

            this.controls.initiateTravel(this.currentDoc.viewPosition,"auto",this.currentDoc.viewQuaternion,true);
        }

        // adjust the current date if we use temporal
        if(this.temporal){

            temporal.changeDate(this.currentDoc.startDate);
        }

        this.hideBillboards(true);

        this.isOrientingDoc = true;
        this.isFadingDoc = false;

        //to request an update
        this.view.notifyChange(false);

    };

    // close the center window (oriented view / doc focus)
    //=========================================================================
    this.closeDocFull = function closeDocFull(){
        document.getElementById('docFull').style.display = "none";
        document.getElementById('docFullImg').src = null;
        this.showBillboards(false);
    }

    // hide or show the doc browser
    //=========================================================================
    this.toggleDocBrowserWindow = function toggleDocBrowserWindow(){

        document.getElementById('docBrowserWindow').style.display = this.docBrowserWindowIsActive ? "none" : "block";
        this.docBrowserWindowIsActive = this.docBrowserWindowIsActive ? false : true;

    }

    // on mouseclick : check if user is clicking on a billboard document, if yes : orient view
    //=========================================================================
    this.onMouseClick = function onMouseClick(event){

        var mouse = new THREE.Vector2();

        var raycaster = new THREE.Raycaster();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera( mouse, this.camera );
        // we could optimize here, parse the scene first and get the children which are billboards, then intersects
        var intersects = raycaster.intersectObjects( this.view.scene.children );
        for ( var i = 0; i < intersects.length; i++ ) {

            // check if object is a billboard
            // the billboard "type" is in the userData of the geometry
            // (this is done in the Document constructor)
            if( intersects[ i ].object.userData.type === 'billboard'){
                this.currentDoc = intersects[i].object.userData.doc;
                // trigger focusOnDoc (oriented camera view) if object is a billboard
                this.focusOnDoc();
                break;
            }
        }

    };

    //output the camera position and quaternion in console with O (letter) key
    //=========================================================================
    this.onKeyDown = function onKeyDown(event){
        if (event.keyCode === 79) {
            console.log("camera position : ",this.controls.camera.position);
            console.log("camera quaternion : ",this.controls.camera.quaternion);
        }
    }

    // itowns framerequester : will regularly call this.update()
    this.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
                                 this.update.bind(this) );

    // event listener for a mouse click on the scene, used to detect click on billboard
    this.domElement.addEventListener('mousedown', this.onMouseClick.bind(this), false);

    // event listener for keyboard
    window.addEventListener('keydown',this.onKeyDown.bind(this),false);

    // event listeners for buttons
    document.getElementById("docFullOrient").addEventListener('mousedown', this.focusOnDoc.bind(this),false);
    document.getElementById("docFullClose").addEventListener('mousedown',this.closeDocFull.bind(this),false);
    document.getElementById("docBrowserToggleBillboard").addEventListener('mousedown',this.toggleBillboards.bind(this),false);
    document.getElementById("docBrowserNextButton").addEventListener('mousedown',this.nextDoc.bind(this),false);
    document.getElementById("docBrowserPreviousButton").addEventListener('mousedown',this.previousDoc.bind(this),false);
    document.getElementById("docBrowserOrientButton").addEventListener('mousedown', this.focusOnDoc.bind(this),false);
    document.getElementById("docBrowserTab").addEventListener('mousedown', this.toggleDocBrowserWindow.bind(this), false);

    // setup display
    document.getElementById("docBrowserToggleBillboard").style.display = (showBillboardButton)? "block" : "none";
    document.getElementById("docBrowserWindow").style.display = (!this.docBrowserWindowIsActive)? "none" : "block";

    // this will trigger the initialization, after file loading is complete
    this.loadDataFromFile();

}

/**
* Constructor for Document
* Currently, a document is an image with associated metadata (doc_ID, title, date, + other metadata...)
* + associated viewPosition & viewQuaternion (used by focusOnDoc() to orient the camera
* + associated billboard (optional)
*/
//=============================================================================
function Document(docTitle,docIndex,doc_ID,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion,docDate,metaData) {

    // unique ID for the doc, determined by the line in the doc csv file
    // must be a consecutive list of index (0,1,2,3,4 etc)
    // used internally by GuidedTourController and DocumentHandler
    this.index = docIndex;

    // another unique ID, used by historians to indentify documents
    // cannot be directly used internally, because the doc_ID list is not consecutive (gaps)
    // not used in the code, only displayed
    this.doc_ID = doc_ID;

    // path to the image (High Def & Bad Def)
    this.imageSourceHD = docImageSourceHD;
    this.imageSourceBD = docImageSourceBD;

    // other metadata (currently just a text)
    this.metaData = metaData;

    // date used by TemporalController : the date will become this date when the doc is focused
    this.startDate = docDate;

    this.title = docTitle;

    // if false, no billboard will be created or displayed for this docTitle
    // will be set to true if valid data is provided in the csv file
    this.useBillboard = (!isNaN(billboardPosition.x) && !isNaN(billboardPosition.y) && !isNaN(billboardPosition.z));

    // world position of the billboard (where it will be)
    this.billboardPosition = billboardPosition;

    // position & orientation of the camera when the doc is focused
    // must be determined by hand in order to align the doc image with the 3d scene
    this.viewPosition = docViewPosition;
    this.viewQuaternion = docViewQuaternion;

    // plane with the image
    this.billboardGeometry = null;
    // plane with wireframe (better visibility for the billboard)
    this.billboardGeometryFrame = null;

    // user data that will be given to the billboard object
    this.docBillboardData = null;

    // billboard geometry creation, only called if useBillboard is true
    // billboards are made of billboardGeometry (a plane with the image)
    // and billboardGeometryFrame which is only a wireframe to better see the billboard
    // this is very dirty :-o
    this.createBillboard = function createBillboard(){

        const texture = new THREE.TextureLoader().setCrossOrigin("anonymous").load(docImageSourceBD);
        const billboardMaterial = new THREE.MeshBasicMaterial({map: texture});
        const frameMaterial = new THREE.MeshBasicMaterial( {color: 0x00ffaa,wireframe: true});

        this.billboardGeometry = new THREE.Mesh( new THREE.PlaneGeometry( 80, 50, 1 , 1), billboardMaterial );
        this.billboardGeometryFrame =  new THREE.Mesh(new THREE.PlaneGeometry( 80, 50, 1 , 1), frameMaterial );

        // set billboards to the same layers as other buildings (controls will bug if not)
        this.billboardGeometry.layers.set(1);
        this.billboardGeometryFrame.layers.set(1);

        this.billboardGeometry.position.copy(billboardPosition);
        this.billboardGeometryFrame.position.copy(billboardPosition);
        this.billboardGeometry.updateMatrixWorld();
        this.billboardGeometryFrame.updateMatrixWorld();

        // these data can be accessed when the user click on the billboard
        // --type : "billboard"-- is used to identify when we click on a billboard
        // --doc : this-- is a reference the actual document object, which holds all the relevant data
        // other lines are mostly useless
        this.docBillboardData = {
            type : "billboard",
            doc : this,
        };

        // the data is added to the THREE.js object3D : https://threejs.org/docs/#api/core/Object3D
        this.billboardGeometry.userData = this.docBillboardData;
    }

    if(this.useBillboard){
        this.createBillboard();
    }
}


// in orientied view (focusOnDoc) this is called when the user changes the value of the opacity slider
//=============================================================================
function docOpaUpdate(opa){
    document.querySelector('#docOpacity').value = opa;
    document.getElementById('docFullImg').style.opacity = opa/100;
}
