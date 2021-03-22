Plugin: a plugin of the iTowns framework

```
UD-Viz (repo)
├── src         # holds all the js sources that will be build
|    ├── Components             # (FIXME: what src/Utils does for now)
|    ├── Game                   # a plugin offering game engine components
|    |    ├── Shared            # code that can be executed both and client and server side
|    |    ├── Client            # client side game components
|    |    └── Server            # server side code
|    ├── Widgets                # the  
|    |    ├── NoDeps            # FIXME  
|    |    └── Server/Hookable   # FIXME  can import noDeps modules (can be confusing) create a Widgets/Components ?
                                # or no Standalone folder and rename serverplugins in extensions or plugins(server)
|    ├── UDV.js          # Api of UDV package (FIXME: what the current Main.js does)
|    ├── UDVServer.js    # An application for hosting UDV based games
|    └── UDVExamples.js  # A set of illustrative UDV based applications simplifying
|                        # the realization of examples  (packaged with their dependencies)
├── examples    # holds all the js sources that will be build
|    ├── Example_1       # An entrypoint to the first example application
|    ├── Example_2       # ...
|    ├── ...
|    ├── local_modules   # A directory collecting all locally provided bundles 
|         ├── UDV.js          # Bundle generated out of src/UDV.js
|         ├── UDVServer.js    # Bundle generated out of src/UDVServer.js
|         └── UDVExamples.js  # 
|    
├── webpack-client.js    # Webpack code for building client side bundles e.g. UDVExamples.js
├── webpack-server.js    # Webpack code for building server side bundles e.g. UDVServer.js
```
