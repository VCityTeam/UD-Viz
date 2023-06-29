# Architecture

## Monorepo 

Ud-Viz is a 3-package JavaScript framework. The source code is organized in a [monorepo](https://monorepo.tools/) structure.

Split-code by interpretation environment:  
- [@ud-viz/browser](../../packages/browser/Readme.md) package is interpretable by the browser
- [@ud-viz/node](../../packages/node/Readme.md) package is interpretable by Node.js
- [@ud-viz/shared](../../packages/shared/Readme.md) interpretable by both environments

```mermaid
flowchart TD
  subgraph UD-Viz repo
    subgraph packages
    shared-->|import|browser
    shared-->|import|node
    end
  end
```

Why? 
- No overhead to create new projects 
- One version of everything 
- Atomic commits across projects
- Developer mobility

> See: https://monorepo.tools/#why-a-monorepo

## Shared package

**Global diagram (deep 2)**
```mermaid
flowchart
 subgraph shared[shared]
  sharedPackage.json[package.json]
  sharedReadme.md[Readme.md]
  subgraph sharedBin[bin]
   sharedBinDebug.js[debug.js]
   sharedBinTest.js[test.js]
   subgraph sharedBinTest[Test]
   end
  end
  subgraph sharedSrc[src]
   sharedSrcCommand.js[Command.js]
   sharedSrcConstants.js[Constants.js]
   sharedSrcData.js[Data.js]
   sharedSrcEventSender.js[EventSender.js]
   sharedSrcIndex.js[index.js]
   sharedSrcProcessInterval.js[ProcessInterval.js]
   sharedSrcType.js[Type.js]
   subgraph sharedSrcGame[Game]
   end
  end
  subgraph sharedWebpackConfig[webpackConfig]
   sharedWebpackConfigWebpack.config.common.js[webpack.config.common.js]
   sharedWebpackConfigWebpack.config.dev.js[webpack.config.dev.js]
   sharedWebpackConfigWebpack.config.js[webpack.config.js]
   sharedWebpackConfigWebpack.config.prod.js[webpack.config.prod.js]
  end
 end
sharedSrcData.js-.->|import|sharedSrcType.js
sharedSrcIndex.js-.->|import|sharedSrcConstants.js
sharedSrcIndex.js-.->|import|sharedSrcData.js
sharedSrcIndex.js-.->|import|sharedSrcType.js
sharedSrcIndex.js-.->|import|sharedSrcProcessInterval.js
sharedSrcIndex.js-.->|import|sharedSrcEventSender.js
sharedSrcIndex.js-.->|import|sharedSrcCommand.js
sharedWebpackConfigWebpack.config.js-.->|import|sharedWebpackConfigWebpack.config.prod.js
sharedWebpackConfigWebpack.config.js-.->|import|sharedWebpackConfigWebpack.config.dev.js
sharedWebpackConfigWebpack.config.js-.->|import|sharedWebpackConfigWebpack.config.common.js
```


**shared/src/Game**

```mermaid
flowchart
 subgraph Game[Game]
  GameContext.js[Context.js]
  GameObject3D.js[Object3D.js]
  subgraph GameComponent[Component]
   GameComponentAudio.js[Audio.js]
   GameComponentCollider.js[Collider.js]
   GameComponentComponent.js[Component.js]
   GameComponentExternalScript.js[ExternalScript.js]
   GameComponentGameScript.js[GameScript.js]
   GameComponentRender.js[Render.js]
   GameComponentScript.js[Script.js]
  end
  subgraph GameScriptTemplate[ScriptTemplate]
   GameScriptTemplateAbstractMap.js[AbstractMap.js]
   GameScriptTemplateConstants.js[Constants.js]
   GameScriptTemplateDragAndDropAvatar.js[DragAndDropAvatar.js]
   GameScriptTemplateNativeCommandManager.js[NativeCommandManager.js]
   GameScriptTemplateScriptTemplate.js[ScriptTemplate.js]
  end
  subgraph GameState[State]
   GameStateDiff.js[Diff.js]
   GameStateInterpolator.js[Interpolator.js]
   GameStateState.js[State.js]
  end
 end
GameContext.js-.->|import|GameComponentCollider.js
GameContext.js-.->|import|GameComponentScript.js
GameContext.js-.->|import|GameComponentGameScript.js
GameContext.js-.->|import|GameObject3D.js
GameContext.js-.->|import|GameStateState.js
GameObject3D.js-.->|import|GameComponentExternalScript.js
GameObject3D.js-.->|import|GameComponentGameScript.js
GameObject3D.js-.->|import|GameComponentCollider.js
GameObject3D.js-.->|import|GameComponentAudio.js
GameObject3D.js-.->|import|GameComponentRender.js
GameComponentAudio.js-.->|import|GameComponentComponent.js
GameComponentCollider.js-.->|import|GameComponentComponent.js
GameComponentComponent.js-.->|import|GameObject3D.js
GameComponentExternalScript.js-.->|import|GameComponentComponent.js
GameComponentExternalScript.js-.->|import|GameComponentScript.js
GameComponentGameScript.js-.->|import|GameComponentComponent.js
GameComponentGameScript.js-.->|import|GameComponentScript.js
GameComponentRender.js-.->|import|GameComponentComponent.js
GameComponentScript.js-.->|import|GameComponentComponent.js
GameScriptTemplateAbstractMap.js-.->|import|GameContext.js
GameScriptTemplateAbstractMap.js-.->|import|GameObject3D.js
GameScriptTemplateDragAndDropAvatar.js-.->|import|GameContext.js
GameScriptTemplateDragAndDropAvatar.js-.->|import|GameContext.js
GameScriptTemplateDragAndDropAvatar.js-.->|import|GameScriptTemplateConstants.js
GameScriptTemplateDragAndDropAvatar.js-.->|import|GameObject3D.js
GameScriptTemplateNativeCommandManager.js-.->|import|GameContext.js
GameScriptTemplateNativeCommandManager.js-.->|import|GameScriptTemplateAbstractMap.js
GameScriptTemplateNativeCommandManager.js-.->|import|GameObject3D.js
GameScriptTemplateNativeCommandManager.js-.->|import|GameComponentExternalScript.js
GameScriptTemplateNativeCommandManager.js-.->|import|GameScriptTemplateConstants.js
GameScriptTemplateScriptTemplate.js-.->|import|GameScriptTemplateConstants.js
GameScriptTemplateScriptTemplate.js-.->|import|GameScriptTemplateDragAndDropAvatar.js
GameScriptTemplateScriptTemplate.js-.->|import|GameScriptTemplateNativeCommandManager.js
GameScriptTemplateScriptTemplate.js-.->|import|GameScriptTemplateAbstractMap.js
GameStateInterpolator.js-.->|import|GameStateState.js
GameStateInterpolator.js-.->|import|GameStateDiff.js
GameStateState.js-.->|import|GameStateDiff.js
GameStateState.js-.->|import|GameObject3D.js
```

## Node package

**Node diagram**

```mermaid
flowchart
 subgraph node[node]
  nodePackage.json[package.json]
  nodeReadme.md[Readme.md]
  nodeWebpack.config.js[webpack.config.js]
  subgraph nodeBin[bin]
   nodeBinAutoMermaid.js[autoMermaid.js]
  end
  subgraph nodeSrc[src]
   nodeSrcDebug.js[Debug.js]
   nodeSrcIndex.js[index.js]
   nodeSrcTest.js[Test.js]
   subgraph nodeSrcGame[Game]
    nodeSrcGameGame.js[Game.js]
    nodeSrcGameSocketService.js[SocketService.js]
    nodeSrcGameSocketWrapper.js[SocketWrapper.js]
    nodeSrcGameThread.js[Thread.js]
    subgraph nodeSrcGameScriptTemplate[ScriptTemplate]
     nodeSrcGameScriptTemplateMap.js[Map.js]
     nodeSrcGameScriptTemplateNoteGameManager.js[NoteGameManager.js]
     nodeSrcGameScriptTemplateScriptTemplate.js[ScriptTemplate.js]
    end
   end
  end
 end
nodeSrcIndex.js-.->|import|nodeSrcGameGame.js
nodeSrcIndex.js-.->|import|nodeSrcTest.js
nodeSrcIndex.js-.->|import|nodeSrcDebug.js
nodeSrcGameGame.js-.->|import|nodeSrcGameThread.js
nodeSrcGameGame.js-.->|import|nodeSrcGameScriptTemplateScriptTemplate.js
nodeSrcGameGame.js-.->|import|nodeSrcGameSocketService.js
nodeSrcGameSocketService.js-.->|import|nodeSrcGameThread.js
nodeSrcGameSocketService.js-.->|import|nodeSrcGameSocketWrapper.js
nodeSrcGameThread.js-.->|import|nodeSrcGameSocketWrapper.js
nodeSrcGameScriptTemplateNoteGameManager.js-.->|import|nodeSrcGameGame.js
nodeSrcGameScriptTemplateScriptTemplate.js-.->|import|nodeSrcGameScriptTemplateMap.js
nodeSrcGameScriptTemplateScriptTemplate.js-.->|import|nodeSrcGameScriptTemplateNoteGameManager.js
```


## Browser

**Browser diagram (deep 2)**

```mermaid
flowchart
 subgraph IDbrowser["browser"]
  IDbrowserPackagejson["package.json"]
  IDbrowserReadmemd["Readme.md"]
  subgraph IDbrowserBin["bin"]
   IDbrowserBinDebugjs["debug.js"]
   IDbrowserBinTestjs["test.js"]
   subgraph IDbrowserBinTest["Test"]
   end
  end
  subgraph IDbrowserSrc["src"]
   IDbrowserSrcFileUtiljs["FileUtil.js"]
   IDbrowserSrcHTMLUtiljs["HTMLUtil.js"]
   IDbrowserSrcIndexjs["index.js"]
   IDbrowserSrcInputManagerjs["InputManager.js"]
   IDbrowserSrcItownsUtiljs["ItownsUtil.js"]
   IDbrowserSrcLocalStorageUtiljs["LocalStorageUtil.js"]
   IDbrowserSrcRequestAnimationFrameProcessjs["RequestAnimationFrameProcess.js"]
   IDbrowserSrcRequestServicejs["RequestService.js"]
   IDbrowserSrcSocketIOWrapperjs["SocketIOWrapper.js"]
   IDbrowserSrcTHREEUtiljs["THREEUtil.js"]
   subgraph IDbrowserSrcAssetManager["AssetManager"]
   end
   subgraph IDbrowserSrcFrame3D["Frame3D"]
   end
   subgraph IDbrowserSrcGame["Game"]
   end
   subgraph IDbrowserSrcGUI["GUI"]
   end
   subgraph IDbrowserSrcWidget["Widget"]
   end
  end
  subgraph IDbrowserWebpackConfig["webpackConfig"]
   IDbrowserWebpackConfigWebpackconfigcommonjs["webpack.config.common.js"]
   IDbrowserWebpackConfigWebpackconfigdevjs["webpack.config.dev.js"]
   IDbrowserWebpackConfigWebpackconfigjs["webpack.config.js"]
   IDbrowserWebpackConfigWebpackconfigprodjs["webpack.config.prod.js"]
  end
 end
IDbrowserSrcIndexjs-.->|import|IDbrowserSrcTHREEUtiljs
IDbrowserWebpackConfigWebpackconfigjs-.->|import|IDbrowserWebpackConfigWebpackconfigprodjs
IDbrowserWebpackConfigWebpackconfigjs-.->|import|IDbrowserWebpackConfigWebpackconfigdevjs
IDbrowserWebpackConfigWebpackconfigjs-.->|import|IDbrowserWebpackConfigWebpackconfigcommonjs
```

**Browser src (deep 2)**

```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcFileUtiljs["FileUtil.js"]
  IDsrcHTMLUtiljs["HTMLUtil.js"]
  IDsrcIndexjs["index.js"]
  IDsrcInputManagerjs["InputManager.js"]
  IDsrcItownsUtiljs["ItownsUtil.js"]
  IDsrcLocalStorageUtiljs["LocalStorageUtil.js"]
  IDsrcRequestAnimationFrameProcessjs["RequestAnimationFrameProcess.js"]
  IDsrcRequestServicejs["RequestService.js"]
  IDsrcSocketIOWrapperjs["SocketIOWrapper.js"]
  IDsrcTHREEUtiljs["THREEUtil.js"]
  subgraph IDsrcAssetManager["AssetManager"]
   IDsrcAssetManagerAssetManagercss["AssetManager.css"]
   IDsrcAssetManagerAssetManagerjs["AssetManager.js"]
  end
  subgraph IDsrcFrame3D["Frame3D"]
   IDsrcFrame3DFrame3Djs["Frame3D.js"]
   IDsrcFrame3DFrame3DPlanarjs["Frame3DPlanar.js"]
   subgraph IDsrcFrame3DComponent["Component"]
   end
   subgraph IDsrcFrame3DFrame3DBase["Frame3DBase"]
   end
  end
  subgraph IDsrcGame["Game"]
   IDsrcGameGamejs["Game.js"]
   subgraph IDsrcGameExternal["External"]
   end
   subgraph IDsrcGameScriptTemplate["ScriptTemplate"]
   end
  end
  subgraph IDsrcGUI["GUI"]
   IDsrcGUIGUIjs["GUI.js"]
   subgraph IDsrcGUICss["css"]
   end
   subgraph IDsrcGUIJs["js"]
   end
  end
  subgraph IDsrcWidget["Widget"]
   IDsrcWidgetC3DTilesjs["C3DTiles.js"]
   IDsrcWidgetPlanarControlsjs["PlanarControls.js"]
   IDsrcWidgetWidgetjs["Widget.js"]
   subgraph IDsrcWidgetBaseMap["BaseMap"]
   end
   subgraph IDsrcWidgetCameraPositioner["CameraPositioner"]
   end
   subgraph IDsrcWidgetLayerChoice["LayerChoice"]
   end
   subgraph IDsrcWidgetServer["Server"]
   end
   subgraph IDsrcWidgetSlideShow["SlideShow"]
   end
   subgraph IDsrcWidgetTemporal["Temporal"]
   end
  end
 end
IDsrcIndexjs-.->|import|IDsrcTHREEUtiljs
IDsrcIndexjs-.->|import|IDsrcGameGamejs
IDsrcIndexjs-.->|import|IDsrcWidgetWidgetjs
IDsrcAssetManagerAssetManagerjs-.->|import|IDsrcTHREEUtiljs
IDsrcWidgetC3DTilesjs-.->|import|IDsrcHTMLUtiljs
IDsrcWidgetPlanarControlsjs-.->|import|IDsrcHTMLUtiljs
```


**Browser src/Frame3D/**

```mermaid
flowchart
 subgraph IDFrame3D["Frame3D"]
  IDFrame3DFrame3Djs["Frame3D.js"]
  IDFrame3DFrame3DPlanarjs["Frame3DPlanar.js"]
  subgraph IDFrame3DComponent["Component"]
   IDFrame3DComponentBillboardjs["Billboard.js"]
   IDFrame3DComponentComponentjs["Component.js"]
  end
  subgraph IDFrame3DFrame3DBase["Frame3DBase"]
   IDFrame3DFrame3DBaseFrame3DBasecss["Frame3DBase.css"]
   IDFrame3DFrame3DBaseFrame3DBasejs["Frame3DBase.js"]
  end
 end
IDFrame3DFrame3DPlanarjs-.->|import|IDFrame3DFrame3DBaseFrame3DBasejs
IDFrame3DFrame3DBaseFrame3DBasejs-.->|import|IDFrame3DComponentBillboardjs
```


**Browser src/Game**

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
IDGameExternalExternalGamejs-.->|import|IDGameExternalScriptTemplateScriptTemplatejs
IDGameExternalMultiPlanarProcessjs-.->|import|IDGameExternalExternalGamejs
IDGameExternalSinglePlanarProcessjs-.->|import|IDGameExternalExternalGamejs
IDGameExternalScriptTemplateCameraManagerjs-.->|import|IDGameExternalContextjs
IDGameExternalScriptTemplateScriptTemplatejs-.->|import|IDGameExternalScriptTemplateNoteNotejs
IDGameExternalScriptTemplateDragAndDropAvatarDragAndDropAvatarjs-.->|import|IDGameExternalContextjs
IDGameExternalScriptTemplateDragAndDropAvatarDragAndDropAvatarjs-.->|import|IDGameExternalScriptTemplateComponentCommandControllerjs
IDGameExternalScriptTemplateDragAndDropAvatarDragAndDropAvatarjs-.->|import|IDGameExternalScriptTemplateComponentUtiljs
IDGameExternalScriptTemplateDragAndDropAvatarDragAndDropAvatarjs-.->|import|IDGameExternalScriptTemplateCameraManagerjs
IDGameExternalScriptTemplateNoteElementElementjs-.->|import|IDGameExternalContextjs
IDGameExternalScriptTemplateNoteElementElementjs-.->|import|IDGameExternalScriptTemplateCameraManagerjs
IDGameExternalScriptTemplateNoteElementElementjs-.->|import|IDGameExternalScriptTemplateComponentUtiljs
IDGameExternalScriptTemplateNoteElementElementjs-.->|import|IDGameExternalScriptTemplateNoteSocketServiceSocketServicejs
IDGameExternalScriptTemplateNoteSocketServiceSocketServicejs-.->|import|IDGameExternalContextjs
IDGameExternalScriptTemplateNoteSocketServiceSocketServicejs-.->|import|IDGameExternalScriptTemplateComponentUtiljs
IDGameExternalScriptTemplateNoteSocketServiceSocketServicejs-.->|import|IDGameExternalScriptTemplateNoteUIUIjs
IDGameExternalScriptTemplateNoteUIUIjs-.->|import|IDGameExternalContextjs
```

**Browser src/Widget (deep 3)**

```mermaid
flowchart TB
 subgraph IDWidget["Widget"]
  IDWidgetC3DTilesjs["C3DTiles.js"]
  IDWidgetPlanarControlsjs["PlanarControls.js"]
  IDWidgetWidgetjs["Widget.js"]
  subgraph IDWidgetBaseMap["BaseMap"]
   IDWidgetBaseMapBaseMapWindowjs["BaseMapWindow.js"]
  end
  subgraph IDWidgetCameraPositioner["CameraPositioner"]
   IDWidgetCameraPositionerCameraPositionerjs["CameraPositioner.js"]
  end
  subgraph IDWidgetLayerChoice["LayerChoice"]
   subgraph IDWidgetLayerChoiceViews["views"]
    IDWidgetLayerChoiceViewsLayerChoicejs["LayerChoice.js"]
   end
  end
  subgraph IDWidgetServer["Server"]
   IDWidgetServerServerjs["Server.js"]
   subgraph IDWidgetServerAuthentication["Authentication"]
    subgraph IDWidgetServerAuthenticationServices["services"]
    end
    subgraph IDWidgetServerAuthenticationViews["views"]
    end
   end
   subgraph IDWidgetServerDocument["Document"]
    IDWidgetServerDocumentDocumentjs["Document.js"]
    subgraph IDWidgetServerDocumentComment["Comment"]
    end
    subgraph IDWidgetServerDocumentContribute["Contribute"]
    end
    subgraph IDWidgetServerDocumentCore["Core"]
    end
    subgraph IDWidgetServerDocumentGuidedTour["GuidedTour"]
    end
    subgraph IDWidgetServerDocumentValidation["Validation"]
    end
    subgraph IDWidgetServerDocumentVisualizer["Visualizer"]
    end
   end
   subgraph IDWidgetServerGeocoding["Geocoding"]
    subgraph IDWidgetServerGeocodingServices["services"]
    end
    subgraph IDWidgetServerGeocodingViews["views"]
    end
   end
   subgraph IDWidgetServerSPARQL["SPARQL"]
    subgraph IDWidgetServerSPARQLModel["Model"]
    end
    subgraph IDWidgetServerSPARQLService["Service"]
    end
    subgraph IDWidgetServerSPARQLView["View"]
    end
   end
  end
  subgraph IDWidgetSlideShow["SlideShow"]
   IDWidgetSlideShowSlideShowjs["SlideShow.js"]
  end
  subgraph IDWidgetTemporal["Temporal"]
   IDWidgetTemporalTemporaljs["Temporal.js"]
   subgraph IDWidgetTemporalModel["Model"]
    IDWidgetTemporalModel3DTemporalBatchTablejs["3DTemporalBatchTable.js"]
    IDWidgetTemporalModel3DTemporalBoundingVolumejs["3DTemporalBoundingVolume.js"]
    IDWidgetTemporalModel3DTemporalPrimaryTransactionjs["3DTemporalPrimaryTransaction.js"]
    IDWidgetTemporalModel3DTemporalTilesetjs["3DTemporalTileset.js"]
    IDWidgetTemporalModel3DTemporalTransactionjs["3DTemporalTransaction.js"]
    IDWidgetTemporalModel3DTemporalTransactionAggregatejs["3DTemporalTransactionAggregate.js"]
    IDWidgetTemporalModel3DTemporalVersionjs["3DTemporalVersion.js"]
    subgraph IDWidgetTemporalModelJsonSchemas["jsonSchemas"]
    end
   end
  end
 end
IDWidgetWidgetjs-.->|import|IDWidgetTemporalTemporaljs
IDWidgetWidgetjs-.->|import|IDWidgetServerServerjs
IDWidgetServerServerjs-.->|import|IDWidgetServerDocumentDocumentjs
IDWidgetTemporalTemporaljs-.->|import|IDWidgetTemporalModel3DTemporalBatchTablejs
IDWidgetTemporalTemporaljs-.->|import|IDWidgetTemporalModel3DTemporalBoundingVolumejs
IDWidgetTemporalTemporaljs-.->|import|IDWidgetTemporalModel3DTemporalTilesetjs
```