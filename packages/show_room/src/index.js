import { Planar } from '@ud-viz/frame3d';
import {
  URLSetCameraMatrix,
  RequestService,
  downloadObjectAsJson,
  appendCameraMatrixToURL,
  checkParentChild,
} from '@ud-viz/utils_browser';
import {
  AuthenticationView,
  AuthenticationService,
  Core,
  VisualizerView,
  Contribute,
  Comment,
  Validation,
  GuidedTourController,
} from '@ud-viz/smdb';
import { CameraPositioner } from '@ud-viz/widget_camera_positioner';
import { GeocodingView, GeocodingService } from '@ud-viz/widget_geocoding';
import { LayerChoice } from '@ud-viz/widget_layer_choice';
import { SlideShow } from '@ud-viz/widget_slide_show';
import {
  SparqlEndpointResponseProvider,
  SparqlQueryWindow,
} from '@ud-viz/widget_sparql';
import { C3DTiles } from '@ud-viz/widget_3d_tiles';
import { Bookmark } from '@ud-viz/widget_bookmark';
import { SinglePlanarProcess, InputManager } from '@ud-viz/game_browser';
import {
  CameraManager,
  DragAndDropAvatar as ExternalDragAndDropAvatar,
} from '@ud-viz/game_browser_template';
import { Object3D } from '@ud-viz/game_shared';
import {
  NativeCommandManager,
  DragAndDropAvatar,
} from '@ud-viz/game_shared_template';
import * as itowns from 'itowns';
import * as THREE from 'three';
import { version } from '../package.json';

import './style.css';

export class ShowRoom {
  constructor(extent, frame3DPlanarOptions) {
    /** @type {itowns.Extent} */
    this.extent = extent; // ref it to add layers then

    /** @type {Planar} */
    this.frame3DPlanar = new Planar(extent, frame3DPlanarOptions);

    // right click open a menu to copy position
    this.addContextMenu();

    URLSetCameraMatrix(this.frame3DPlanar.camera);

    /** @type {itowns.Style} */
    this.c3DTilesStyle = new itowns.Style({
      fill: {
        color: (feature) => {
          return feature.userData.selectedColor
            ? feature.userData.selectedColor
            : 'white';
        },
      },
    });

    // add pick to frame3DPlanar
    const contextSelection = {
      feature: null,
      layer: null,
    };
    this.frame3DPlanar.domElement.onclick = (event) => {
      if (contextSelection.feature) {
        contextSelection.feature.userData.selectedColor = null;
        contextSelection.layer.updateStyle();
        contextSelection.feature = null;
        contextSelection.layer = null;
      }

      const intersects = this.frame3DPlanar.itownsView.pickObjectsAt(
        event,
        0,
        this.frame3DPlanar.itownsView
          .getLayers()
          .filter((el) => el.isC3DTilesLayer)
      );

      if (intersects.length) {
        const elementClicked =
          intersects[0].layer.getC3DTileFeatureFromIntersectsArray(intersects);
        if (elementClicked) {
          elementClicked.userData.selectedColor = 'blue';
          contextSelection.feature = elementClicked;
          contextSelection.layer = intersects[0].layer;
          contextSelection.layer.updateStyle();
        }
      }
      if (this.widgetC3DTiles)
        this.widgetC3DTiles.displayC3DTFeatureInfo(
          contextSelection.feature,
          contextSelection.layer
        );
      this.frame3DPlanar.itownsView.notifyChange(); // need a redraw of the view
    };

    /** @type {RequestService} */
    this.requestService = new RequestService();

    // HTML ELEMENT NEEDED TO BE REFERENCED

    // CHILD UI

    /** @type {HTMLElement} */
    this.menuSideBar = null;

    /** @type {HTMLElement} */
    this.logoContainer = null;

    // WIDGET (not all reference are used but can be that way for now)

    /** @type {GeocodingView|null} */
    this.geocodingView = null;

    /** @type {Core|null} */
    this.documentCore = null;

    /** @type {GuidedTourController|null} */
    this.guidedTourController = null;

    /** @type {CameraPositioner|null} */
    this.cameraPositioner = null;

    /** @type {LayerChoice|null} */
    this.layerChoice = null;

    /** @type {SlideShow|null} */
    this.slideShow = null;

    /** @type {SparqlQueryWindow|null} */
    this.sparqlQueryWindow = null;

    /** @type {C3DTiles|null} */
    this.widgetC3DTiles = null;

    /** @type {Bookmark|null} */
    this.widgetBookmark = null;

    // INTIALIZE
    this.initUI(version);
  }

  /**
   * Add a context menu to copy coord
   */
  addContextMenu() {
    this.frame3DPlanar.itownsView.controls.enablePan = false;
    const contextMenuDomElement = document.createElement('div');
    contextMenuDomElement.classList.add('context-menu');
    contextMenuDomElement.hidden = true;
    this.frame3DPlanar.domElementUI.appendChild(contextMenuDomElement);

    const downloadCoordButton = document.createElement('button');
    downloadCoordButton.innerText = 'Copy coord';
    contextMenuDomElement.appendChild(downloadCoordButton);

    // world coord in view.referenceCrs
    const worldPosition = new THREE.Vector3();

    downloadCoordButton.onclick = () => {
      downloadObjectAsJson(
        worldPosition,
        'showroom_coord_' + this.frame3DPlanar.itownsView.referenceCrs
      );
    };

    const forceNoneStatePlanarControls = () => {
      this.frame3DPlanar.itownsView.controls.state = -1; // TODO: ask itowns to expose state NONE of the PlanarControls
      this.frame3DPlanar.itownsView.controls.updateMouseCursorType();
    };

    const closeContextMenu = () => {
      if (!contextMenuDomElement.hidden) {
        contextMenuDomElement.hidden = true;
        this.frame3DPlanar.itownsView.controls.enabled = true;
        forceNoneStatePlanarControls();
        return true;
      }
      return false;
    };

    this.frame3DPlanar.domElement.addEventListener('click', closeContextMenu);

    this.frame3DPlanar.domElement.oncontextmenu = (event) => {
      if (closeContextMenu()) return;

      this.frame3DPlanar.itownsView.controls.enabled = false; // disable controls while context menu
      forceNoneStatePlanarControls();

      const mouse = new THREE.Vector2(event.clientX, event.clientY);

      this.frame3DPlanar.itownsView.getPickingPositionFromDepth(
        mouse,
        worldPosition
      );

      const onScreenCoord = worldPosition.clone();

      onScreenCoord.project(this.frame3DPlanar.camera);

      // compute position on screen
      const widthHalf = this.frame3DPlanar.domElementWebGL.clientWidth * 0.5,
        heightHalf = this.frame3DPlanar.domElementWebGL.clientHeight * 0.5;
      onScreenCoord.x = onScreenCoord.x * widthHalf + widthHalf;
      onScreenCoord.y = -(onScreenCoord.y * heightHalf) + heightHalf;

      contextMenuDomElement.style.left = onScreenCoord.x + 'px';
      contextMenuDomElement.style.top = onScreenCoord.y + 'px';

      contextMenuDomElement.hidden = false;
      console.debug(worldPosition);
    };
  }

  /**
   * Add layers of geo data
   *
   * @param {object} configs - different config
   * @todo describe all configs
   */
  addLayers(configs) {
    if (configs.$3DTiles) {
      configs.$3DTiles.forEach((layerConfig) => {
        itowns.View.prototype.addLayer.call(
          this.frame3DPlanar.itownsView,
          new itowns.C3DTilesLayer(
            layerConfig['id'],
            {
              style: this.c3DTilesStyle,
              name: layerConfig['id'],
              source: new itowns.C3DTilesSource({
                url: layerConfig['url'],
              }),
            },
            this.frame3DPlanar.itownsView
          )
        );
      });
    }
    if (configs.elevation) {
      const isTextureFormat =
        configs.elevation['format'] == 'image/jpeg' ||
        configs.elevation['format'] == 'image/png';
      this.frame3DPlanar.itownsView.addLayer(
        new itowns.ElevationLayer(configs.elevation['layer_name'], {
          useColorTextureElevation: isTextureFormat,
          colorTextureElevationMinZ: isTextureFormat
            ? configs.elevation['colorTextureElevationMinZ']
            : null,
          colorTextureElevationMaxZ: isTextureFormat
            ? configs.elevation['colorTextureElevationMaxZ']
            : null,
          source: new itowns.WMSSource({
            extent: this.extent,
            url: configs.elevation['url'],
            name: configs.elevation['name'],
            crs: this.extent.crs,
            heightMapWidth: 256,
            format: configs.elevation['format'],
          }),
        })
      );
    }
    if (configs.baseMap) {
      this.frame3DPlanar.itownsView.addLayer(
        new itowns.ColorLayer(configs.baseMap['name'], {
          updateStrategy: {
            type: itowns.STRATEGY_DICHOTOMY,
            options: {},
          },
          source: new itowns.WMSSource({
            extent: this.extent,
            name: configs.baseMap.source['name'],
            url: configs.baseMap.source['url'],
            version: configs.baseMap.source['version'],
            crs: this.extent.crs,
            format: configs.baseMap.source['format'],
          }),
          transparent: true,
        })
      );
    }
    if (configs.labels) {
      configs.labels.forEach((layerConfig) => {
        if (
          !layerConfig['id'] ||
          !layerConfig['url'] ||
          !layerConfig['sourceType']
        ) {
          console.warn(
            'Your "LabelLayer" field does not have either "url", "id" or "sourceType" properties. '
          );
          return;
        }

        let source = null;

        // Declare the data source for the LabelLayer
        if (layerConfig['sourceType'] == 'file') {
          source = new itowns.FileSource({
            url: layerConfig.url,
            crs: this.extent.crs,
            format: 'application/json',
          });
        } else if (layerConfig['sourceType'] == 'wfs') {
          source = new itowns.WFSSource({
            url: layerConfig.url,
            version: '2.0.0',
            typeName: layerConfig.name,
            crs: this.extent.crs,
            format: 'application/json',
          });
        } else {
          console.warn(
            'Unsupported LabelLayer sourceType ' + layerConfig['sourceType']
          );
          return;
        }

        const layerStyle = new itowns.Style(layerConfig.style);

        const zoom = { min: 0 };
        if (layerConfig.zoom) {
          if (layerConfig.zoom.min) zoom.min = layerConfig.zoom.min;
          if (layerConfig.zoom.max) zoom.max = layerConfig.zoom.max;
        }

        const labelLayer = new itowns.LabelLayer(layerConfig.id, {
          transparent: true,
          source: source,
          style: layerStyle,
          zoom: zoom,
        });
        this.frame3DPlanar.itownsView.addLayer(labelLayer);
      });
    }
    if (configs.geoJSON) {
      configs.geoJSON.forEach((layerConfig) => {
        this.frame3DPlanar.itownsView.addLayer(
          new itowns.ColorLayer(layerConfig.id, {
            name: layerConfig.id,
            transparent: true,
            source: new itowns.FileSource({
              url: layerConfig.url,
              crs: this.extent.crs,
              format: 'application/json',
            }),
            style: new itowns.Style(layerConfig.style),
          })
        );
      });
    }
  }

  /**
   * Add a logo in the logo container
   *
   * @param {string} pathLogoArray - path to your logo image
   */
  addLogos(pathLogoArray) {
    pathLogoArray.forEach((pathLogo) => {
      const logo = document.createElement('img');
      logo.classList.add('logo');
      logo.src = pathLogo;
      this.logoContainer.appendChild(logo);
    });
  }

  initUI(version) {
    // Menu Side bar
    this.menuSideBar = document.createElement('div');
    this.menuSideBar.classList.add('_sidebar_widget_menu_sidebar');
    this.frame3DPlanar.domElementUI.appendChild(this.menuSideBar, 3);
    {
      // title
      const titleNavBar = document.createElement('div');
      titleNavBar.classList.add('ud-viz-label');
      titleNavBar.innerText = 'UD-VIZ ' + version;
      this.menuSideBar.appendChild(titleNavBar);

      // hr
      const hrElement = document.createElement('hr');
      this.menuSideBar.appendChild(hrElement);
    }

    // Pan Menu Side bar
    this.panMenuSideBar = new PanMenuSideBar();
    this.frame3DPlanar.domElementUI.appendChild(this.panMenuSideBar.domElement);

    // Logo container
    this.logoContainer = document.createElement('div');
    this.logoContainer.setAttribute('id', 'logo-container');
    this.frame3DPlanar.domElementUI.appendChild(this.logoContainer);
  }

  addURLButton(pathIcon) {
    // url camera matrix button
    const urlCameraMatrixButton = document.createElement('img');
    urlCameraMatrixButton.src = pathIcon;
    urlCameraMatrixButton.title = 'Camera Position Url';
    this.menuSideBar.appendChild(urlCameraMatrixButton);

    urlCameraMatrixButton.onclick = () => {
      const url = new URL(window.location.origin + window.location.pathname);

      appendCameraMatrixToURL(url, this.frame3DPlanar.camera);

      // put it in clipboard
      navigator.clipboard.writeText(url);
      alert('Camera Position Url copied !');
    };
  }

  // ADD METHOD WIDGET

  addWidgetGeocoding(configServer, pathIcon) {
    this.geocodingView = new GeocodingView(
      new GeocodingService(this.requestService, this.extent, configServer),
      this.frame3DPlanar.itownsView
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.geocodingView.domElement.parentElement) {
        this.panMenuSideBar.remove(this.geocodingView.domElement);
        this.geocodingView.removePins();
        this.geocodingView.domElement.remove();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add('Geocoding', this.geocodingView.domElement);
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetSMDB(configServer, pathIcon) {
    const rootSMDBDomElement = document.createElement('div');

    const authentificationView = new AuthenticationView(
      new AuthenticationService(this.requestService, configServer)
    );
    authentificationView.closeButton.remove();

    rootSMDBDomElement.appendChild(authentificationView.domElement);

    const rootDocumentHtml = document.createElement('div');
    rootSMDBDomElement.appendChild(rootDocumentHtml);
    const parentHtmlFeature = document.createElement('div');

    // CORE
    this.documentCore = new Core(this.requestService, configServer);

    // VISUALIZER
    const visualizerView = new VisualizerView(
      this.frame3DPlanar.itownsView,
      this.documentCore.provider
    );

    const visualizeButton = document.createElement('button');
    visualizeButton.innerText = 'Visualize';
    visualizeButton.onclick = async () => {
      await visualizerView.startTravelToDisplayedDocument();
      this.frame3DPlanar.domElementUI.appendChild(visualizerView.domElement);
    };
    this.documentCore.view.inspectorWindow.domElement.appendChild(
      visualizeButton
    );

    // CONTRIBUTE

    const documentContribute = new Contribute(
      this.documentCore.provider,
      visualizerView,
      this.requestService,
      this.frame3DPlanar.itownsView,
      this.frame3DPlanar.itownsView.controls,
      configServer,
      this.frame3DPlanar.domElementUI
    );

    const updateButton = document.createElement('button');
    updateButton.innerText = 'Update';
    updateButton.onclick = async () => {
      await documentContribute.updateWindow.updateFromDisplayedDocument();
      while (parentHtmlFeature.firstChild) {
        parentHtmlFeature.firstChild.remove();
      }
      parentHtmlFeature.appendChild(documentContribute.updateWindow.domElement);
    };
    this.documentCore.view.inspectorWindow.domElement.appendChild(updateButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.onclick = async () => {
      if (
        !confirm(
          'You are going to delete the document. This operation ' +
            'is irreversible. Do you want to continue ?'
        )
      ) {
        return;
      }
      try {
        await documentContribute.contributeService.deleteDocument();
      } catch (e) {
        alert(e);
      }
    };
    this.documentCore.view.inspectorWindow.domElement.appendChild(deleteButton);

    const createDocumentButton = document.createElement('button');
    createDocumentButton.innerText = 'Create new document';
    createDocumentButton.onclick = () => {
      while (parentHtmlFeature.firstChild) {
        parentHtmlFeature.firstChild.remove();
      }
      parentHtmlFeature.appendChild(
        documentContribute.creationWindow.domElement
      );
    };
    this.documentCore.view.navigatorWindow.documentListContainer.appendChild(
      createDocumentButton
    );

    // VALIDATION
    const documentValidation = new Validation(
      this.documentCore.provider,
      this.requestService,
      configServer,
      this.documentCore.view.inspectorWindow.domElement
    );

    this.documentCore.view.navigatorWindow.displayableFiltersContainer.appendChild(
      documentValidation.validationView.domElement
    );

    // COMMENT
    const documentComment = new Comment(
      this.documentCore.provider,
      this.requestService,
      configServer
    );

    const commentButton = document.createElement('button');
    commentButton.innerText = 'Comment';
    commentButton.onclick = async () => {
      while (parentHtmlFeature.firstChild) {
        parentHtmlFeature.firstChild.remove();
      }
      await documentComment.commentsWindow.getComments();
      parentHtmlFeature.appendChild(documentComment.commentsWindow.domElement);
    };

    this.documentCore.view.inspectorWindow.domElement.appendChild(
      commentButton
    );

    // PLUG WITH SIDEBAR BUTTON
    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (rootSMDBDomElement.parentElement) {
        this.panMenuSideBar.remove(rootSMDBDomElement);
        this.documentCore.view.navigatorWindow.domElement.remove();
        this.documentCore.view.inspectorWindow.domElement.remove();

        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        // rebuild rootDocument
        while (rootDocumentHtml.firstChild) {
          rootDocumentHtml.firstChild.remove();
        }
        while (parentHtmlFeature.firstChild) {
          parentHtmlFeature.firstChild.remove();
        }
        rootDocumentHtml.appendChild(
          this.documentCore.view.navigatorWindow.domElement
        );
        rootDocumentHtml.appendChild(
          this.documentCore.view.inspectorWindow.domElement
        );
        rootDocumentHtml.appendChild(parentHtmlFeature);
        this.panMenuSideBar.add('Document', rootSMDBDomElement);
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetGuidedTour(configServer, pathIcon) {
    if (!this.documentCore) {
      console.warn('You should addWidgetDocument first');
      return;
    }

    this.guidedTourController = new GuidedTourController(
      this.documentCore,
      this.requestService,
      configServer
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.guidedTourController.guidedTour.domElement.parentElement) {
        this.panMenuSideBar.remove(
          this.guidedTourController.guidedTour.domElement
        );
        this.guidedTourController.guidedTour.domElement.remove();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add(
          'Guided Tour',
          this.guidedTourController.guidedTour.domElement
        );
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetCameraPositioner(pathIcon) {
    this.cameraPositioner = new CameraPositioner(this.frame3DPlanar.itownsView);

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.cameraPositioner.domElement.parentElement) {
        this.panMenuSideBar.remove(this.cameraPositioner.domElement);
        this.cameraPositioner.domElement.remove();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add(
          'Camera Positioner',
          this.cameraPositioner.domElement
        );
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetLayerChoice(pathIcon) {
    this.layerChoice = new LayerChoice(this.frame3DPlanar.itownsView);

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.layerChoice.domElement.parentElement) {
        this.panMenuSideBar.remove(this.layerChoice.domElement);
        this.layerChoice.domElement.remove();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add('Layer Choice', this.layerChoice.domElement);
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetSlideShow(configSlideShow, pathIcon) {
    this.slideShow = new SlideShow(
      this.frame3DPlanar.itownsView,
      configSlideShow,
      this.extent
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.slideShow.domElement.parentElement) {
        this.panMenuSideBar.remove(this.slideShow.domElement);
        this.slideShow.dispose();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add('Slide Show', this.slideShow.domElement);
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
        this.slideShow.addListeners();
        this.frame3DPlanar.scene.add(this.slideShow.plane);
        this.frame3DPlanar.itownsView.notifyChange();
      }
    };
  }

  addWidgetSparql(configServer, configWidget, pathIcon) {
    this.sparqlQueryWindow = new SparqlQueryWindow(
      new SparqlEndpointResponseProvider(configServer),
      configWidget
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.sparqlQueryWindow.domElement.parentElement) {
        this.panMenuSideBar.remove(this.sparqlQueryWindow.domElement);
        this.sparqlQueryWindow.domElement.remove();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add('Sparql', this.sparqlQueryWindow.domElement);
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addCustomHtml(pathIcon, customHtml, label) {
    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);
    sideBarButton.onclick = () => {
      if (customHtml.parentElement) {
        this.panMenuSideBar.remove(customHtml);
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add(label, customHtml);

        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addDragAndDropAvatar(pathIcon, assetManager, idRenderDataAvatar) {
    console.warn(
      'Drag and drop avatar is still experimental, since it can conflict with camera movement of other widget, notice also that itowns.MAIN_LOOP is quite hacked see SinglePlanarProcess start method'
    );
    const domElement = document.createElement('div');

    // create a single planar process using drag and drop game template
    const singleProcessPlanar = new SinglePlanarProcess(
      new Object3D({
        static: true,
        components: {
          GameScript: {
            idScripts: [
              DragAndDropAvatar.ID_SCRIPT,
              NativeCommandManager.ID_SCRIPT,
            ],
            variables: {
              idRenderDataAvatar: idRenderDataAvatar,
              defaultSpeedRotate: 0.0005,
            },
          },
          ExternalScript: {
            idScripts: [
              ExternalDragAndDropAvatar.ID_SCRIPT,
              CameraManager.ID_SCRIPT,
            ],
          },
        },
      }),
      this.frame3DPlanar,
      assetManager,
      new InputManager(),
      {
        gameScriptClass: [DragAndDropAvatar, NativeCommandManager],
        externalGameScriptClass: [ExternalDragAndDropAvatar, CameraManager],
      }
    );

    // tell to the drag and drop external script where to add its html
    singleProcessPlanar.externalGameContext.userData.dragAndDropAvatarDomElement =
      domElement;

    singleProcessPlanar.start();

    this.addCustomHtml(pathIcon, domElement, 'Drag and drop avatar');
  }

  addWidgetC3DTiles(pathIcon) {
    this.widgetC3DTiles = new C3DTiles(this.frame3DPlanar.itownsView, {
      overrideStyle: this.c3DTilesStyle,
      parentElement: this.frame3DPlanar.domElementUI, // some hack see => https://github.com/iTowns/itowns/discussions/2098
    });

    this.widgetC3DTiles.domElement.remove();

    this.addCustomHtml(pathIcon, this.widgetC3DTiles.domElement, '3DTiles');
  }

  addWidgetBookmark(pathIcon) {
    this.widgetBookmark = new Bookmark(this.frame3DPlanar.itownsView, {
      parentElement: this.frame3DPlanar.domElementUI, // some hack see => https://github.com/iTowns/itowns/discussions/2098
    });

    this.widgetBookmark.domElement.remove();

    this.addCustomHtml(pathIcon, this.widgetBookmark.domElement, 'Bookmark');
  }
}

class PanMenuSideBar {
  constructor() {
    this.domElement = document.createElement('div');
    this.domElement.classList.add('_sidebar_widget_pan_menu_sidebar');

    this.domElement.onclick = (event) => event.stopImmediatePropagation();

    this.containers = [];
  }

  add(label, el) {
    const newContainer = document.createElement('div');
    newContainer.innerText = label;
    newContainer.classList.add('_sidebar_widget_pan_menu_sidebar_container');
    newContainer.appendChild(el);
    this.containers.push(newContainer);
    this.domElement.appendChild(newContainer);
    this.fold(false);
  }

  remove(el) {
    for (let index = 0; index < this.containers.length; index++) {
      const container = this.containers[index];
      if (checkParentChild(el, container)) {
        container.remove();
        el.remove();
        this.containers.splice(index, 1);
        break;
      }
    }

    this.foldIfEmpty();
  }

  foldIfEmpty() {
    if (!this.domElement.firstChild) this.fold(true);
  }

  fold(value) {
    if (value) {
      this.domElement.style.transform = 'translate(-100%,0%)';
    } else {
      this.domElement.style.transform = 'translate(0%,0%)';
    }
  }
}
