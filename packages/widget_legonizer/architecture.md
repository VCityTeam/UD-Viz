```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcIndex2ejs["index.js"]
  IDsrcLegoMockupVisualizer2ejs["LegoMockupVisualizer.js"]
  IDsrcLegonizer2ejs["Legonizer.js"]
  IDsrcMockUpUtils2ejs["MockUpUtils.js"]
 end
IDsrcLegonizer2ejs-.->|import|IDsrcMockUpUtils2ejs
IDsrcLegonizer2ejs-.->|import|IDsrcLegoMockupVisualizer2ejs
```
>This file has been generated using autoMermaid.js