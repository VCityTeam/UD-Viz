```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcIndex2ejs["index.js"]
  IDsrcTest2ejs["test.js"]
 end
IDsrcIndex2ejs-.->|import|IDsrcTest2ejs
```