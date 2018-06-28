/**
 * Class: DocumentBrowser
 * Description :
 * The DocumentBrowser is an object in charge of displaying documents in the browser window
 *
 */

import DefaultImage from './DefaultImage.png';

/**
 * Constructor for DocumentBrowser Class
 * @param { HTML DOM Element object }  browserContainer
 * @param { documentController } documentController*/
//=============================================================================

export function DocumentBrowser(browserContainer, documentController)
{
    //class attributes
    this.documentsExist = false;
    this.currentDoc = null;
    this.documentController = documentController;
    this.windowIsActive = false;

    browserContainer.innerHTML =
        '<div id="docBrowserWindow">\
          <button id="closeBrowserWindow" type=button>X</button><br/>\
          <br/>\
            <div id="docHead">Document Navigator</div>\
            <div id="docBrowserTitle">doc title</div>\
            <div id="docRefDate">metadata</div>\
            <div id="docPublicationDate">metadata</div>\
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


    //hidden by default
    document.getElementById('docBrowserWindow').style.display = "none";


    /**
     * Updates the view with current document information
     */
    //=============================================================================
    this.update = function update()
    {
        if (this.documentController.setOfDocuments.length >= 0)
        {
            this.documentsExist = true;
        }
        this.updateBrowser();
    }

    // Display or hide this window
    this.activateWindow = function activateWindow(active)
    {
        if (typeof active != 'undefined')
        {
            this.windowIsActive = active;
        }
        document.getElementById('docBrowserWindow').style.display = active & this.documentsExist ? "block" : "none ";
    }

    this.refresh = function refresh()
    {
        this.activateWindow(this.windowIsActive);
    }

    // update doc browser (text, image, index)
    //==========================================================================
    this.updateBrowser = function updateBrowser()
    {
        this.currentDoc = this.documentController.getCurrentDoc(); //update currentDoc with current doc info
        if (this.currentDoc != null & this.documentsExist == true)
        {
            document.getElementById('docBrowserPreviewImg').src = this.documentController.url + "documentsDirectory/" + this.currentDoc.metadata.link;
            document.getElementById('docRefDate').innerHTML = "Referring date:" + this.currentDoc.metadata.refDate;
            document.getElementById('docPublicationDate').innerHTML = "Publication date:" + this.currentDoc.metadata.publicationDate;
            document.getElementById('docBrowserTitle').innerHTML = this.currentDoc.metadata.title;
            document.getElementById('docDescription').innerHTML = this.currentDoc.metadata.description;
        }
        else
        { //sets browser with default information and image
            var defaultImage = document.getElementById('docBrowserPreviewImg');
            defaultImage.src = DefaultImage;
            document.getElementById('docBrowserPreviewImg').src = DefaultImage;
            document.getElementById('docRefDate').innerHTML = "Unknown";
            document.getElementById('docPublicationDate').innerHTML = "Unknown";
            document.getElementById('docBrowserTitle').innerHTML = "No document to show";
            document.getElementById('docDescription').innerHTML = "No document to show";
        }
    }

    // triggers the superposition view
    // this will display the doc image in the middle of the screen
    // and initiate the animated travel to orient the camera
    //=============================================================================
    this.focusOnDoc = function focusOnDoc()
    {
        var docViewPos = new THREE.Vector3(this.currentDoc.visualization.positionX, this.currentDoc.visualization.positionY, this.currentDoc.visualization.positionZ);
        //var docViewPos = new THREE.Vector3( 1837816.94334, 5170036.4587, 2000 ); //DEBUG start position
        // camera orientation for the oriented view
        var docViewQuat = new THREE.Quaternion(this.currentDoc.visualization.quaternionX, this.currentDoc.visualization.quaternionY, this.currentDoc.visualization.quaternionZ, this.currentDoc.visualization.quaternionW);

        // billboard position
        var docBillboardPos = new THREE.Vector3(this.currentDoc.visualization.positionX, this.currentDoc.visualization.positionY);

        // display the image (begins loading) but with opacity 0 (hidden)
        document.getElementById('docFullImg').src = this.documentController.url + "documentsDirectory/" + this.currentDoc.metadata.link;
        document.getElementById('docBrowserPreviewImg').src = this.documentController.url + "documentsDirectory/" + this.currentDoc.metadata.link;
        document.getElementById('docFullImg').style.opacity = 50;
        document.getElementById('docOpaSlider').value = 0;
        document.querySelector('#docOpacity').value = 50;
        document.getElementById('docFull').style.display = "block";
        document.getElementById('docFullPanel').style.display = "block";

        // if we have valid data, initiate the animated travel to orient the camera
        if (!isNaN(this.currentDoc.visualization.positionX) && !isNaN(this.currentDoc.visualization.quaternionX))
        {
            this.documentController.controls.initiateTravel(docViewPos, "auto", docViewQuat, true);
        }

        // adjust the current date if we use temporal
        if (this.documentController.temporal)
        {
            console.log(this.currentDoc.metadata.refDate);
            var docDate = new moment(this.currentDoc.metadata.refDate);
            console.log(this.currentDoc.metadata.refDate)
            this.documentController.temporal.changeTime(docDate);
        }

    };

    // close the center window (oriented view / doc focus)
    //=========================================================================
    this.closeDocFull = function closeDocFull()
    {
        document.getElementById('docFull').style.display = "none";
        document.getElementById('docFullImg').src = null;
    }

    /**
     * Updates browser by click on "nextDoc" button
     */
    //=============================================================================
    this.nextDoc = function nextDoc()
    {
        this.currentDoc = this.documentController.getNextDoc();
        this.updateBrowser();
    }

    /**
     * Updates browser by click on "previousDoc" button
     */
    //=============================================================================
    this.previousDoc = function previousDoc()
    {
        this.currentDoc = this.documentController.getPreviousDoc();
        this.updateBrowser();
    }

    // event listeners for buttons
    document.getElementById("docFullOrient").addEventListener('mousedown', this.focusOnDoc.bind(this), false);
    document.getElementById("docFullClose").addEventListener('mousedown', this.closeDocFull.bind(this), false);
    document.getElementById("docBrowserNextButton").addEventListener('mousedown', this.nextDoc.bind(this), false);
    document.getElementById("docBrowserPreviousButton").addEventListener('mousedown', this.previousDoc.bind(this), false);
    document.getElementById("docBrowserOrientButton").addEventListener('mousedown', this.focusOnDoc.bind(this), false);

    //DEBUG function => don't pay attention
    this.onKeyDown = function onKeyDown(event)
    {
        if (event.keyCode === 79)
        {
            console.log("camera position : ", this.documentController.controls.camera.position);
            console.log("camera quaternion : ", this.documentController.controls.camera.quaternion);
        }
    }

    //event listener for keyboard. Used to DEBUG
    window.addEventListener('keydown', this.onKeyDown.bind(this), false);

}
