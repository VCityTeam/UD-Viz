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
