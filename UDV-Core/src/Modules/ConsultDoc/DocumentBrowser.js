import DefaultImage from './DefaultImage.png';
export function DocumentBrowser( browserContainer, documentController) {

  this.documentsExist = false;
  this.currentDoc = null;
  this.documentController = documentController;
  browserContainer.innerHTML =
      '<div id="docBrowserWindow">\
        <button id="closeBrowserWindow" type=button>X</button><br/>\
        <br/>\
          <div id="docHead">Document Navigator</div>\
          <div id="docBrowserTitle">doc title</div>\
          <div id="docBrowserMetaData">metadata</div>\
          <div id="docBrowserPreview"><img id="docBrowserPreviewImg"/></div>\
          <div id="docDescription"></div>\
          <div id="docBrowserIndex"></div>\
          <button id="docBrowserNextButton" type=button>⇨</button>\
          <button id="docBrowserPreviousButton" type=button>⇦</button>\
          <button id="docBrowserOrientButton" type=button>Orient Document</button>\
      </div>\
      <div id="docFull">\
          <img id="docFullImg"/>\
          <div id="docFullPanel">\
              <button id="docFullClose" type=button>Close</button>\
              <button id="docFullOrient" type=button>Orient Document</button>\
              <label id="docOpaLabel" for="docOpaSlider">Opacity</label>\
              <input id="docOpaSlider" type="range" min="0" max="100" value="75"\
              step="1" oninput="docOpaUpdate(value)">\
              <output for="docOpaSlider" id="docOpacity">50</output>\
          </div>\
      </div>\
      <button id="docBrowserToggleBillboard"\
      type=button\
      style="display:none;">Billboard</button>\
      ';

  document.getElementById('docBrowserWindow').style.display = "none" ;

  this.update = function update(){
    //if option cochée
    if(this.documentController.setOfDocuments.length >= 0){
      this.documentsExist = true;
    }
    this.updateBrowser();
  }

  this.windowIsActive = false;

    // Display or hide this window
  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
    document.getElementById('docBrowserWindow').style.display = active & this.documentsExist ? "block" : "none " ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }

  var defaultImage = document.getElementById('docBrowserPreviewImg');
  defaultImage.src = DefaultImage;

  // update doc browser (text, image, index)
  //==========================================================================
  this.updateBrowser = function updateBrowser(){
        this.currentDoc = this.documentController.getCurrentDoc(); //update currentDoc with current doc info
        if (this.currentDoc != null & this.documentsExist == true){
          document.getElementById('docBrowserPreviewImg').src = this.documentController.url + "documentsDirectory/" + this.currentDoc.metadata.link;
          document.getElementById('docBrowserMetaData').innerHTML = this.currentDoc.metadata.description;
          document.getElementById('docBrowserTitle').innerHTML = this.currentDoc.metadata.title;
          document.getElementById('docDescription').innerHTML = this.currentDoc.metadata.description;
        }
        else{
          document.getElementById('docBrowserPreviewImg').src = DefaultImage;
          document.getElementById('docBrowserMetaData').innerHTML = "no document to show";
          document.getElementById('docBrowserTitle').innerHTML =" no document to show";
          document.getElementById('docDescription').innerHTML = " no document to show";
        }
    }

    this.focusOnDoc = function focusOnDoc() {
        var docViewPos = new THREE.Vector3(this.currentDoc.visualization.positionX , this.currentDoc.visualization.positionY, this.currentDoc.visualization.positionZ);
        var docViewPos = new THREE.Vector3( 1837816.94334, 5170036.4587, 2000 ); //position of the beginning to test

        // camera orientation for the oriented view
        var docViewQuat = new THREE.Quaternion(this.currentDoc.visualization.quaternionX, this.currentDoc.visualization.quaternionY , this.currentDoc.visualization.quaternionZ , this.currentDoc.visualization.quaternionW);

        // billboard position
        var docBillboardPos = new THREE.Vector3(  docViewQuat.x = this.currentDoc.visualization.positionX,);
        docBillboardPos.x = 1;
        docBillboardPos.y = 1;
        docBillboardPos.z = 1;

        // display the image (begins loading) but with opacity 0 (hidden)
        document.getElementById('docFullImg').src = this.documentController.url + "documentsDirectory/" + this.currentDoc.metadata.link;
        document.getElementById('docBrowserPreviewImg').src = this.documentController.url + "documentsDirectory/" + this.currentDoc.metadata.link;
        document.getElementById('docFullImg').style.opacity=50;
        document.getElementById('docOpaSlider').value = 0;
        document.querySelector('#docOpacity').value = 50;
        document.getElementById('docFull').style.display = "block";
        document.getElementById('docFullPanel').style.display = "block";

        // if we have valid data, initiate the animated travel to orient the camera
        if(!isNaN(this.currentDoc.visualization.positionX) && !isNaN(this.currentDoc.visualization.quaternionX)){
          //console.log(this.currentDoc.viewPosition );
          //console.log(this.currentDoc.viewQuaternion);
          this.documentController.controls.initiateTravel(docViewPos,"auto",docViewQuat,true);
        }

        // adjust the current date if we use temporal
        if(this.temporal){
        //  temporal.changeTime(this.currentDoc.refDate1);
        }

        this.isOrientingDoc = true;
        this.isFadingDoc = false;

        //to request an update
        //this.view.notifyChange(false);
        //this.view.camera

    };

    // close the center window (oriented view / doc focus)
    //=========================================================================
    this.closeDocFull = function closeDocFull(){
        document.getElementById('docFull').style.display = "none";
        document.getElementById('docFullImg').src = null;
    }

    this.nextDoc = function nextDoc(){
      this.currentDoc = this.documentController.getNextDoc();
      this.updateBrowser();
    }

    this.previousDoc = function previousDoc(){
      this.currentDoc = this.documentController.getPreviousDoc();
      this.updateBrowser();
    }

    //this.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,this.update.bind(this) );

    // event listeners for buttons
    document.getElementById("docFullOrient").addEventListener('mousedown', this.focusOnDoc.bind(this),false);
    document.getElementById("docFullClose").addEventListener('mousedown',this.closeDocFull.bind(this),false);
    document.getElementById("docBrowserNextButton").addEventListener('mousedown',this.nextDoc.bind(this),false);
    document.getElementById("docBrowserPreviousButton").addEventListener('mousedown',this.previousDoc.bind(this),false);
    document.getElementById("docBrowserOrientButton").addEventListener('mousedown', this.focusOnDoc.bind(this),false);

    //DEBUG
    this.onKeyDown = function onKeyDown(event){
        if (event.keyCode === 79) {
            console.log("camera position : ",this.documentController.controls.camera.position);
            console.log("camera quaternion : ",this.documentController.controls.camera.quaternion);
        }
    }
//event listener for keyboard. Used to DEBUG
    window.addEventListener('keydown',this.onKeyDown.bind(this),false);
}
