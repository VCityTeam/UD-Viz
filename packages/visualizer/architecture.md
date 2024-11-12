```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcCameraSetup2ejs["cameraSetup.js"]
  IDsrcClippingPlane2ejs["ClippingPlane.js"]
  IDsrcIndex2ejs["index.js"]
  IDsrcLayerManager2ejs["LayerManager.js"]
  IDsrcMeasure2ejs["Measure.js"]
  IDsrcStyle2ecss["style.css"]
  IDsrcTargetOrbitControlMesh2ejs["TargetOrbitControlMesh.js"]
  IDsrcUiSetup2ejs["uiSetup.js"]
  IDsrcViewManager2ejs["ViewManager.js"]
 end
IDsrcIndex2ejs-.->|import|IDsrcClippingPlane2ejs
IDsrcIndex2ejs-.->|import|IDsrcTargetOrbitControlMesh2ejs
IDsrcIndex2ejs-.->|import|IDsrcViewManager2ejs
IDsrcIndex2ejs-.->|import|IDsrcLayerManager2ejs
IDsrcIndex2ejs-.->|import|IDsrcCameraSetup2ejs
IDsrcIndex2ejs-.->|import|IDsrcUiSetup2ejs
IDsrcIndex2ejs-.->|import|IDsrcMeasure2ejs
IDsrcMeasure2ejs-.->|import|IDsrcLayerManager2ejs
IDsrcTargetOrbitControlMesh2ejs-.->|import|IDsrcLayerManager2ejs
```
>This file has been generated using autoMermaid.js