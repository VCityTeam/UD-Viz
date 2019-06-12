/**
 * Class: DocumentBrowser
 * Description :
 * The DocumentBrowser is an object handling the browser view
 *
 */

import * as THREE from 'three';
import { MAIN_LOOP_EVENTS } from 'itowns';
import DefaultImage from './DefaultImage.png';
import { Window } from '../../Utils/GUI/js/Window';

/**
 *
 * @constructor
 * @param { HTML DOM Element object } browserContainer
 * @param { documentController } documentController
 */

export class DocumentBrowser extends Window {
    constructor(browserContainer, documentController) {
        super('consultDocBrowser', 'Document Browser', false);
        // class attributes
        this.documentController = documentController;
        this.documentsExist = true;
        this.currentDoc = null;
        this.windowIsActive = false;
        this.isOrientingDoc = false;
        this.isFadingDoc = false;
        this.fadeAlpha = 0;
        this.docIndex = 1;
        this.isStart = true; // dirty variable to test if we are in start mode
        this.currentMetadata;
        this.numberDocs;
        // ID of the html div holding buttons in the browser
        // will be used by other classes as well to add extra buttons
        this.browserTabID = 'browserWindowTabs';
        // doc fade-in animation duration, in milliseconds
        this.fadeDuration = this.documentController.options.docFadeDuration || 2750;

        var docFull = document.createElement('div');
        docFull.id = 'docFull';
        document.body.appendChild(docFull);

        docFull.innerHTML =
            '<img id="docFullImg"/>\
            <div id="docFullPanel">\
                <button id="docFullClose" type=button>Close</button>\
                <button id="docFullOrient" type=button>Orient Document</button>\
                <label id="docOpaLabel" for="docOpaSlider">Opacity</label>\
                <input id="docOpaSlider" type="range" min="0" max="100" value="75"\
                step="1">\
                <output for="docOpaSlider" id="docOpacity">50</output>\
            ';

        document.getElementById('docFullOrient').addEventListener('mousedown',
        this.focusOnDoc.bind(this), false);
        document.getElementById('docFullClose').addEventListener('mousedown',
        this.closeDocFull.bind(this), false);

        // Whether this window is currently displayed or not.
        this.windowIsActive = this.documentController.options.active || false;

        // itowns framerequester : will regularly call this.updateScene()
        this.documentController.view.addFrameRequester(
            MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE, this.updateScene.bind(this));
    }

    get innerContentHtml() {
        return `
            <div id="browserInfo"></div>
            <div id="docBrowserInfo"></div>
            <div id="docBrowserPreview"><img id="docBrowserPreviewImg"/></div>
            <div id="docBrowserIndex"></div>
            <div id="${this.browserTabID}">
                <button id="docBrowserPreviousButton" type=button>⇦</button>
                <button id="docBrowserNextButton" type=button>⇨</button>
                <button id="resetFilters" type=button>Reset research</button>
                <button id="docBrowserOrientButton" type=button>Orient Document</button>
            </div>
        `;
    }

    windowCreated() {
        this.window.style.setProperty('left', '590px');
        this.window.style.setProperty('top', '60px');
        this.window.style.setProperty('width', '390px');
        this.initializeButtons();
        this.resetResearch();
    }

    refresh() {
        
    };

    // called regularly by the itowns framerequester
    //= ========================================================================
    updateScene(dt, updateLoopRestarted) {
        // dt will not be relevant when we just started rendering, we consider a 1-frame move in this case
        if (updateLoopRestarted) {
            dt = 16;
        }
        // controls.state === -1 corresponds to state === STATE.NONE
        // if state is -1 this means the controls have finished the animated travel
        // then we can begin the doc fade animation
        if (this.isOrientingDoc && this.documentController.controls.state === -1) {
            this.isOrientingDoc = false;
            this.isFadingDoc = true;
            this.fadeAlpha = 0;
            document.getElementById('docOpaSlider').value = 0;
            document.querySelector('#docOpacity').value = 0;
            document.getElementById('docFullImg').style.opacity = 0;
            document.getElementById('docFullPanel').style.display = 'block';
        }

        // handle fade animation
        if (this.isFadingDoc) {
            this.fadeAlpha += dt / this.fadeDuration;
            if (this.fadeAlpha >= 1) {
                // animation is complete
                this.isFadingDoc = false;
                document.getElementById('docFullImg').style.opacity = 1;
                document.getElementById('docOpaSlider').value = 100;
                document.querySelector('#docOpacity').value = 100;
            }
            else {
                // if not complete :
                document.getElementById('docFullImg').style.opacity = this.fadeAlpha;
                document.getElementById('docOpaSlider').value = this.fadeAlpha * 100;
                document.querySelector('#docOpacity').value =
                    Math.trunc(this.fadeAlpha * 100);
            }

            // request redraw of the scene
            this.documentController.view.notifyChange();
        }
    }

    /**
     * Updates browser by clicking on "nextDoc" button
     */
    //= ============================================================================
    nextDoc() {
        if (this.docIndex < this.numberDocs & this.currentDoc != null) {
            this.docIndex++;
            this.currentDoc = this.documentController.getNextDoc();
        }
        this.currentDoc = this.documentController.setOfDocuments[this.documentController.docIndex];
        this.currentMetadata = this.currentDoc.metaData;
        this.updateBrowser();
    };

    /**
     * Updates browser by click on "previousDoc" button
     */
    //= ============================================================================
    previousDoc() {
        if (this.docIndex > 1 & this.currentDoc != null) {
            this.docIndex--;
            this.currentDoc = this.documentController.getPreviousDoc();
        }
        this.currentDoc = this.documentController.setOfDocuments[this.documentController.docIndex];
        this.currentMetadata = this.currentDoc.metaData;
        this.updateBrowser();
    };


    // Updates the DocumentBrowser with Document static metadata
    // the document browser html is defined based
    // on the documentModel metadata attributes
    //= =========================================================================
    updateBrowser() {
        if (!this.isCreated) {
            return;
        }
        if (this.currentDoc != null & this.numberDocs > 0) {
            var txt = '';
            txt += "<div id ='docMetadata'>";
            var metadata = this.documentController.documentModel.metaData;

            for (var key in metadata) {
                var attribute = metadata[key]; // holds all metadata relative information
                if (attribute.displayable == 'true') {
                    if (attribute.label != 'false') { // dynamic building of the HTML browser
                        txt += `<div id=${attribute.displayID}>${attribute.label
                            }:${this.currentMetadata[attribute.name]}</div>`;
                    }
                    else {
                        txt += `<div id=${attribute.displayID}>${
                            this.currentMetadata[attribute.name]}</div>`;
                    }
                }
            }
            txt += '</div>';
            document.getElementById('browserInfo').innerHTML = txt;
            document.getElementById('docBrowserPreviewImg').src = this.documentController.url
                + this.documentController.serverModel.document + '/'
                + this.currentMetadata.id + '/'
                + this.documentController.serverModel.file;
            document.getElementById('docBrowserIndex').innerHTML = `Document: ${
                this.docIndex} out of ${this.numberDocs}`;
            this.documentController.toggleActionButtons(true);
        }

        else {
            // If there is no document, clear the fields.
            let metadataNode = document.getElementById('docMetadata');
            if (!!metadataNode) {
                metadataNode.parentElement.removeChild(metadataNode);
            }
            // sets browser with default information and image
            var defaultImage = document.getElementById('docBrowserPreviewImg');
            defaultImage.src = DefaultImage;
            document.getElementById('docBrowserPreviewImg').src = DefaultImage;
            document.getElementById('docBrowserIndex').innerHTML = 'No doc';
            this.documentController.toggleActionButtons(false);
        }
    };

    // triggers the "oriented view" of the current docIndex
    // this will display the doc image in the middle of the screen
    // and initiate the animated travel to orient the camera
    //= ============================================================================
    focusOnDoc() {
        document.getElementById('docFull').style.display = 'block';
        let src = this.documentController.url + this.documentController.serverModel.document + '/' + this.currentMetadata.id + '/' + this.documentController.serverModel.file;
        console.log(src);
        document.getElementById('docFullImg').src = this.documentController.url
            + this.documentController.serverModel.document + '/'
            + this.currentMetadata.id + '/'
            + this.documentController.serverModel.file;
        document.getElementById('docFullImg').style.opacity = 0;
        document.getElementById('docOpaSlider').value = 0;
        document.querySelector('#docOpacity').value = 0;
        document.getElementById('docFull').style.display = 'block';
        document.getElementById('docFullPanel').style.display = 'block';

        // if we have valid data, initiate the animated travel to orient the camera
        if (!isNaN(this.currentDoc.visualization.positionX) &&
            !isNaN(this.currentDoc.visualization.quaternionX)) {
            var docViewPos = new THREE.Vector3();
            docViewPos.x = parseFloat(this.currentDoc.visualization.positionX);
            docViewPos.y = parseFloat(this.currentDoc.visualization.positionY);
            docViewPos.z = parseFloat(this.currentDoc.visualization.positionZ);

            // camera orientation for the oriented view
            var docViewQuat = new THREE.Quaternion();
            docViewQuat.x = parseFloat(this.currentDoc.visualization.quaternionX);
            docViewQuat.y = parseFloat(this.currentDoc.visualization.quaternionY);
            docViewQuat.z = parseFloat(this.currentDoc.visualization.quaternionZ);
            docViewQuat.w = parseFloat(this.currentDoc.visualization.quaternionW);
            this.documentController.controls.initiateTravel(docViewPos, 'auto',
                docViewQuat, true);
        }

        // adjust the current date if we use temporal
        if (this.documentController.temporal) {
            var docDate = new moment(this.currentMetadata.refDate);
            this.documentController.temporal.changeTime(docDate);
        }

        this.isOrientingDoc = true;
        this.isFadingDoc = false;

        this.documentController.view.notifyChange();
    };

    // close the central window superposition view
    //= ========================================================================
    closeDocFull() {
        document.getElementById('docFull').style.display = 'none';
        // document.getElementById('docFullImg').src = null;
    };

    startBrowser() {
        try {
            this.documentController.getDocuments();
        } catch (e) {
            //view is not created ?
            return;
        }
        this.docIndex = 1;
        this.currentDoc = this.documentController.setOfDocuments[0];
        try {
            this.currentMetadata = this.currentDoc.metaData;
        } catch (e) {
            console.error(e);
        }
        this.updateBrowser();
    };

    resetResearch() {
        this.docIndex = 1;
        $(`#${this.documentController.documentResearch.filterFormId}`).get(0).reset(); // reset reserach parameters

        document.getElementById('browserInfo').innerHTML = 'Filters have been reset.';
        // reset default url
        this.documentController.url = this.url = this.documentController.serverModel.url;

        this.documentController.getDocuments();
        this.documentController.reset();
        this.closeDocFull();
    };


    initializeButtons() {
        // event listeners for buttons
        document.getElementById('docBrowserNextButton').addEventListener('mousedown',
            this.nextDoc.bind(this), false);
        document.getElementById('docBrowserPreviousButton').addEventListener('mousedown',
            this.previousDoc.bind(this), false);
        document.getElementById('docBrowserOrientButton').addEventListener('mousedown',
            this.focusOnDoc.bind(this), false);
        document.getElementById('resetFilters').addEventListener('mousedown',
            this.resetResearch.bind(this), false);
        document.getElementById('docOpaSlider').addEventListener('input',
            docOpaUpdate, false);
    }
}

// In oriented view (focusOnDoc) this is called when the user changes the value
// of the opacity slider
function docOpaUpdate(event) {
    // event.currentTarget points to docOpaSlider
    let inputOpacity = event.currentTarget.value;
    document.querySelector('#docOpacity').value = inputOpacity;
    document.getElementById('docFullImg').style.opacity = inputOpacity / 100;
}
