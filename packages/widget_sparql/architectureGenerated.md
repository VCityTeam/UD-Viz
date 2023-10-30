```mermaid
flowchart
 subgraph IDwidget5fsparql["widget_sparql"]
  IDwidget5fsparqlArchitectureGenerated2emd["architectureGenerated.md"]
  IDwidget5fsparqlPackage2ejson["package.json"]
  IDwidget5fsparqlReadme2emd["Readme.md"]
  subgraph IDwidget5fsparqlImg["img"]
   IDwidget5fsparqlImgInterface2epng["interface.png"]
   IDwidget5fsparqlImgPickcityobjectfromgraph2egif["pickcityobjectfromgraph.gif"]
   IDwidget5fsparqlImgSparql2dwidget2ddemo2egif["sparql-widget-demo.gif"]
   IDwidget5fsparqlImgSparql2dwidget2djson2ddemo2egif["sparql-widget-json-demo.gif"]
   IDwidget5fsparqlImgSparql2dwidget2dtable2ddemo2egif["sparql-widget-table-demo.gif"]
  end
  subgraph IDwidget5fsparqlSrc["src"]
   IDwidget5fsparqlSrcIndex2ejs["index.js"]
   subgraph IDwidget5fsparqlSrcModel["model"]
    IDwidget5fsparqlSrcModelGraph2ejs["Graph.js"]
   end
   subgraph IDwidget5fsparqlSrcService["service"]
    IDwidget5fsparqlSrcServiceSparqlEndpointResponseProvider2ejs["SparqlEndpointResponseProvider.js"]
   end
   subgraph IDwidget5fsparqlSrcView["view"]
    IDwidget5fsparqlSrcViewD3GraphCanvas2ejs["D3GraphCanvas.js"]
    IDwidget5fsparqlSrcViewJsonRenderer2ejs["JsonRenderer.js"]
    IDwidget5fsparqlSrcViewSparqlQueryWindow2ejs["SparqlQueryWindow.js"]
    IDwidget5fsparqlSrcViewTable2ejs["Table.js"]
   end
  end
  subgraph IDwidget5fsparqlTest["test"]
   IDwidget5fsparqlTestTest5f12ejs["test_1.js"]
  end
 end
IDwidget5fsparqlSrcIndex2ejs-.->|import|IDwidget5fsparqlSrcViewD3GraphCanvas2ejs
IDwidget5fsparqlSrcIndex2ejs-.->|import|IDwidget5fsparqlSrcViewJsonRenderer2ejs
IDwidget5fsparqlSrcIndex2ejs-.->|import|IDwidget5fsparqlSrcViewSparqlQueryWindow2ejs
IDwidget5fsparqlSrcIndex2ejs-.->|import|IDwidget5fsparqlSrcViewTable2ejs
IDwidget5fsparqlSrcIndex2ejs-.->|import|IDwidget5fsparqlSrcServiceSparqlEndpointResponseProvider2ejs
IDwidget5fsparqlSrcIndex2ejs-.->|import|IDwidget5fsparqlSrcModelGraph2ejs
IDwidget5fsparqlSrcViewD3GraphCanvas2ejs-.->|import|IDwidget5fsparqlSrcModelGraph2ejs
IDwidget5fsparqlSrcViewSparqlQueryWindow2ejs-.->|import|IDwidget5fsparqlSrcServiceSparqlEndpointResponseProvider2ejs
IDwidget5fsparqlSrcViewSparqlQueryWindow2ejs-.->|import|IDwidget5fsparqlSrcViewD3GraphCanvas2ejs
IDwidget5fsparqlSrcViewSparqlQueryWindow2ejs-.->|import|IDwidget5fsparqlSrcViewTable2ejs
IDwidget5fsparqlSrcViewSparqlQueryWindow2ejs-.->|import|IDwidget5fsparqlSrcViewJsonRenderer2ejs
```