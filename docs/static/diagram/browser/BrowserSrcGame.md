```mermaid
flowchart
 subgraph IDGame["Game"]
  IDGameGamejs["Game.js"]
  subgraph IDGameExternal["External"]
   IDGameExternalAudioControllerjs["AudioController.js"]
   IDGameExternalContextjs["Context.js"]
   IDGameExternalExternalGamejs["ExternalGame.js"]
   IDGameExternalMultiPlanarProcessjs["MultiPlanarProcess.js"]
   IDGameExternalRenderControllerjs["RenderController.js"]
   IDGameExternalSinglePlanarProcessjs["SinglePlanarProcess.js"]
   subgraph IDGameExternalScriptTemplate["ScriptTemplate"]
    IDGameExternalScriptTemplateCameraManagerjs["CameraManager.js"]
    IDGameExternalScriptTemplateScriptTemplatejs["ScriptTemplate.js"]
    subgraph IDGameExternalScriptTemplateComponent["Component"]
     IDGameExternalScriptTemplateComponentCommandControllerjs["CommandController.js"]
     IDGameExternalScriptTemplateComponentUtiljs["Util.js"]
    end
    subgraph IDGameExternalScriptTemplateDragAndDropAvatar["DragAndDropAvatar"]
     IDGameExternalScriptTemplateDragAndDropAvatarDragAndDropAvatarcss["DragAndDropAvatar.css"]
     IDGameExternalScriptTemplateDragAndDropAvatarDragAndDropAvatarjs["DragAndDropAvatar.js"]
    end
    subgraph IDGameExternalScriptTemplateNote["Note"]
     IDGameExternalScriptTemplateNoteNotejs["Note.js"]
     subgraph IDGameExternalScriptTemplateNoteElement["Element"]
      IDGameExternalScriptTemplateNoteElementElementcss["Element.css"]
      IDGameExternalScriptTemplateNoteElementElementjs["Element.js"]
     end
     subgraph IDGameExternalScriptTemplateNoteSocketService["SocketService"]
      IDGameExternalScriptTemplateNoteSocketServiceSocketServicecss["SocketService.css"]
      IDGameExternalScriptTemplateNoteSocketServiceSocketServicejs["SocketService.js"]
     end
     subgraph IDGameExternalScriptTemplateNoteUI["UI"]
      IDGameExternalScriptTemplateNoteUIUIcss["UI.css"]
      IDGameExternalScriptTemplateNoteUIUIjs["UI.js"]
     end
    end
   end
  end
  subgraph IDGameScriptTemplate["ScriptTemplate"]
   IDGameScriptTemplateMapjs["Map.js"]
   IDGameScriptTemplateScriptTemplatejs["ScriptTemplate.js"]
  end
 end
IDGameGamejs-.->|import|IDGameExternalExternalGamejs
IDGameGamejs-.->|import|IDGameScriptTemplateScriptTemplatejs
IDGameExternalContextjs-.->|import|IDGameExternalRenderControllerjs
IDGameExternalContextjs-.->|import|IDGameExternalAudioControllerjs
IDGameExternalExternalGamejs-.->|import|IDGameExternalContextjs
IDGameExternalExternalGamejs-.->|import|IDGameExternalMultiPlanarProcessjs
IDGameExternalExternalGamejs-.->|import|IDGameExternalSinglePlanarProcessjs
IDGameExternalExternalGamejs-.->|import|IDGameExternalScriptTemplateScriptTemplatejs
IDGameExternalMultiPlanarProcessjs-.->|import|IDGameExternalExternalGamejs
IDGameExternalSinglePlanarProcessjs-.->|import|IDGameExternalExternalGamejs
IDGameExternalScriptTemplateCameraManagerjs-.->|import|IDGameExternalContextjs
IDGameExternalScriptTemplateScriptTemplatejs-.->|import|IDGameExternalScriptTemplateNoteNotejs
IDGameExternalScriptTemplateDragAndDropAvatarDragAndDropAvatarjs-.->|import|IDGameExternalContextjs
IDGameExternalScriptTemplateDragAndDropAvatarDragAndDropAvatarjs-.->|import|IDGameExternalScriptTemplateComponentCommandControllerjs
IDGameExternalScriptTemplateDragAndDropAvatarDragAndDropAvatarjs-.->|import|IDGameExternalScriptTemplateComponentUtiljs
IDGameExternalScriptTemplateDragAndDropAvatarDragAndDropAvatarjs-.->|import|IDGameExternalScriptTemplateCameraManagerjs
IDGameExternalScriptTemplateNoteNotejs-.->|import|IDGameExternalScriptTemplateNoteUIUIjs
IDGameExternalScriptTemplateNoteNotejs-.->|import|IDGameExternalScriptTemplateNoteSocketServiceSocketServicejs
IDGameExternalScriptTemplateNoteNotejs-.->|import|IDGameExternalScriptTemplateNoteElementElementjs
IDGameExternalScriptTemplateNoteElementElementjs-.->|import|IDGameExternalContextjs
IDGameExternalScriptTemplateNoteElementElementjs-.->|import|IDGameExternalScriptTemplateCameraManagerjs
IDGameExternalScriptTemplateNoteElementElementjs-.->|import|IDGameExternalScriptTemplateComponentUtiljs
IDGameExternalScriptTemplateNoteElementElementjs-.->|import|IDGameExternalScriptTemplateNoteSocketServiceSocketServicejs
IDGameExternalScriptTemplateNoteSocketServiceSocketServicejs-.->|import|IDGameExternalContextjs
IDGameExternalScriptTemplateNoteSocketServiceSocketServicejs-.->|import|IDGameExternalScriptTemplateComponentUtiljs
IDGameExternalScriptTemplateNoteSocketServiceSocketServicejs-.->|import|IDGameExternalScriptTemplateNoteUIUIjs
IDGameExternalScriptTemplateNoteUIUIjs-.->|import|IDGameExternalContextjs
IDGameExternalScriptTemplateNoteUIUIjs-.->|import|IDGameExternalScriptTemplateNoteNotejs
IDGameScriptTemplateScriptTemplatejs-.->|import|IDGameScriptTemplateMapjs
```