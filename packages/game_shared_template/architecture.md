```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcAbstractMap2ejs["AbstractMap.js"]
  IDsrcDragAndDropAvatar2ejs["DragAndDropAvatar.js"]
  IDsrcNativeCommandManager2ejs["NativeCommandManager.js"]
  IDsrcConstant2ejs["constant.js"]
  IDsrcIndex2ejs["index.js"]
 end
IDsrcDragAndDropAvatar2ejs-.->|import|IDsrcConstant2ejs
IDsrcNativeCommandManager2ejs-.->|import|IDsrcAbstractMap2ejs
IDsrcNativeCommandManager2ejs-.->|import|IDsrcConstant2ejs
IDsrcIndex2ejs-.->|import|IDsrcConstant2ejs
IDsrcIndex2ejs-.->|import|IDsrcDragAndDropAvatar2ejs
IDsrcIndex2ejs-.->|import|IDsrcNativeCommandManager2ejs
IDsrcIndex2ejs-.->|import|IDsrcAbstractMap2ejs
```
>This file has been generated using autoMermaid.js