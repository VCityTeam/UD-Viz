/**
* Generated On: 2016-05-18
* Class: Document Handler
* Description : TO DO
*/

THREE = itowns.THREE;

//update the html with elements for this class (windows, buttons etc)
var docDiv = document.createElement("div");
docDiv.id = 'doc';
document.body.appendChild(docDiv);

document.getElementById("doc").innerHTML ='<button id="docBrowserTab">DOC</button>\
    <div id="docBrowserWindow">\
        <div id="docBrowserTitle">doc title</div>\
        <div id="docBrowserMetaData">metadata</div>\
        <div id="docBrowserPreview"><img id="docBrowserPreviewImg" src = "test2.png"/></div>\
        <div id="guidedTourText2"></div>\
        <div id="docBrowserIndex">11/12</div>\
        <button id="docBrowserNextButton" type=button>⇨</button>\
        <button id="docBrowserPreviousButton" type=button>⇦</button>\
        <button id="docBrowserOrientButton" type=button>ORIENTER</button>\
        <button id="docBrowserToggleBillboard" type=button>Billboard</button>\
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
    </div>';

//dirty variables to test billboards
var billboardsAreActive = false;
var hideBillboardButton = true;

/**
* Constructor
* @param domElement :
* @param view :
* @param controls :
*/
//=============================================================================
function DocumentsHandler(view, controls, options = {}) {

    this.view = view;

    this.domElement = view.mainLoop.gfxEngine.renderer.domElement;

    this.controls = controls;

    this.camera = view.camera.camera3D;

    this.temporal = options.temporal;

    this.docBrowserWindowIsActive = options.docBrowserWindowStartActive || false;

    this.AllDocuments = [];

    this.currentDoc = null;

    this.isOrientingDoc = false;

    //doc fade-in animation duration, in milliseconds
    this.fadeDuration = options.docFadeDuration || 2750;

    this.isFadingDoc = false;
    this.fadeAlpha = 0;

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
    //=============================================================================
    this.addDocument = function addDocument(docTitle,docIndex,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion,docStartDate,metaData) {

        var doc = new Document(docTitle,docIndex,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion,docStartDate,metaData);
        this.AllDocuments.push(doc);

    };

    // called by loadDocsFromFile() when loading is done
    // do not call by another way !
    // docDataFromFile is a data array obtained from the file
    //=============================================================================
    this.initialize = function initialize(docDataFromFile){

        for (var i=0; i<docDataFromFile.length; i++) {

            var docData = docDataFromFile[i];
            var docIndex = i;
            var docImageSourceHD = "Docs/"+docData[0];
            var docImageSourceBD = "Docs/"+docData[1];
            var docTitle = docData[2].toString();

            var docStartDate = new Date(docData[3].toString());

            var docMetaData = docData[4].toString();

            var docViewPos = new THREE.Vector3();
            docViewPos.x = parseFloat(docData[5]);
            docViewPos.y = parseFloat(docData[6]);
            docViewPos.z = parseFloat(docData[7]);

            var docViewQuat = new THREE.Quaternion();
            docViewQuat.x = parseFloat(docData[8]);
            docViewQuat.y = parseFloat(docData[9]);
            docViewQuat.z = parseFloat(docData[10]);
            docViewQuat.w = parseFloat(docData[11]);

            var docBillboardPos = new THREE.Vector3();
            docBillboardPos.x = parseFloat(docData[12]);
            docBillboardPos.y = parseFloat(docData[13]);
            docBillboardPos.z = parseFloat(docData[14]);

            this.addDocument(docTitle,docIndex,docImageSourceHD,docImageSourceBD,docBillboardPos,docViewPos,docViewQuat,docStartDate,docMetaData);

        }

        this.currentDoc = this.AllDocuments[0];

        this.updateBrowser();

        if(billboardsAreActive){
            this.showBillboards(true);
        }
        else{
            this.hideBillboards(true)
        }

        // target can be any Element or other EventTarget.    document.getElementById('docFullImg').src = this.currentDoc.imageSourceHD;
        document.getElementById('docBrowserPreviewImg').src = this.currentDoc.imageSourceBD;
        window.dispatchEvent(this.event);


    }

    //=============================================================================
    this.loadDataFromFile = function loadDataFromFile(){

        readCSVFile("docs.csv", this.initialize.bind(this));

    }

    //=============================================================================
    this.update = function update(dt,updateLoopRestarted) {
        // dt will not be relevant when we just started rendering, we consider a 1-frame move in this case
        if (updateLoopRestarted) {
            dt = 16;
        }

        //controls.state === -1 corresponds to state === STATE.NONE
        //if state is -1 this means the controls have finished the animated travel
        //then we can begin the doc fade animation
        if(this.isOrientingDoc && this.controls.state === -1){

            this.isOrientingDoc = false;
            this.isFadingDoc = true;
            this.fadeAlpha = 0;

            document.getElementById('docOpaSlider').value = 0;
            document.querySelector('#docOpacity').value = 0;
            document.getElementById('docFullImg').style.opacity=0;
            document.getElementById('docFullPanel').style.display = "block";
        }

        //handle fade animation
        if(this.isFadingDoc){

            this.fadeAlpha += dt/this.fadeDuration;
            if(this.fadeAlpha>=1){
                //animation is complete
                this.isFadingDoc = false;
                document.getElementById('docFullImg').style.opacity=1;
                document.getElementById('docOpaSlider').value = 100;
                document.querySelector('#docOpacity').value = 100;
            }
            //if not complete :
            document.getElementById('docFullImg').style.opacity=this.fadeAlpha;
            document.getElementById('docOpaSlider').value = this.fadeAlpha*100;
            document.querySelector('#docOpacity').value = Math.trunc(this.fadeAlpha*100);

            //request the framerequester for another call to this.update()
            this.view.notifyChange(false);

        }

        //billboards lookat camera
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

    //=============================================================================
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

    //=============================================================================
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

    //=============================================================================
    this.updateBrowser = function updateBrowser(){

        // update text TO DO
        document.getElementById('docBrowserPreviewImg').src = this.currentDoc.imageSourceBD;
        document.getElementById('docBrowserMetaData').innerHTML = this.currentDoc.metaData;
        document.getElementById('docBrowserTitle').innerHTML = this.currentDoc.title;
        document.getElementById('docBrowserIndex').innerHTML = "index : " + this.currentDoc.index;
        console.log("testest");


    }

    //=============================================================================
    this.showBillboards = function showBillboards(forceShow){

        if(!forceShow && !billboardsAreActive){
            return;
        }

        billboardsAreActive = true;

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

    //=============================================================================
    this.hideBillboards = function hideBillboards(forceHide){

        if(!forceHide && billboardsAreActive){
            return;
        }

        billboardsAreActive = false;

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

    //=============================================================================
    this.toggleBillboards = function toggleBillboards(){

        if(billboardsAreActive){
            this.hideBillboards(true);

        }
        else{
            this.showBillboards(true);

        }
    }


    //=============================================================================
    this.focusOnDoc = function focusOnDoc() {


        document.getElementById('docFullImg').src = this.currentDoc.imageSourceHD;
        document.getElementById('docBrowserPreviewImg').src = this.currentDoc.imageSourceBD;
        document.getElementById('docFullImg').style.opacity=0;
        document.getElementById('docOpaSlider').value = 0;
        document.querySelector('#docOpacity').value = 0;
        document.getElementById('docFull').style.display = "block";
        document.getElementById('docFullPanel').style.display = "none";

        if(!isNaN(this.currentDoc.viewPosition.x) && !isNaN(this.currentDoc.viewQuaternion.x)){

            this.controls.initiateTravel(this.currentDoc.viewPosition,"auto",this.currentDoc.viewQuaternion,true);
        }


        if(this.temporal){

            temporal.changeDate(this.currentDoc.startDate);
        }

        this.hideBillboards(true);

        this.isOrientingDoc = true;
        this.isFadingDoc = false;
        this.view.notifyChange(true);



    };

    //=============================================================================
    this.startFadeIn = function startFadeIn(){

        // NOT USED
        console.log("loaded");


    }

    //=============================================================================
    this.closeDocFull = function closeDocFull(){
        document.getElementById('docFull').style.display = "none";
        document.getElementById('docFullImg').src = null;
        this.showBillboards(false);
    }

    //=============================================================================
    this.startGuidedTourMode = function startGuidedTourMode(){

        if(!this.docBrowserWindowIsActive){
            this.docBrowserWindowIsActive = true;
            document.getElementById('docBrowserWindow').style.display = "block";
        }
        document.getElementById('docBrowserPreviousButton').style.display = "none";
        document.getElementById('docBrowserNextButton').style.display = "none";
        document.getElementById('docBrowserIndex').style.display = "none";
    }

    //=============================================================================
    this.exitGuidedTourMode = function exitGuidedTourMode(){

        document.getElementById('docBrowserPreviousButton').style.display = "block";
        document.getElementById('docBrowserNextButton').style.display = "block";
        document.getElementById('docBrowserIndex').style.display = "block";
    }

    //=============================================================================
    this.toggleDocBrowserWindow = function toggleDocBrowserWindow(){

        document.getElementById('docBrowserWindow').style.display = this.docBrowserWindowIsActive ? "none" : "block";
        this.docBrowserWindowIsActive = this.docBrowserWindowIsActive ? false : true;

    }

    // check if clicking on a billboard document, if yes : orient view
    //=============================================================================
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

    //output the camera position and quaternion in console with O (letter) key
    //=============================================================================
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
    document.getElementById("docBrowserTab").addEventListener('mousedown', this.toggleDocBrowserWindow.bind(this), false);

    document.getElementById("docBrowserToggleBillboard").style.display = (hideBillboardButton)? "none" : "block";
    document.getElementById("docBrowserWindow").style.display = (!this.docBrowserWindowIsActive)? "none" : "block";


    this.loadDataFromFile();

}

/**
* Constructor
* @param domElement :
* @param view :
* @param clock :
*/
//=============================================================================
function Document(docTitle,docIndex,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion,docDate,metaData) {

    this.index = docIndex;
    this.imageSourceHD = docImageSourceHD;
    this.imageSourceBD = docImageSourceBD;

    this.metaData = metaData;

    this.startDate = docDate;

    this.title = docTitle;

    this.useBillboard = (!isNaN(billboardPosition.x) && !isNaN(billboardPosition.y) && !isNaN(billboardPosition.z));

    this.billboardPosition = billboardPosition;

    this.viewPosition = docViewPosition;
    this.viewQuaternion = docViewQuaternion;

    this.billboardGeometry = null;
    this.billboardGeometryFrame = null;
    this.docBillboardData = null;

    //=============================================================================
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
            metadata : metaData
        };

        this.billboardGeometry.userData = this.docBillboardData;
    }

    if(this.useBillboard){
        this.createBillboard();
    }
}


// Document User Interface ===========================================================

//=============================================================================
function docOpaUpdate(opa){
    document.querySelector('#docOpacity').value = opa;
    document.getElementById('docFullImg').style.opacity = opa/100;
}
