/**
 * Class: DocumentResearch
 * Description :
 * The DocumentResearch is an object handling the research view
 *
 */

import $ from 'jquery'; //to use Alpaca
import 'alpaca';  //provides a simple way to generate HTML forms using jQuery
import { Window } from '../../Utils/GUI/js/Window';

/**
 *
 * @constructor
 * @param { HTML DOM Element object } researchContainer
 * @param { documentController } documentController
 */

export class DocumentResearch extends Window
{
  constructor(researchContainer, documentController) {
    super('consultDocSearch', 'Document - Search', false);

    //Class attributes
    this.documentController = documentController;
    this.researchController = researchContainer;
    this.windowIsActive = false;

    this.filterFormId = "filterForm";
  }

    get innerContentHtml() {
      return `
        <div id = "filtersWindow"></div>
        <div id ="researchWindowTabs">
          <hr>
          <button id = "docResearch">Search</button>
        </div>
      `;
    }

    windowCreated() {
      this.window.style.width = '270px';
      this.window.style.top = '10px';
      this.window.style.left = '10px';
      this.docModelToSchema();
      this.initializeButtons();
    }

    // Display or hide this window
    activateWindow(active)
    {
        if (typeof active != 'undefined')
        {
            this.windowIsActive = active;
        }
        document.getElementById('researchContainer').style.display =
                                                      active ? "block" : "none ";

          if (this.windowIsActive){
           this.documentController.documentBrowser.activateWindow(true);
        }
        if (active) {
            this.documentController.open();
        } else {
            this.documentController.close();
        }

    }

    refresh()
    {
        this.activateWindow(this.windowIsActive);
        //this.documentController.documentBrowser.activateWindow(true);
    }

    /**
     * Launch document research by clicking on the "Search" button
     */
    //=============================================================================
    research()
    {
        this.documentController.getDocuments();
        document.getElementById('browserInfo').innerHTML = "The documents have been filtered."
        this.documentController.documentBrowser.updateBrowser();
    }


    docModelToSchema(){
      //only use the metadata
      var metadata = this.documentController.documentModel;
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
            "id":this.filterFormId
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

    //Event listener for researh button
    initializeButtons() {
      document.getElementById("docResearch").addEventListener('mousedown',
                                                this.research.bind(this), false);
    }
}
