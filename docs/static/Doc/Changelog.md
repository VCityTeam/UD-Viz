    
# v2.38.0
    
* [Issue 349](https://github.com/orgs/VCityTeam/projects/17/views/1): GeoJSON data layer integration via JSON config file  and created an example in the UD-Viz mosaïc
* [Issue 234](https://github.com/orgs/VCityTeam/projects/17/views/1): Refactoring of the UD-Viz library structure, factorization of the View3D which includes the view itowns as well as the data integration methods in it. 
* [Issue 249](https://github.com/orgs/VCityTeam/projects/17/views/1): Check for collisions in this local context rather than in the world/server context.
* [Issue 389](https://github.com/orgs/VCityTeam/projects/17/views/1): Move 3DDebugTiles from extensions to widgets.
* [Issue 284](https://github.com/orgs/VCityTeam/projects/17/views/1): Assert DRYness between avatar example and demo-bon.
* [Issue 231](https://github.com/orgs/VCityTeam/projects/17/views/1): Load 3DTiles from distant server instead of local. The 3DTiles are now on a the Liris server.
* [Issue 361](https://github.com/orgs/VCityTeam/projects/17/views/1): CityObject and 3DTiles Debug widgets can apply style to invisible tiles.
* [Issue 366](https://github.com/orgs/VCityTeam/projects/17/views/1): Dynamic layer creation, 2 ways to create dynamic layers:
    * A first way in which a stream of GeoJson created by GAMA is received.
    * Link to local GeoJson and change every second to give the dynamic effect.
* [Issue 188](https://github.com/orgs/VCityTeam/projects/17/views/1): Propose in a module a pre_selection of background image layer, coming from IGN for example, and created an example in the UD-Viz mosaïc.

# v2.37.7

    - Billboard fixes
    - Add onResize LocalScript event

# v2.37.6

    - Update LocalGameTutorial.md
    - Fix no paths in sky with a sky color
    - New Command.TYPE teleport

# v2.37.5

    - fix: 
        apply default style for tilesets without color
        layer without color
        selection of non visible object
        filterWindow having no specific div
        picking and display of picked object
    - focusOnObject distance parameter
    - switch betwenn itowns rendering and game rendering

# v2.37.4

    - Game engine update    
    - AllWidget template compute dynamic near and far camera
    - New Landing page
    - SlideShow v2

# v2.37.3

    Sparql module:
        - Fix legend coloring bug
        - Integrate link labels
        - Refactor graph construction and documentation
        - Integrate TIW table filters
        - Initial table integration
        - Integrate cityobjectprovider extension
        - Update graph query pipeline

    - Add websocket Message TYPE + documentation websocket API
    - Delete multilayer demo
    - Fix links to 3D Tiles in examples
    - Delete multilayer demo
# v2.37.2
  
    - Gltf aren't rotated at importation
    - Fix one example deployment
    - Add cubemap scene background

# v2.37.1

    - Add onRemove EVENT localscript 
    - Fix Inputmanager
    - Add getParent
    - Add billboard example
    - Update ReleasePublish.md
    - Keep the id of the layer to tag 3DTiles
    - Remove default style for 3DTiles

# v2.37.0
    - update iTowns dependency to 2.37.0
      - update dependencies : proj4j (version ^2.7.5) and three (version 0.135.0)
    - minor documentation updates

# v2.36.6

    - Add constants in websocket type msg `EDIT_CONF_COMP`
    - WebPack 5 :
        - Update of url-loader
        - Update of style-loader
        - Split configs
    - Update landing page :
        - Documentation
        - Release link
        - LocalAvatar example
    - Update some markdowns

# v2.36.5

    - Remove record example
    - Worldcomputer 60 fps by default
    - Add isKeyUp isKeyDown in InputManager
    - New Command TYPE

# v2.36.4

    - Change worlds.json loading

# v2.36.3

    - Add quad to native model 3D of the assetsmanager
    - Fix of broken link to example deployment in docs

# v2.36.2

    - Fix some examples
    - Delete bundle udv.js in examples' assets
    - Socket fix path url

# v2.36.1

    - Game zeppelin tour
    - Game fix portal
    - Documentation ref on landing page

# v2.36.0

    - reduce time resize gameview
    - add freeze feature go
    - Fix layer choice widget
        - layer choice : better handling of html
        - refacto of GetMesh() method to GetMeshes()
    - Focus on tileset
        - add record.html to examples
    - remove Shared !
    - add basic example of recording
    - properly sending event when tile is loaded
    - improve loading view css
    - start a localGame with assets loaded
    - distant game start return promise
    - pointerLock API

# v2.35.0

    * Add a SlideShow Window
    * Add SlideShow class and example
    * Add verification elevation config
    * Npm audit is now a travis job.
    * Added a description of archived branch retrieval

# v2.34.1

    * update gitignore
    * Update SPARQL example.html
    * Add CodeQL-analysis.yml
    * Update SPARQL widget documentation
    * Added a pushing/PR process documentation

# v2.34.0

    * Add Changelog file in Doc
    * renderData : Introducing the new renderData attribute whose purpose is to render animations.
    * Display a default style per mesh
    * Can get children tiles in tileset
    * Meshes from the same tile are now in different groups
    * Load geometries without _BatchID
    * Change billboard mask material
    * Use materials[0] when using an unique default material
    * Can apply a default style per mesh
    * Register a default style for each tile, unless a color is specified for the layer. In this case, create a default style for the whole tileset
    * Check if the type is 'b3dm' before creating default style
    * Point cloud : handling point cloud layer properly
    * The base gltf material can now be the default style
    * Delete old ifc feature, aimed to be in a demo
    * Don't override material if the material has a texture
    * Remove dependency towards remote data
