```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcCameraManager2ejs["CameraManager.js"]
  IDsrcControllerNativeCommandManager2ejs["ControllerNativeCommandManager.js"]
  IDsrcDomElement3DCube2ejs["DomElement3DCube.js"]
  IDsrcMap2ejs["Map.js"]
  IDsrcIndex2ejs["index.js"]
  IDsrcUtils2ejs["utils.js"]
  subgraph IDsrcDragAndDropAvatar["dragAndDropAvatar"]
   IDsrcDragAndDropAvatarDragAndDropAvatar2ejs["DragAndDropAvatar.js"]
   IDsrcDragAndDropAvatarStyle2ecss["style.css"]
  end
  subgraph IDsrcNote["note"]
   IDsrcNoteNote2ejs["note.js"]
   subgraph IDsrcNoteElement["element"]
    IDsrcNoteElementElement2ejs["Element.js"]
    IDsrcNoteElementStyle2ecss["style.css"]
   end
   subgraph IDsrcNoteSocketService["socketService"]
    IDsrcNoteSocketServiceSocketService2ejs["SocketService.js"]
    IDsrcNoteSocketServiceStyle2ecss["style.css"]
   end
   subgraph IDsrcNoteUi["ui"]
    IDsrcNoteUiUI2ejs["UI.js"]
    IDsrcNoteUiStyle2ecss["style.css"]
   end
  end
 end
IDsrcIndex2ejs-.->|import|IDsrcUtils2ejs
IDsrcIndex2ejs-.->|import|IDsrcMap2ejs
IDsrcIndex2ejs-.->|import|IDsrcDragAndDropAvatarDragAndDropAvatar2ejs
IDsrcIndex2ejs-.->|import|IDsrcDomElement3DCube2ejs
IDsrcIndex2ejs-.->|import|IDsrcNoteNote2ejs
IDsrcDragAndDropAvatarDragAndDropAvatar2ejs-.->|import|IDsrcUtils2ejs
IDsrcDragAndDropAvatarDragAndDropAvatar2ejs-.->|import|IDsrcCameraManager2ejs
IDsrcDragAndDropAvatarDragAndDropAvatar2ejs-.->|import|IDsrcControllerNativeCommandManager2ejs
IDsrcNoteNote2ejs-.->|import|IDsrcNoteUiUI2ejs
IDsrcNoteNote2ejs-.->|import|IDsrcNoteSocketServiceSocketService2ejs
IDsrcNoteNote2ejs-.->|import|IDsrcNoteElementElement2ejs
IDsrcNoteElementElement2ejs-.->|import|IDsrcCameraManager2ejs
IDsrcNoteElementElement2ejs-.->|import|IDsrcUtils2ejs
IDsrcNoteElementElement2ejs-.->|import|IDsrcNoteNote2ejs
IDsrcNoteSocketServiceSocketService2ejs-.->|import|IDsrcNoteNote2ejs
IDsrcNoteSocketServiceSocketService2ejs-.->|import|IDsrcUtils2ejs
IDsrcNoteUiUI2ejs-.->|import|IDsrcNoteNote2ejs
```
>This file has been generated using autoMermaid.js