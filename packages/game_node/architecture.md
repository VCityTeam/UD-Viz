```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcSocketService2ejs["SocketService.js"]
  IDsrcSocketWrapper2ejs["SocketWrapper.js"]
  IDsrcIndex2ejs["index.js"]
  IDsrcThread2ejs["thread.js"]
 end
IDsrcSocketService2ejs-.->|import|IDsrcThread2ejs
IDsrcSocketService2ejs-.->|import|IDsrcSocketWrapper2ejs
IDsrcIndex2ejs-.->|import|IDsrcThread2ejs
IDsrcIndex2ejs-.->|import|IDsrcSocketService2ejs
IDsrcIndex2ejs-.->|import|IDsrcSocketWrapper2ejs
IDsrcThread2ejs-.->|import|IDsrcSocketWrapper2ejs
```
>This file has been generated using autoMermaid.js