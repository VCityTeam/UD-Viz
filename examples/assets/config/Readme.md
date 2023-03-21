This document makes a link between configuration files inside this directory and javascript files using this configuration.

| Configution file | Javascript files using it | Description|
|------------------|---------------------------|--|
| [styles](./styles.json) |   [CityObjectModule](../../../packages/browser/src/Component/Widget/CityObjects/CityObjectModule.js) + [LinkProvider](../../../packages/browser/src/Component/Widget/Server/Document/Link/ViewModel/LinkProvider.js)            | Define what material property should be apply for a certain state  |
| [scene](./scene.json) | [THREEUtil](../../../packages/browser/src/Component/THREEUtil.js) | Use to initialize three.js scene  |
| [frame3D_planars](./frame3D_planars.json) | [Frame3DPlanar](../../../packages/browser/src/Component/Frame3D/Frame3DPlanar.js) | Array of different Frame3DPlanar configuration |
| [extent_world](./extent_world.json) | Library user (used in examples/*.html)  | World extent |
| [extent_lyon](./extent_lyon.json) | Library user (used in examples/*.html)  | Lyon extent |
| [assetManager](./assetManager.json) | ../../../packages/browser/src/Component/AssetManager/AssetManager.js  | Sound + RenderData |