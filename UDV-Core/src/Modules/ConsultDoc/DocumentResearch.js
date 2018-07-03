/**
 * Class: DocumentResearch
 * Description :
 * The DocumentResearch is an object handling the research view
 *
 */

import $ from 'jquery'; //to use Alpaca
import 'alpaca';  //provides a simple way to generate HTML forms using jQuery

/**
 *
 * @constructor
 * @param { HTML DOM Element object } researchContainer
 * @param { documentController } documentController
 */

export function DocumentResearch(researchContainer, documentController)
{
    //Class attributes
    this.documentController = documentController;
    this.researchController = researchContainer;
    this.windowIsActive = false;


    /**
     * Creates the research view
     */
    //=============================================================================
    this.initialize = function initialize()
    {
        this.researchController.innerHTML =
            '<br/><div id = "filtersTitle">Document research</div><br/>\
            <br/>\
            <button id = "closeResearch">Close</button>\
            <div id = "filtersWindow"></div>\
            <div id ="researchWindowTabs">\
            <button id = "docResearch">Search</button>\
            </div>\
            ';

        var optionsFilter = "http://rict.liris.cnrs.fr/optionsFilter.json";
        var schema = "http://rict.liris.cnrs.fr/schemaType.json";
        //create HTML research form
        $('#filtersWindow').alpaca({
            "schemaSource": schema,
            "optionsSource": optionsFilter
          });
    }

    // Display or hide this window
    this.activateWindow = function activateWindow(active)
    {
        if (typeof active != 'undefined')
        {
            this.windowIsActive = active;
        }
        document.getElementById('researchContainer').style.display = active ? "block" : "none ";
    }

    this.refresh = function refresh()
    {
        this.activateWindow(this.windowIsActive);
    }

    /**
     * Launch document research by clicking on the "Search" button
     */
    //=============================================================================
    this.research = function research()
    {
        // var filtersFormData = new FormData(document.getElementById('filterForm'));
        //
        // var entries = filtersFormData.entries();
        // for (var pair of entries){
        //   console.log(pair[0] + ":"+ pair[1]);
        // }
        this.documentController.getDocuments();

        this.documentController.documentBrowser.activateWindow(true);
    }

    this.initialize();

    //Event listener for researh button
    document.getElementById("docResearch").addEventListener('mousedown', this.research.bind(this), false);
    document.getElementById("closeResearch").addEventListener('mousedown', this.activateWindow.bind(this,false), false);


}
