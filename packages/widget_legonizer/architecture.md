```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcLegoMockupVisualizer2ejs["LegoMockupVisualizer.js"]
  IDsrcLegonizer2ejs["Legonizer.js"]
  IDsrcMockUpUtils2ejs["MockUpUtils.js"]
  IDsrcIndex2ejs["index.js"]
 end
IDsrcLegonizer2ejs-.->|import|IDsrcMockUpUtils2ejs
IDsrcLegonizer2ejs-.->|import|IDsrcLegoMockupVisualizer2ejs
IDsrcIndex2ejs-.->|import|IDsrcLegonizer2ejs
```
>This file has been generated using autoMermaid.js