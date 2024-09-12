```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcIndex2ejs["index.js"]
  subgraph IDsrcModel["model"]
   IDsrcModelGraph2ejs["Graph.js"]
  end
  subgraph IDsrcService["service"]
   IDsrcServiceSparqlEndpointResponseProvider2ejs["SparqlEndpointResponseProvider.js"]
  end
  subgraph IDsrcView["view"]
   IDsrcViewD3GraphCanvas2ejs["D3GraphCanvas.js"]
   IDsrcViewJsonRenderer2ejs["JsonRenderer.js"]
   IDsrcViewSparqlQuery2ejs["SparqlQuery.js"]
   IDsrcViewSparqlQueryWindow2ejs["SparqlQueryWindow.js"]
   IDsrcViewTable2ejs["Table.js"]
  end
 end
IDsrcIndex2ejs-.->|import|IDsrcViewD3GraphCanvas2ejs
IDsrcIndex2ejs-.->|import|IDsrcViewJsonRenderer2ejs
IDsrcIndex2ejs-.->|import|IDsrcViewSparqlQueryWindow2ejs
IDsrcIndex2ejs-.->|import|IDsrcViewTable2ejs
IDsrcIndex2ejs-.->|import|IDsrcServiceSparqlEndpointResponseProvider2ejs
IDsrcIndex2ejs-.->|import|IDsrcModelGraph2ejs
IDsrcViewD3GraphCanvas2ejs-.->|import|IDsrcModelGraph2ejs
IDsrcViewSparqlQueryWindow2ejs-.->|import|IDsrcServiceSparqlEndpointResponseProvider2ejs
IDsrcViewSparqlQueryWindow2ejs-.->|import|IDsrcViewD3GraphCanvas2ejs
IDsrcViewSparqlQueryWindow2ejs-.->|import|IDsrcViewTable2ejs
IDsrcViewSparqlQueryWindow2ejs-.->|import|IDsrcViewJsonRenderer2ejs
IDsrcViewSparqlQueryWindow2ejs-.->|import|IDsrcViewSparqlQuery2ejs
```
>This file has been generated using autoMermaid.js