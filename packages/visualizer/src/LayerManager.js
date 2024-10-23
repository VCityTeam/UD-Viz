import {
  C3DTILES_LAYER_EVENTS,
  C3DTilesLayer,
  C3DTilesSource,
  View,
} from 'itowns';
import {
  Box3,
  BoxGeometry,
  Camera,
  Mesh,
  MeshBasicMaterial,
  PointsMaterial,
  Vector2,
  Raycaster,
} from 'three';

export class LayerManager {
  constructor(layerConfigs, itownsView, pointsCloudMaterial, raycaster) {
    /** @type {Array<C3DTilesLayer>} */
    this.layers = [];
    /** @type {PointsMaterial} */
    this.pointsCloudMaterial = pointsCloudMaterial;

    this.globalBB = new Box3();
    this.globalBBMesh = new Mesh(
      new BoxGeometry(),
      new MeshBasicMaterial({ wireframe: true })
    );

    this.raycaster = raycaster || new Raycaster();

    this.initLayers(layerConfigs, itownsView);
  }

  initLayers(layerConfigs, itownsView) {
    layerConfigs.forEach((params) => {
      const c3dTilesLayer = new C3DTilesLayer(
        params.name,
        {
          name: params.name,
          source: new C3DTilesSource({
            url: params.url,
          }),
        },
        itownsView
      );
      c3dTilesLayer.isPointCloud = params.isPointCloud;

      this.setupLayersEvent(c3dTilesLayer);

      View.prototype.addLayer.call(itownsView, c3dTilesLayer);
      this.layers.push(c3dTilesLayer); // ref pointCloud layer there to make difference between C3DTilesLayer b3dm and pnts
    });
  }

  setupLayersEvent(c3dTilesLayer) {
    c3dTilesLayer.addEventListener(
      C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
      ({ tileContent }) => {
        let typePoint = false;
        tileContent.traverse((m) => {
          if (m.type == 'Points') {
            typePoint = true;
          }
        });
        if (typePoint) {
          tileContent.traverse((child) => {
            if (child.material) child.material = this.pointsCloudMaterial;
          });
        }
      }
    );
    c3dTilesLayer.addEventListener(
      C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
      () => {
        let isGeometry = true;
        c3dTilesLayer.object3d.traverse((child) => {
          if (child.geometry) isGeometry = false;
        });
        if (isGeometry) return;
        this.globalBB.expandByObject(c3dTilesLayer.object3d);
        this.globalBB.getCenter(this.globalBBMesh.position);
        this.globalBBMesh.scale.copy(
          this.globalBB.max.clone().sub(this.globalBB.min)
        );
        this.globalBBMesh.updateMatrixWorld();
      }
    );
  }

  /**
   *
   * @param {Event} event - mouse event
   * @param {Camera} camera3D - camera
   * @returns {object} - intersects object on pointcloud layers
   */
  eventTo3DTilesIntersect(event, camera3D) {
    this.raycaster.setFromCamera(this.eventToMouseCoord(event), camera3D);

    let minDist = Infinity;
    let result = null;

    this.layers.forEach((layer) => {
      const intersects = this.raycaster.intersectObject(layer.object3d, true);
      if (intersects.length && intersects[0].distance < minDist) {
        minDist = intersects[0].distance;
        result = intersects[0];
      }
    });

    return result;
  }

  /**
   *
   * @param {Event} event - mouse event
   * @returns {Vector2} - mouse in screen referential
   */
  eventToMouseCoord(event) {
    const mouse = new Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    return mouse;
  }
}
