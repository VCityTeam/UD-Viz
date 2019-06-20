/**
 * Class: DocumentController
 * Description :
 * The DocumentController is an object handling the views, interracting with the
 * server to get information and data (documents)
 *
 */

import { DocumentResearch } from './DocumentResearch.js';
import { DocumentBrowser } from './DocumentBrowser.js';
import './ConsultDoc.css';
import { ModuleView } from '../../Utils/ModuleView/ModuleView.js';

/**
 * Constructor for DocumentController Class
 * @param controls : PlanarControls instance
 * @param options : optional parameters (including TemporalController)
 * @param view :  itowns planar view
 * @param config : file holding configuration settings
 */
//=============================================================================
export class DocumentController extends ModuleView {
  constructor(view, controls, options = {}, config) {
    super();
    this.controls = controls;
    this.setOfDocuments = [];
    this.docIndex = 0;
    this.documentResearch;
    this.documentBrowser;
    this.documentBillboard;
    this.view = view;
    this.options = options;
    this.temporal = options.temporal;
    this.visible = false;

    this.documentModel = config.properties;
    this.serverModel = config.server;
    this.modelTest;

    this.url = this.serverModel.url;

    this.researchContainerId = "researchContainer";
    this.browserContainerId = "browserContainer";
    this.urlFilters = "";

    // If these are defines as function, they are triggered when the window is opened or closed.
    // It would be better to replace it with an observer or a listener list
    this.onclose;
    this.onopen;

    this.initialize();
  }

  /**
   * Create view container for the 3 different views
   */
  //=============================================================================
  initialize() {

    var researchContainer = document.createElement("div");
    researchContainer.id = this.researchContainerId;
    researchContainer.style = 'display: none;';
    document.getElementById('contentSection').appendChild(researchContainer);
    this.documentResearch = new DocumentResearch(researchContainer, this);
    this.documentResearch.addEventListener(DocumentResearch.EVENT_DESTROYED, () => {
      this.disable();
    });

    var browserContainer = document.createElement("div");
    browserContainer.id = this.browserContainerId;
    browserContainer.style = 'display: none;';
    document.getElementById('contentSection').appendChild(browserContainer);
    this.documentBrowser = new DocumentBrowser(browserContainer, this);
    this.documentBrowser.addEventListener(DocumentResearch.EVENT_DESTROYED, () => {
      this.disable();
    });
  }

  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      this.enable();
    } else {
      this.disable();
    }
  }

  open() {
    this.visible = true;
    if (typeof this.onopen === 'function') {
      this.onopen();
    }
  }

  close() {
    this.visible = false;
    if (typeof this.onclose === 'function') {
      this.onclose();
    }
  }

  /**
   * Refreshes the view (for browser mode for billboard mode)
   */
  //=============================================================================
  updateDisplay() {
    this.documentBrowser.update();
  }

  /**
   * Gets the documents from a database, using filters
   *
   */
  //=============================================================================
  getDocuments() {
    //check which filters are set. URL is built manually for more modularity.
    //Could be improved

    var filters = new FormData(document.getElementById(this.documentResearch.filterFormId)).entries();
    var urlFilters = this.url + this.serverModel.document + '?';
    for (var pair of filters) {
      if (pair[1] != "") {
        urlFilters += pair[0] + "=" + pair[1];
        urlFilters += "&";
      }
    }
    urlFilters = urlFilters.slice('&', -1);
    var req = new XMLHttpRequest();

    req.open("GET", urlFilters, false);
    req.send();
    this.setOfDocuments = JSON.parse(req.responseText);
    this.documentBrowser.numberDocs = this.setOfDocuments.length;
    this.reset();
  }

  /**
   * Returns the current document if there are documents
   */
  //=============================================================================
  getCurrentDoc() {
    if (this.setOfDocuments.length != 0)
      return this.setOfDocuments[this.docIndex];
    else {
      return null;
    }
  }

  /**
   * Sets the current document to the next document and returns it.
   */
  //=============================================================================
  getNextDoc() {
    if (this.docIndex < this.setOfDocuments.length - 1 || this.setOfDocuments.length == 0) {
      this.docIndex++;
    }

    return this.getCurrentDoc();
  }

  /**
   * Sets the current document to the previous document and returns it.
   */
  //=============================================================================
  getPreviousDoc() {
    if (this.docIndex > 0 || this.setOfDocuments.length == 0) {
      this.docIndex--;
    }
    return this.getCurrentDoc();

  }

  /**
   * Reset browser at the begining of documents list
   */
  //=============================================================================
  reset() {
    this.docIndex = 0;
    this.documentBrowser.docIndex = 1;
    this.currentDoc = this.setOfDocuments[0];
    if (this.currentDoc !== null && this.currentDoc !== undefined) {
      this.documentBrowser.currentDoc = this.currentDoc;
      this.documentBrowser.currentMetadata = this.currentDoc;
    }
    this.documentBrowser.updateBrowser();
  }

  //show or hide delete/update button
  //this two buttons are useful for the contribute mode.
  //I an clean MVC architecture, they should be managed by the ContributeController.
  toggleActionButtons(active) {

    if (active) {
      $('#docDeleteButton').show();
      $('#docUpdateButton').show();
    }
    else {
      $('#docDeleteButton').hide();
      $('#docUpdateButton').hide();
    }

  }

  /////// MODULE MANAGEMENT FOR BASE DEMO

  enableView() {
    this.documentResearch.appendTo(this.parentElement);
    this.documentBrowser.appendTo(this.parentElement);
    this.open();
  }

  disableView() {
    this.documentResearch.disable();
    this.documentBrowser.disable();
    this.close();
  }
}
