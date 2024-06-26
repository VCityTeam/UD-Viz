```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcDebugCollision2ejs["DebugCollision.js"]
  IDsrcIndex2ejs["index.js"]
  IDsrcStyle2ecss["style.css"]
  subgraph IDsrcObjectInput["objectInput"]
   IDsrcObjectInputObjectInput2ejs["ObjectInput.js"]
   subgraph IDsrcObjectInputScriptVariables["scriptVariables"]
    subgraph IDsrcObjectInputScriptVariablesExternal["external"]
     IDsrcObjectInputScriptVariablesExternalExternal2ejs["external.js"]
    end
    subgraph IDsrcObjectInputScriptVariablesGame["game"]
     IDsrcObjectInputScriptVariablesGameGame2ejs["game.js"]
     IDsrcObjectInputScriptVariablesGameNativeCommandManagerScriptInput2ejs["NativeCommandManagerScriptInput.js"]
    end
   end
   subgraph IDsrcObjectInputUserData["userData"]
    IDsrcObjectInputUserDataUserData2ejs["userData.js"]
   end
  end
 end
IDsrcIndex2ejs-.->|import|IDsrcObjectInputObjectInput2ejs
IDsrcIndex2ejs-.->|import|IDsrcObjectInputScriptVariablesGameGame2ejs
IDsrcIndex2ejs-.->|import|IDsrcObjectInputScriptVariablesExternalExternal2ejs
IDsrcIndex2ejs-.->|import|IDsrcObjectInputUserDataUserData2ejs
IDsrcIndex2ejs-.->|import|IDsrcDebugCollision2ejs
IDsrcObjectInputScriptVariablesGameGame2ejs-.->|import|IDsrcObjectInputScriptVariablesGameNativeCommandManagerScriptInput2ejs
```
>This file has been generated using autoMermaid.js