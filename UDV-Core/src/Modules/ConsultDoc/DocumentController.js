/**
 * Class: DocumentController
 * Description :
 * The DocumentController is an object handling the views, interracting with the
 * server to get information and data (documents)
 *
 */

import { DocumentResearch }  from './DocumentResearch.js';
import { DocumentBrowser }   from './DocumentBrowser.js';
import { DocumentBillboard } from './DocumentBillboard.js';

/**
 * Constructor for DocumentController Class
 * @param controls : PlanarControls instance
 * @param options : optional parameters (including TemporalController)
 * @param view :  itowns planar view
 * @param docModel : file holding document model
 */
//=============================================================================
export function DocumentController(view, controls, options = {}, docModel)
{
    this.url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/"; //url of the server handling documents
    //FIXME: to put in a configuration file of the general application

    this.controls = controls;
    this.setOfDocuments = [];
    this.docIndex = 0;
    this.documentResearch;
    this.documentBrowser;
    this.documentBillboard;
    this.view = view;
    this.options = options;
    this.documentModel = docModel;

    /**
     * Create view container for the 3 different views
     */
    //=============================================================================
    this.initialize = function initialize()
    {

        var researchContainer = document.createElement("div");
        researchContainer.id = "researchContainer";
        document.body.appendChild(researchContainer);
        this.documentResearch = new DocumentResearch(researchContainer, this);

        var browserContainer = document.createElement("div");
        browserContainer.id = "browserContainer";
        document.body.appendChild(browserContainer);
        //this.documentBrowser = new DocumentBrowser(browserContainer, this);
        this.documentBrowser = new DocumentBrowser(browserContainer, this);

        this.documentBillboard = new DocumentBillboard(this); //in process
    }

    /**
     * Refreshes the view (for browser mode for billboard mode)
     */
    //=============================================================================
    this.updateDisplay = function updateDisplay()
    {
        this.documentBrowser.update();
        //this.documentBillboard.update();
    }

    /**
     * Gets the documents from a database, using filters
     * @param {FormData} filterFormData - filters set by user to make a research
     */
    //=============================================================================
    this.getDocuments = function getDocuments(filterFormData)
    {
        var self = this;
        $.ajax({
            url: this.url + "app_dev.php/getDocuments",
            data: filterFormData,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (documents)
            {
                self.setOfDocuments = documents;
                self.docIndex = 0;
                self.updateDisplay();
            },
            error: function (XMLHTTPRequest, textStatus, errorThrown)
            {
                console.alert(textStatus);
            }
        });
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
