This document makes a link between configuration files inside this directory and javascript files using this configuration.

## Overview

| Directory / File                               | Javascript files using it                                                         | Description                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| layer                                          | [itowns.Layer](http://www.itowns-project.org/itowns/docs/#api/Layer/Layer)        | itowns layer configuration [see](#layer)       |
| server                                         | x                                                                                 | server configuration [see](#server)            |
| widget                                         | x                                                                                 | widget configuration [see](#widget)            |
| [assetManager.json](./assetManager.json)       | [AssetManager](../../../packages/game_browser/src/AssetManager.js)                | Sound + RenderData                             |
| [crs.json](./crs.json)                         | [proj4](http://proj4js.org/)                                                      | Coordinate referential system unknown of proj4 |
| [extents.json](./extents.json)                 | [itowns.Extent](http://www.itowns-project.org/itowns/docs/#api/Geographic/Extent) | Array of differerent Extent configuration      |
| [frame3D_planars.json](./frame3D_planars.json) | [Planar](../../../packages/frame3d/src/Planar.js)                                 | Array of different Planar configuration        |

## layer

| File                                                               | Javascript files using it                                                                    | Description                                                      |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [layer/3DTiles_point_cloud.json](./layer/3DTiles_point_cloud.json) | [itowns.C3DTilesLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/C3DTilesLayer)   | Array of different 3DTiles layer (pnts) configuration            |
| [layer/3DTiles_temporal.json](./layer/3DTiles_temporal.json)       | [itowns.C3DTilesLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/C3DTilesLayer)   | Array of different temporal layer (b3dm) configuration           |
| [layer/3DTiles_Lyon.json](./layer/3DTiles_Lyon.json)               | [itowns.C3DTilesLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/C3DTilesLayer)   | Array of different 3DTiles layer (b3dm) configuration            |
| [layer/base_maps.json](./layer/base_maps.json)                     | [itowns.ColorLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/ColorLayer)         | Array of different background color map configuration            |
| [layer/elevation.json](./layer/elevation.json)                     | [itowns.ElevationLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/ElevationLayer) | elevation (heightmap) configuration                              |
| [layer/geoJSONs.json](./layer/geoJSONs.json)                       | [itowns.ColorLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/ColorLayer)         | Array of different color layer with a filesource base on geojson |
| [layer/labels.json](./layer/labels.json)                           | [itowns.LabelLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/LabelLayer)         | Array of different label layer configuration                     |

## server

| File                                                                                   | Javascript files using it                                                                              | Description                                                                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [server/geocoding_server.json](./server/geocoding_server.json)                         | [GeocodingService](../../../packages/widget_geocoding/src/geocoding/services/GeocodingService.js)      | Configure how to treat http request with a geocoding service                                                  |
| [server/sparql_server.json](./server/sparql_server.json)                               | [SparqlEndpointService](../../../packages/widget_sparql/src/service/SparqlEndpointResponseProvider.js) | Configure how to treat http request with a sparql service                                                     |
| [server/spatial_multimedia_db_server.json](./server/spatial_multimedia_db_server.json) | [DocumentProvider](../../../packages/smdb/src/Core/ViewModel/DocumentProvider.js)                      | Configure how to treat http request with a [smdb service](https://github.com/VCityTeam/Spatial-Multimedia-DB) |

## widget

| File                                                     | Javascript files using it                                                          | Description                        |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| [widget/slide_show.json](./widget/slide_show.json)       | [SlideShow](../../../packages/widget_slide_show/src/index.js)                      | Configure SlideShow widget         |
| [widget/sparql_widget.json](./widget/sparql_widget.json) | [SparqlQueryWindow](../../../packages/widget_sparql/src/view/SparqlQueryWindow.js) | Configure SparqlQueryWindow widget |
