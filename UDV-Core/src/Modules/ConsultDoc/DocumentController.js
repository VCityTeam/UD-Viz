/**
 * Class: DocumentController
 * Description :
 * The DocumentController is an object handling the views, interracting with the
 * server to get information and data (documents)
 *
 */

import { DocumentResearch }  from './DocumentResearch.js';
import { DocumentBrowser }   from './DocumentBrowser.js';
import './ConsultDoc.css';

/**
 * Constructor for DocumentController Class
 * @param controls : PlanarControls instance
 * @param options : optional parameters (including TemporalController)
 * @param view :  itowns planar view
 * @param config : file holding congiguration settings
 */
//=============================================================================
export function DocumentController(view, controls, options = {},config)
{
    this.controls = controls;
    this.setOfDocuments = [];
    this.docIndex = 0;
    this.documentResearch;
    this.documentBrowser;
    this.documentBillboard;
    this.view = view;
    this.options = options;
    this.temporal = options.temporal;

    this.documentModel = config.properties;
    this.serverModel = config.server;
    this.modelTest;

    this.url = this.serverModel.url;

    this.researchContainerId = "researchContainer";
    this.browserContainerId = "browserContainer";
    this.urlFilters ="";

    /**
     * Create view container for the 3 different views
     */
    //=============================================================================
    this.initialize = function initialize()
    {

        var researchContainer = document.createElement("div");
        researchContainer.id =   this.researchContainerId;
        document.body.appendChild(researchContainer);
        this.documentResearch = new DocumentResearch(researchContainer, this);

        var browserContainer = document.createElement("div");
        browserContainer.id = this.browserContainerId;
        document.body.appendChild(browserContainer);
        this.documentBrowser = new DocumentBrowser(browserContainer, this);

        //this.documentBillboard = new DocumentBillboard(this); //in process
    }

    /**
     * Refreshes the view (for browser mode for billboard mode)
     */
    //=============================================================================
    this.updateDisplay = function updateDisplay()
    {
        this.documentBrowser.update();
    }

    /**
     * Gets the documents from a database, using filters
     *
     */
    //=============================================================================
    this.getDocuments = function getDocuments(){
      //check which filters are set. URL is built manually for more modularity.
      //Could be improved
      var filters = new FormData(document.getElementById('filterForm')).entries();
      var urlFilters = this.url + this.serverModel.getAll;
      for(var pair of filters ){
        if(pair[1]!=""){
          console.log(pair[0] + ":" + pair[1])
          urlFilters+= pair[0] + "=" + pair[1];
          urlFilters+="&";
        }
      }
      urlFilters = urlFilters.slice('&',-1);

      console.log(urlFilters)
      var req = new XMLHttpRequest();
      req.open("POST", urlFilters,false);
      req.send();
      this.setOfDocuments = JSON.parse(req.responseText);
    }

    /**
     * Returns the current document if there are documents
     */
    //=============================================================================
    this.getCurrentDoc = function getCurrentDoc()
    {
        if (this.setOfDocuments.length != 0)
            return this.setOfDocuments[this.docIndex];
        else
        {
            return null;
        }
    }

    /**
     * Sets the current document to the next document and returns it.
     */
    //=============================================================================
    this.getNextDoc = function getNextDoc()
    {
        if (this.docIndex < this.setOfDocuments.length - 1 || this.setOfDocuments.length == 0)
            this.docIndex++;
        var currentDoc = this.getCurrentDoc();
        return this.getCurrentDoc();
    }

    /**
     * Sets the current document to the previous document and returns it.
     */
    //=============================================================================
    this.getPreviousDoc = function getPreviousDoc()
    {
        if (this.docIndex > 0 || this.setOfDocuments.length == 0)
        {
            this.docIndex--;
            var currentDoc = this.getCurrentDoc();
            return this.getCurrentDoc();
        }
    }

    this.initialize();
}
