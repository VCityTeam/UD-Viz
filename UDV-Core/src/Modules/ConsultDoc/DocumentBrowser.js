
export function DocumentBrowser( browserContainer, documentController) {

  this.documentsExist = false;

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
          <div id="operationsOnDoc">\
          <button id="docDelete" type = button>Delete</button>\
          <button id = "docUpdate" type = button>Update</button>\
          <button id="docBrowserOrientButton" type=button>Orient Document</button>\
          </div>\
          <button id = "docCreateFromBrowser" type = button>Create new doc</button>\
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

  document.getElementById('aboutWindow').style.display = "none" ;

  this.update = function update(setOfDocuments){
    //if option cochée
    document.getElementById('aboutWindow').style.display = "block" ;

  }
/*
  this.windowIsActive = options.active || true;

  //////////// Behavior

  // Display or hide this window
  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
    //ajout condition check documentExist
    document.getElementById('aboutWindow').style.display =
                            active ? "block" : "none" ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }*/

}
