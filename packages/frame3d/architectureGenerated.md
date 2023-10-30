```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcBase2ejs["Base.js"]
  IDsrcDomElement3D2ejs["DomElement3D.js"]
  IDsrcIndex2ejs["index.js"]
  IDsrcPlanar2ejs["Planar.js"]
 end
IDsrcBase2ejs-.->|import|IDsrcDomElement3D2ejs
IDsrcIndex2ejs-.->|import|IDsrcPlanar2ejs
IDsrcIndex2ejs-.->|import|IDsrcBase2ejs
IDsrcIndex2ejs-.->|import|IDsrcDomElement3D2ejs
IDsrcPlanar2ejs-.->|import|IDsrcBase2ejs
```