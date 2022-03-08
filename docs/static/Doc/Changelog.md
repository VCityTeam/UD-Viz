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
