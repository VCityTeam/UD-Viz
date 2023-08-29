This document makes a link between configuration files inside this directory and javascript files using this configuration.

## Overview

| Directory / File                               | Javascript files using it                                                         | Description                                             |
| ---------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------- |
| layer                                          | [itowns.Layer](http://www.itowns-project.org/itowns/docs/#api/Layer/Layer)        | Directory with itowns layer configuration [see](#layer) |
| server                                         | [Widget.Server](../../../packages/browser/src/Widget/Server/)                     | Directory with server configuration [see](#server)      |
| widget                                         | [Widget](../../../packages/browser/src/Widget/)                                   | Directory with widget configuration [see](#widget)      |
| [assetManager.json](./assetManager.json)       | [AssetManager](../../../packages/browser/src/AssetManager/AssetManager.js)        | Sound + RenderData                                      |
| [crs.json](./crs.json)                         | [proj4](http://proj4js.org/)                                                      | Coordinate referential system unknown of proj4          |
| [extents.json](./extents.json)                 | [itowns.Extent](http://www.itowns-project.org/itowns/docs/#api/Geographic/Extent) | Array of differerent Extent configuration               |
| [frame3D_planars.json](./frame3D_planars.json) | [Frame3DPlanar](../../../packages/browser/src/Frame3D/Frame3DPlanar.js)           | Array of different Frame3DPlanar configuration          |

## layer

| File                                                               | Javascript files using it                                                                    | Description                                                      |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [layer/3DTiles_point_cloud.json](./layer/3DTiles_point_cloud.json) | [itowns.C3DTilesLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/C3DTilesLayer)   | Array of different 3DTiles layer (pnts) configuration            |
| [layer/3DTiles_temporal.json](./layer/3DTiles_temporal.json)       | [itowns.C3DTilesLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/C3DTilesLayer)   | Array of different temporal layer (b3dm) configuration           |
| [layer/3DTiles.json](./layer/3DTiles.json)                         | [itowns.C3DTilesLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/C3DTilesLayer)   | Array of different 3DTiles layer (b3dm) configuration            |
| [layer/base_maps.json](./layer/base_maps.json)                     | [itowns.ColorLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/ColorLayer)         | Array of different background color map configuration            |
| [layer/elevation.json](./layer/elevation.json)                     | [itowns.ElevationLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/ElevationLayer) | elevation (heightmap) configuration                              |
| [layer/geoJSONs.json](./layer/geoJSONs.json)                       | [itowns.ColorLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/ColorLayer)         | Array of different color layer with a filesource base on geojson |
| [layer/labels.json](./layer/labels.json)                           | [itowns.LabelLayer](http://www.itowns-project.org/itowns/docs/#api/Layer/LabelLayer)         | Array of different label layer configuration                     |

## server

| File                                                                                   | Javascript files using it                                                                                    | Description                                                                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [server/geocoding_server.json](./server/geocoding_server.json)                         | [GeocodingService](../../../packages/browser/src/Widget/Server/Geocoding/services/GeocodingService.js)       | Configure how to treat http request with a geocoding service                                                  |
| [server/sparql_server.json](./server/sparql_server.json)                               | [SparqlEndpointService](../../../packages/browser/src/Widget/Server/SPARQL/Service/SparqlEndpointService.js) | Configure how to treat http request with a sparql service                                                     |
| [server/spatial_multimedia_db_server.json](./server/spatial_multimedia_db_server.json) | [DocumentProvider](../../../packages/browser/src/Widget/Server/Document/Core/ViewModel/DocumentProvider.js)  | Configure how to treat http request with a [smdb service](https://github.com/VCityTeam/Spatial-Multimedia-DB) |

## widget

| File                                                     | Javascript files using it                                                                         | Description                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| [widget/slide_show.json](./widget/slide_show.json)       | [SlideShow](../../../packages/browser/src/Widget/SlideShow/SlideShow.js)                          | Configure SlideShow widget         |
| [widget/sparql_widget.json](./widget/sparql_widget.json) | [SparqlQueryWindow](../../../packages/browser/src/Widget/Server/SPARQL/View/SparqlQueryWindow.js) | Configure SparqlQueryWindow widget |
