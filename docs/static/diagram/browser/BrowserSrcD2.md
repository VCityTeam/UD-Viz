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
  IDsrcURLUtiljs["URLUtil.js"]
  subgraph IDsrcAssetManager["AssetManager"]
   IDsrcAssetManagerAssetManagercss["AssetManager.css"]
   IDsrcAssetManagerAssetManagerjs["AssetManager.js"]
  end
  subgraph IDsrcFrame3D["Frame3D"]
   IDsrcFrame3DDomElement3Djs["DomElement3D.js"]
   IDsrcFrame3DFrame3Djs["Frame3D.js"]
   IDsrcFrame3DFrame3DPlanarjs["Frame3DPlanar.js"]
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
IDsrcIndexjs-.->|import|IDsrcInputManagerjs
IDsrcIndexjs-.->|import|IDsrcTHREEUtiljs
IDsrcIndexjs-.->|import|IDsrcRequestServicejs
IDsrcIndexjs-.->|import|IDsrcItownsUtiljs
IDsrcIndexjs-.->|import|IDsrcFrame3DFrame3Djs
IDsrcIndexjs-.->|import|IDsrcGUIGUIjs
IDsrcIndexjs-.->|import|IDsrcGameGamejs
IDsrcIndexjs-.->|import|IDsrcWidgetWidgetjs
IDsrcAssetManagerAssetManagerjs-.->|import|IDsrcTHREEUtiljs
IDsrcFrame3DFrame3Djs-.->|import|IDsrcFrame3DFrame3DPlanarjs
IDsrcFrame3DFrame3Djs-.->|import|IDsrcFrame3DDomElement3Djs
IDsrcFrame3DFrame3DPlanarjs-.->|import|IDsrcTHREEUtiljs
IDsrcWidgetC3DTilesjs-.->|import|IDsrcHTMLUtiljs
IDsrcWidgetPlanarControlsjs-.->|import|IDsrcHTMLUtiljs
IDsrcWidgetWidgetjs-.->|import|IDsrcWidgetC3DTilesjs
IDsrcWidgetWidgetjs-.->|import|IDsrcWidgetPlanarControlsjs
```