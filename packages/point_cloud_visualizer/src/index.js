import {
  PlanarView,
  C3DTilesLayer,
  C3DTilesSource,
  View,
  C3DTILES_LAYER_EVENTS,
} from 'itowns';
import {
  PointsMaterial,
  Box3,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Scene,
  Color,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  localStorageSetCameraMatrix,
  localStorageSetVector3,
  computeNearFarCamera,
  RequestAnimationFrameProcess,
  createLocalStorageSlider,
} from '@ud-viz/utils_browser';

export class PointCloudVisualizer {
  /**
   *
   * @param {import("itowns").Extent} extent - itowns extent
   * @param {Array<C3DTilesLayer>} pointClouds - points cloud layer params
   * @param {object} options - options
   * @param {object} options.parentDomElement - where to append planar view domelement
   * @param {object} options.domElementClass - css class to apply to this.domElement
   * @param {object} options.c3DTilesLoadingDomElementClasses - css classes to apply to c3DTilesLoadingDomElement
   * @param {object} options.camera - options camera
   * @param {object} options.default - options camera default
   * @param {object} options.default.position - options camera default position
   * @param {object} options.defaultPointCloudSize - default points cloud size
   * @param {object} [options.raycasterPointsThreshold=PointCloudVisualizer.RAYCASTER_POINTS_THRESHOLD] - raycaster points treshold
   */
  constructor(extent, pointClouds, options = {}) {
    /** @type {Raycaster} */
    this.raycaster = new Raycaster();
    this.raycaster.params.Points.threshold =
      options.raycasterPointsThreshold ||
      PointCloudVisualizer.RAYCASTER_POINTS_THRESHOLD;

    /** @type {HTMLElement} */
    this.domElement = document.createElement('div');

    /**
     * `this.domElement` has be added to the DOM in order to compute its dimension
     * this is necessary because the itowns.PlanarView need these dimension in order to be initialized correctly
     */
    if (options.parentDomElement instanceof HTMLElement) {
      options.parentDomElement.appendChild(this.domElement);
    } else {
      document.body.appendChild(this.domElement);
    }

    if (options.domElementClass)
      this.domElement.classList.add(options.domElementClass);

    /** @type {PlanarView} */
    this.itownsView = new PlanarView(this.domElement, extent, {
      noControls: true,
    });

    // modify scene + renderer to have mesh rendering on the top
    this.itownsView.mainLoop.gfxEngine.renderer.autoClear = false;
    const onTheTopScene = new Scene();
    this.itownsView.render = () => {
      this.itownsView.mainLoop.gfxEngine.renderer.clear(); // clear buffers
      this.itownsView.mainLoop.gfxEngine.renderer.render(
        this.itownsView.scene,
        this.itownsView.camera.camera3D
      ); // render scene 1
      this.itownsView.mainLoop.gfxEngine.renderer.clearDepth(); // clear depth buffer
      this.itownsView.mainLoop.gfxEngine.renderer.render(
        onTheTopScene,
        this.itownsView.camera.camera3D
      ); // render scene 2
    };

    // initialize point clouds

    /** @type {Array<C3DTilesLayer>} */
    this.pointCloudLayers = [];

    pointClouds.forEach((params) => {
      const c3dTilesLayer = new C3DTilesLayer(
        params.name,
        {
          name: params.name,
          source: new C3DTilesSource({
            url: params.source.url,
          }),
        },
        this.itownsView
      );
      // itowns hack working to intialize point cloud material
      c3dTilesLayer.material = new PointsMaterial({
        size:
          options.defaultPointCloudSize ||
          PointCloudVisualizer.DEFAULT_POINT_SIZE,
        vertexColors: true,
      });
      View.prototype.addLayer.call(this.itownsView, c3dTilesLayer);
      this.pointCloudLayers.push(c3dTilesLayer); // ref pointCloud layer there to make difference between C3DTilesLayer b3dm and pnts
    });

    /** @type {OrbitControls} */
    this.orbitControls = new OrbitControls(
      this.itownsView.camera.camera3D,
      this.itownsView.mainLoop.gfxEngine.label2dRenderer.domElement
    );

    /** @type {Mesh} */
    this.targetOrbitControlsMesh = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({ color: 'red' })
    );
    this.targetOrbitControlsMesh.name = 'target_oribit_controls';
    onTheTopScene.add(this.targetOrbitControlsMesh);
    const updateTargetMesh = () => {
      this.targetOrbitControlsMesh.position.copy(this.orbitControls.target);
      const scale =
        this.itownsView.camera.camera3D.position.distanceTo(
          this.orbitControls.target
        ) / 80;
      this.targetOrbitControlsMesh.scale.set(scale, scale, scale);
    };
    this.orbitControls.addEventListener('change', () => {
      updateTargetMesh();
      // compute near far dynamically
      const bb = new Box3().setFromObject(this.itownsView.scene);
      computeNearFarCamera(this.itownsView.camera.camera3D, bb.min, bb.max);
      this.itownsView.notifyChange(this.itownsView.camera.camera3D);
    });

    // camera default placement
    {
      if (
        !localStorageSetCameraMatrix(
          this.itownsView.camera.camera3D,
          PointCloudVisualizer.CAMERA_LOCAL_STORAGE_KEY
        )
      ) {
        if (options.camera && options.camera.default)
          this.itownsView.camera.camera3D.position.set(
            options.camera.default.position.x,
            options.camera.default.position.y,
            options.camera.default.position.z
          );
      }

      if (
        !localStorageSetVector3(
          this.orbitControls.target,
          PointCloudVisualizer.TARGET_LOCAL_STORAGE_KEY
        )
      ) {
        const listener = ({ tileContent }) => {
          const bb = new Box3().setFromObject(tileContent);
          bb.getCenter(this.orbitControls.target);
          this.orbitControls.update();
          this.itownsView.notifyChange(this.itownsView.camera.camera3D);
          this.pointCloudLayers.forEach((layer) =>
            layer.removeEventListener(
              C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
              listener
            )
          );
        };

        this.pointCloudLayers.forEach((layer) => {
          layer.addEventListener(
            C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
            listener
          );
        });
      }

      updateTargetMesh();

      // loading 3DTiles ui
      {
        const c3DTilesLoadingDomElement = document.createElement('div');
        if (options.c3DTilesLoadingDomElementClasses) {
          options.c3DTilesLoadingDomElementClasses.forEach((cssClass) => {
            c3DTilesLoadingDomElement.classList.add(cssClass);
          });
        }
        this.domElement.appendChild(c3DTilesLoadingDomElement);
        c3DTilesLoadingDomElement.hidden = true;

        /** @type {Map<string, Mesh>} */
        const currentLoadingBox = new Map();

        const loadingBoxId = (layer, tileId) => layer.id + tileId;

        this.pointCloudLayers.forEach((c3dTilesLayer) => {
          c3dTilesLayer.addEventListener(
            C3DTILES_LAYER_EVENTS.ON_TILE_REQUESTED,
            ({ metadata }) => {
              if (metadata.tileId == undefined) throw new Error('no tile id');

              const worldBox3 = metadata.boundingVolume.box.clone();

              if (metadata.transform) {
                worldBox3.applyMatrix4(metadata.transform);
              } else if (metadata._worldFromLocalTransform) {
                worldBox3.applyMatrix4(metadata._worldFromLocalTransform);
              }

              const box3Object = new Mesh(
                new BoxGeometry(),
                new MeshBasicMaterial({
                  wireframe: true,
                  wireframeLinewidth: 2,
                  color: new Color(Math.random(), Math.random(), Math.random()),
                })
              );
              box3Object.scale.copy(worldBox3.max.clone().sub(worldBox3.min));
              worldBox3.getCenter(box3Object.position);
              box3Object.updateMatrixWorld();
              this.itownsView.scene.add(box3Object);
              this.itownsView.notifyChange(this.itownsView.camera.camera3D);

              // bufferize
              currentLoadingBox.set(
                loadingBoxId(c3dTilesLayer, metadata.tileId),
                box3Object
              );
              c3DTilesLoadingDomElement.hidden = false;
            }
          );

          c3dTilesLayer.addEventListener(
            C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
            ({ tileContent }) => {
              if (
                currentLoadingBox.has(
                  loadingBoxId(c3dTilesLayer, tileContent.tileId)
                )
              ) {
                this.itownsView.scene.remove(
                  currentLoadingBox.get(
                    loadingBoxId(c3dTilesLayer, tileContent.tileId)
                  )
                );
                currentLoadingBox.delete(
                  loadingBoxId(c3dTilesLayer, tileContent.tileId)
                );
                c3DTilesLoadingDomElement.hidden = currentLoadingBox.size == 0; // nothing more is loaded
                this.itownsView.notifyChange(this.itownsView.camera.camera3D);
              }
            }
          );
        });
      }
    }

    // different control speed
    this.domElementSpeedControls = document.createElement('div');
    {
      const sliderSpeedControls = createLocalStorageSlider(
        'speed_orbit_controls',
        'Controls vitesse',
        this.domElementSpeedControls,
        {
          min: 0.01,
          max: 0.75,
          step: 'any',
          defaultValue: 0.3,
        }
      );

      const updateSpeedControls = () => {
        const speed = sliderSpeedControls.valueAsNumber;
        this.orbitControls.rotateSpeed = speed;
        this.orbitControls.zoomSpeed = speed;
        this.orbitControls.panSpeed = speed;
      };

      sliderSpeedControls.oninput = updateSpeedControls;
      updateSpeedControls();
    }

    // move orbit control target
    this.domElementTargetDragElement = document.createElement('div');
    {
      this.domElementTargetDragElement = document.createElement('div');
      this.domElementTargetDragElement.draggable = true;

      this.domElementTargetDragElement.ondragend = (event) => {
        if (event.target === this.domElementTargetDragElement) {
          const i = this.eventTo3DTilesIntersect(event);
          if (i) this.moveCamera(null, i.point, 500);
        }
      };
    }

    // box3 of point cloud
    {
      const box3PointCloud = new Box3();
      const boxMeshPointCloud = new Mesh(
        new BoxGeometry(),
        new MeshBasicMaterial({ wireframe: true })
      );
      this.itownsView.scene.add(boxMeshPointCloud);
      this.pointCloudLayers.forEach((c3dTilesLayer) => {
        c3dTilesLayer.addEventListener(
          C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
          () => {
            // box3PointCloud.setFromObject(c3dTilesLayer.object3d);
            box3PointCloud.expandByObject(c3dTilesLayer.object3d);
            box3PointCloud.getCenter(boxMeshPointCloud.position);
            boxMeshPointCloud.scale.copy(
              box3PointCloud.max.clone().sub(box3PointCloud.min)
            );
            boxMeshPointCloud.updateMatrixWorld();
          }
        );
      });
    }

    // redraw
    this.itownsView.notifyChange(this.itownsView.camera.camera3D);
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

  /**
   *
   * @param {Event} event - mouse event
   * @returns {object} - intersects object on pointcloud layers
   */
  eventTo3DTilesIntersect(event) {
    this.raycaster.setFromCamera(
      this.eventToMouseCoord(event),
      this.itownsView.camera.camera3D
    );

    let minDist = Infinity;
    let result = null;

    this.pointCloudLayers.forEach((layer) => {
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
   * @param {Vector3} destPosition - destination position of the camera
   * @param {Vector3} destTarget - destination target of the orbit controls
   * @param {number} duration - duration in ms
   * @returns {Promise} - promise resolving when the camera has moved
   */
  moveCamera(destPosition, destTarget, duration = 1500) {
    if (!destPosition)
      destPosition = this.itownsView.camera.camera3D.position.clone();
    if (!destTarget) destTarget = this.orbitControls.target.clone();
    const startCameraPosition =
      this.itownsView.camera.camera3D.position.clone();
    const startCameraTargetPosition = this.orbitControls.target.clone();

    this.targetOrbitControlsMesh.visible = false;

    this.orbitControls.enabled = false;
    const process = new RequestAnimationFrameProcess(30);

    let currentDuration = 0;

    return new Promise((resolve) => {
      process.start((dt) => {
        currentDuration += dt;
        const ratio = Math.min(Math.max(0, currentDuration / duration), 1);

        this.itownsView.camera.camera3D.position.lerpVectors(
          startCameraPosition,
          destPosition,
          ratio
        );

        this.orbitControls.target.lerpVectors(
          startCameraTargetPosition,
          destTarget,
          ratio
        );

        this.orbitControls.update();

        if (ratio == 1) {
          this.orbitControls.enabled = true;
          this.targetOrbitControlsMesh.visible = true;
          process.stop();
          resolve();
        }
      });
    });
  }

  static get DEFAULT_POINT_SIZE() {
    return 0.03;
  }

  static get TARGET_LOCAL_STORAGE_KEY() {
    return 'target_local_storage_key_point_cloud_visualizer';
  }

  static get CAMERA_LOCAL_STORAGE_KEY() {
    return 'camera_local_storage_key_point_cloud_visualizer';
  }

  static get RAYCASTER_POINTS_THRESHOLD() {
    return 0.01;
  }
}
