```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcIndex2ejs["index.js"]
  IDsrcLegoMockupVisualizer2ejs["LegoMockupVisualizer.js"]
  IDsrcLegonizer2ejs["Legonizer.js"]
  IDsrcMockUpUtils2ejs["MockUpUtils.js"]
 end
IDsrcIndex2ejs-.->|import|IDsrcLegonizer2ejs
IDsrcLegonizer2ejs-.->|import|IDsrcMockUpUtils2ejs
IDsrcLegonizer2ejs-.->|import|IDsrcLegoMockupVisualizer2ejs
```
>This file has been generated using autoMermaid.js