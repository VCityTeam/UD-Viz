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
    //===========================================================================
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

        this.docModelToSchema();
    }

    // Display or hide this window
    this.activateWindow = function activateWindow(active)
    {
        if (typeof active != 'undefined')
        {
            this.windowIsActive = active;
        }
        document.getElementById('researchContainer').style.display =
                                                      active ? "block" : "none ";
    }

    this.refresh = function refresh()
    {
        this.activateWindow(this.windowIsActive);
        this.documentController.documentBrowser.activateWindow(true);

    }

    /**
     * Launch document research by clicking on the "Search" button
     */
    //=============================================================================
    this.research = function research()
    {
        this.documentController.getDocuments();
        this.documentController.documentBrowser.activateWindow(true);
    }


    this.docModelToSchema = function docModelToSchema(){
      //only use the metadata
      var metadata = this.documentController.documentModel.metadata;
      console.log('meta', metadata)
      //schema has at least a file input
      var schema =
      {
        "type": "object",
        "properties": {

        }
      }

      var optionsFilters = {
        "form": {
          "attributes":{
            "id":"filterForm"
          }
        },
        "fields":{
          }
        };


      for (var key in metadata) {

        var attribute = metadata[key]; //holds all metadata relative information
        if(attribute['queryable'] == "keyword" ){//this metadata is required in the creation process
          //dynamic build the schema
          schema.properties['keyword']={};
          optionsFilters.fields['keyword'] = {};
          optionsFilters.fields['keyword']['label'] = "Keyword";
          optionsFilters.fields['keyword']['id'] = "keyword";
          optionsFilters.fields['keyword']['name'] = "keyword";
        }

        if ( attribute['queryable'] == "true" && attribute['type'] == "date" ){
          var nameStart = attribute['name'] + "Start";
          var nameEnd = attribute['name'] + "End";
          schema.properties[nameStart] = {};
          schema.properties[nameEnd] = {};

          optionsFilters.fields[nameStart] = {};
          optionsFilters.fields[nameEnd] = {};

          optionsFilters.fields[nameStart]['label'] = "Start " + attribute['labelQuery'];
          optionsFilters.fields[nameEnd]['label'] = "End " + attribute['labelQuery'];

          optionsFilters.fields[nameStart]['inputType'] = "date";
          optionsFilters.fields[nameEnd]['inputType'] = "date";

          optionsFilters.fields[nameStart]['id'] =  [attribute['name']]['name'] + "End";
          optionsFilters.fields[nameEnd]['id'] =  [attribute['name']]['name'] + "End";

        }
        else{
        if ( attribute['queryable'] == "true"){
          schema.properties[attribute['name']] = {};
          optionsFilters.fields[attribute['name']] = {};
          optionsFilters.fields[attribute['name']]['label'] = attribute['labelQuery'];

          if( attribute['type'] == "enum") {

            optionsFilters.fields[attribute['name']]['type'] = "select";
            schema.properties[attribute['name']]['enum'] = attribute['enum'];
          }
           else {

             optionsFilters.fields[attribute['name']]['type'] = "string";
           }

           optionsFilters.fields[attribute['name']]['id'] = attribute['queryID'];
           optionsFilters.fields[attribute['name']]['name'] = attribute['name'];
         }
       }
     }

     //Create form using alpaca
     $("#filtersWindow").alpaca({
       "schemaSource": schema,
       "options": optionsFilters
     });
   }


    this.initialize();

    //Event listener for researh button
    document.getElementById("docResearch").addEventListener('mousedown',
                                               this.research.bind(this), false);
    document.getElementById("closeResearch").addEventListener('mousedown',
                                    this.activateWindow.bind(this,false), false);


}
