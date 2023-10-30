```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcAvatarJitsiManager2ejs["AvatarJitsiManager.js"]
  IDsrcIndex2ejs["index.js"]
  IDsrcMap2ejs["Map.js"]
  IDsrcNoteManager2ejs["NoteManager.js"]
 end
IDsrcIndex2ejs-.->|import|IDsrcMap2ejs
IDsrcIndex2ejs-.->|import|IDsrcNoteManager2ejs
IDsrcIndex2ejs-.->|import|IDsrcAvatarJitsiManager2ejs
```