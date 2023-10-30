```mermaid
flowchart
 subgraph IDgame5fbrowser5ftemplate["game_browser_template"]
  IDgame5fbrowser5ftemplateArchitectureGenerated2emd["architectureGenerated.md"]
  IDgame5fbrowser5ftemplatePackage2ejson["package.json"]
  IDgame5fbrowser5ftemplateReadme2emd["Readme.md"]
  subgraph IDgame5fbrowser5ftemplateSrc["src"]
   IDgame5fbrowser5ftemplateSrcAvatarJitsi2ejs["AvatarJitsi.js"]
   IDgame5fbrowser5ftemplateSrcCameraManager2ejs["CameraManager.js"]
   IDgame5fbrowser5ftemplateSrcIndex2ejs["index.js"]
   IDgame5fbrowser5ftemplateSrcMap2ejs["Map.js"]
   IDgame5fbrowser5ftemplateSrcUtils2ejs["utils.js"]
   subgraph IDgame5fbrowser5ftemplateSrcDragAndDropAvatar["dragAndDropAvatar"]
    IDgame5fbrowser5ftemplateSrcDragAndDropAvatarDragAndDropAvatar2ejs["DragAndDropAvatar.js"]
    IDgame5fbrowser5ftemplateSrcDragAndDropAvatarStyle2ecss["style.css"]
   end
   subgraph IDgame5fbrowser5ftemplateSrcNote["note"]
    IDgame5fbrowser5ftemplateSrcNoteNote2ejs["note.js"]
    subgraph IDgame5fbrowser5ftemplateSrcNoteElement["element"]
     IDgame5fbrowser5ftemplateSrcNoteElementElement2ejs["Element.js"]
     IDgame5fbrowser5ftemplateSrcNoteElementStyle2ecss["style.css"]
    end
    subgraph IDgame5fbrowser5ftemplateSrcNoteSocketService["socketService"]
     IDgame5fbrowser5ftemplateSrcNoteSocketServiceSocketService2ejs["SocketService.js"]
     IDgame5fbrowser5ftemplateSrcNoteSocketServiceStyle2ecss["style.css"]
    end
    subgraph IDgame5fbrowser5ftemplateSrcNoteUi["ui"]
     IDgame5fbrowser5ftemplateSrcNoteUiStyle2ecss["style.css"]
     IDgame5fbrowser5ftemplateSrcNoteUiUI2ejs["UI.js"]
    end
   end
  end
  subgraph IDgame5fbrowser5ftemplateTest["test"]
   IDgame5fbrowser5ftemplateTestTest5f12ejs["test_1.js"]
  end
 end
IDgame5fbrowser5ftemplateSrcIndex2ejs-.->|import|IDgame5fbrowser5ftemplateSrcUtils2ejs
IDgame5fbrowser5ftemplateSrcIndex2ejs-.->|import|IDgame5fbrowser5ftemplateSrcMap2ejs
IDgame5fbrowser5ftemplateSrcIndex2ejs-.->|import|IDgame5fbrowser5ftemplateSrcDragAndDropAvatarDragAndDropAvatar2ejs
IDgame5fbrowser5ftemplateSrcIndex2ejs-.->|import|IDgame5fbrowser5ftemplateSrcAvatarJitsi2ejs
IDgame5fbrowser5ftemplateSrcIndex2ejs-.->|import|IDgame5fbrowser5ftemplateSrcNoteNote2ejs
IDgame5fbrowser5ftemplateSrcDragAndDropAvatarDragAndDropAvatar2ejs-.->|import|IDgame5fbrowser5ftemplateSrcUtils2ejs
IDgame5fbrowser5ftemplateSrcDragAndDropAvatarDragAndDropAvatar2ejs-.->|import|IDgame5fbrowser5ftemplateSrcCameraManager2ejs
IDgame5fbrowser5ftemplateSrcNoteNote2ejs-.->|import|IDgame5fbrowser5ftemplateSrcNoteUiUI2ejs
IDgame5fbrowser5ftemplateSrcNoteNote2ejs-.->|import|IDgame5fbrowser5ftemplateSrcNoteSocketServiceSocketService2ejs
IDgame5fbrowser5ftemplateSrcNoteNote2ejs-.->|import|IDgame5fbrowser5ftemplateSrcNoteElementElement2ejs
IDgame5fbrowser5ftemplateSrcNoteElementElement2ejs-.->|import|IDgame5fbrowser5ftemplateSrcCameraManager2ejs
IDgame5fbrowser5ftemplateSrcNoteElementElement2ejs-.->|import|IDgame5fbrowser5ftemplateSrcUtils2ejs
IDgame5fbrowser5ftemplateSrcNoteElementElement2ejs-.->|import|IDgame5fbrowser5ftemplateSrcNoteNote2ejs
IDgame5fbrowser5ftemplateSrcNoteSocketServiceSocketService2ejs-.->|import|IDgame5fbrowser5ftemplateSrcNoteNote2ejs
IDgame5fbrowser5ftemplateSrcNoteSocketServiceSocketService2ejs-.->|import|IDgame5fbrowser5ftemplateSrcUtils2ejs
IDgame5fbrowser5ftemplateSrcNoteUiUI2ejs-.->|import|IDgame5fbrowser5ftemplateSrcNoteNote2ejs
```