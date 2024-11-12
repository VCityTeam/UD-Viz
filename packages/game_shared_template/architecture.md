```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcAbstractMap2ejs["AbstractMap.js"]
  IDsrcConstant2ejs["constant.js"]
  IDsrcDragAndDropAvatar2ejs["DragAndDropAvatar.js"]
  IDsrcIndex2ejs["index.js"]
  IDsrcNativeCommandManager2ejs["NativeCommandManager.js"]
 end
IDsrcDragAndDropAvatar2ejs-.->|import|IDsrcConstant2ejs
IDsrcIndex2ejs-.->|import|IDsrcConstant2ejs
IDsrcIndex2ejs-.->|import|IDsrcDragAndDropAvatar2ejs
IDsrcIndex2ejs-.->|import|IDsrcNativeCommandManager2ejs
IDsrcIndex2ejs-.->|import|IDsrcAbstractMap2ejs
IDsrcNativeCommandManager2ejs-.->|import|IDsrcAbstractMap2ejs
IDsrcNativeCommandManager2ejs-.->|import|IDsrcConstant2ejs
```
>This file has been generated using autoMermaid.js