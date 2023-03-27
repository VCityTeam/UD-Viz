import * as itowns from 'itowns';
import {
  checkParentChild,
  RequestService,
  clearChildren,
  Frame3DPlanar,
  add3DTilesLayers,
  addBaseMapLayer,
  addElevationLayer,
  addGeoJsonLayers,
  addLabelLayers,
  Widget,
  Game,
  InputManager,
} from '../Component/Component';

import * as Shared from '@ud-viz/shared';

import packageInfo from '../../package.json';

import './SideBarWidget.css';

export class SideBarWidget {
  /**
   *
   * @param {itowns.Extent} extent - itowns extent
   * @param {import('../Component/Frame3D/Frame3DPlanar').Frame3DPlanarOption} frame3DPlanarOptions - frame 3D planar option
   */
  constructor(extent, frame3DPlanarOptions) {
    /** @type {itowns.Extent} */
    this.extent = extent; // ref it to add layers then

    /** @type {Frame3DPlanar} */
    this.frame3DPlanar = new Frame3DPlanar(extent, frame3DPlanarOptions);

    /** @type {RequestService} */
    this.requestService = new RequestService();

    // HTML ELEMENT NEEDED TO BE REFERENCED

    // CHILD UI

    /** @type {HTMLElement} */
    this.menuSideBar = null;

    /** @type {HTMLElement} */
    this.logoContainer = null;

    // CHILD AUTHENTICATION FRAME

    /** @type {HTMLElement} */
    this.authenticationMenuLoggedIn = null;

    /** @type {HTMLElement} */
    this.authenticationMenuLoggedOut = null;

    /** @type {HTMLElement} */
    this.authenticationUserNameID = null;

    /** @type {HTMLElement} */
    this.authenticationButtonLogOut = null;

    /** @type {HTMLElement} */
    this.buttonLogIn = null;

    // WIDGET (not all reference are used but can be that way for now)

    /** @type {Widget.Server.AuthenticationView|null} */
    this.authenticationView = null;

    /** @type {Widget.Server.GeocodingView|null} */
    this.geocodingView = null;

    /** @type {Widget.CityObjectProvider} */
    this.cityObjectProvider = null;

    /** @type {Widget.CityObjectModule} */
    this.cityObjectModule = null;

    /** @type {Widget.Debug3DTilesView} */
    this.debug3DTilesView = null;

    /** @type {Widget.Server.Document.Core} */
    this.documentCore = null;

    /** @type {Widget.Server.Document.GuidedTourController} */
    this.guidedTourController = null;

    /** @type {Widget.CameraPositioner} */
    this.cameraPositioner = null;

    /** @type {Widget.TemporalModule} */
    this.temporalModule = null;

    /** @type {Widget.LayerChoice} */
    this.layerChoice = null;

    /** @type {Widget.SlideShow} */
    this.slideShow = null;

    /** @type {Widget.Server.SparqlQueryWindow} */
    this.sparqlQueryWindow = null;

    // INTIALIZE
    this.initUI();
  }

  /**
   *
   * @returns {HTMLElement} root html
   */
  html() {
    return this.frame3DPlanar.rootHtml;
  }

  /**
   * Dispose
   */
  dispose() {
    this.frame3DPlanar.dispose();
  }

  /**
   * Add layers of geo data
   *
   * @param {object} configs - different config
   * @todo describe all configs
   */
  addLayers(configs) {
    if (configs.$3DTiles) {
      add3DTilesLayers(
        configs.$3DTiles,
        this.frame3DPlanar.layerManager,
        this.frame3DPlanar.itownsView
      );
    }
    if (configs.elevation) {
      addElevationLayer(
        configs.elevation,
        this.frame3DPlanar.itownsView,
        this.extent
      );
    }
    if (configs.baseMap) {
      addBaseMapLayer(
        configs.baseMap,
        this.frame3DPlanar.itownsView,
        this.extent
      );
    }
    if (configs.labels) {
      addLabelLayers(
        configs.labels,
        this.frame3DPlanar.itownsView,
        this.extent
      );
    }
    if (configs.geoJSON) {
      addGeoJsonLayers(
        configs.geoJSON,
        this.frame3DPlanar.itownsView,
        this.extent
      );
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

  /**
   * Init default ui skeleton
   */
  initUI() {
    // Menu Side bar
    this.menuSideBar = document.createElement('div');
    this.menuSideBar.classList.add('_sidebar_widget_menu_sidebar');
    this.frame3DPlanar.appendToUI(this.menuSideBar);
    {
      // title
      const titleNavBar = document.createElement('div');
      titleNavBar.classList.add('ud-viz-label');
      titleNavBar.innerHTML = 'UD-VIZ ' + packageInfo.version;
      this.menuSideBar.appendChild(titleNavBar);

      // hr
      const hrElement = document.createElement('hr');
      this.menuSideBar.appendChild(hrElement);
    }

    // Pan Menu Side bar
    this.panMenuSideBar = new PanMenuSideBar();
    this.frame3DPlanar.appendToUI(this.panMenuSideBar.html());

    // Logo container
    this.logoContainer = document.createElement('div');
    this.logoContainer.setAttribute('id', 'logo-container');
    this.frame3DPlanar.appendToUI(this.logoContainer);
  }

  // ADD METHOD WIDGET

  addWidgetAuthentication(configServer, pathAuthenticationIcon) {
    const initAuthenticationFrame = () => {
      // Authentication Frame
      const authenticationFrame = document.createElement('div');
      authenticationFrame.setAttribute('id', '_sidebar_widget_profile');
      this.frame3DPlanar.appendToUI(authenticationFrame);
      {
        // Authentication Menu Logged in
        this.authenticationMenuLoggedIn = document.createElement('div');
        this.authenticationMenuLoggedIn.setAttribute(
          'id',
          '_sidebar_widget_profile_menu_logged_in'
        );
        authenticationFrame.appendChild(this.authenticationMenuLoggedIn);
        {
          // User Name
          this.authenticationUserNameID = document.createElement('div');
          this.authenticationUserNameID.setAttribute(
            'id',
            '_sidebar_widget_profile_name'
          );
          this.authenticationMenuLoggedIn.appendChild(
            this.authenticationUserNameID
          );

          // Button log out
          this.authenticationButtonLogOut = document.createElement('button');
          this.authenticationButtonLogOut.classList.add('logInOut');
          this.authenticationButtonLogOut.innerHTML = 'Logout';
          this.authenticationButtonLogOut.setAttribute(
            'id',
            '_sidebar_widget_button_logout'
          );
          this.authenticationMenuLoggedIn.appendChild(
            this.authenticationButtonLogOut
          );
        }

        // Authentication Menu Logged out
        this.authenticationMenuLoggedOut = document.createElement('div');
        this.authenticationMenuLoggedOut.setAttribute(
          'id',
          '_sidebar_widget_profile_menu_logged_out'
        );
        authenticationFrame.appendChild(this.authenticationMenuLoggedOut);
        {
          // button log in
          this.buttonLogIn = document.createElement('img');
          this.buttonLogIn.setAttribute('id', '_sidebar_widget_button_login');
          this.buttonLogIn.classList.add('logInout');
          this.buttonLogIn.src = pathAuthenticationIcon;
          this.authenticationMenuLoggedOut.appendChild(this.buttonLogIn);
        }
      }
    };

    const updateAuthenticationFrame = () => {
      if (!this.authenticationView) return;

      const service = this.authenticationView.authenticationService;

      if (service.isUserLoggedIn()) {
        const user = service.getUser();
        this.authenticationMenuLoggedIn.hidden = false;
        this.authenticationMenuLoggedOut.hidden = true;
        this.authenticationUserNameID.innerHTML = `Logged in as <em>${user.firstname} ${user.lastname}</em>`;

        if (this.authenticationView.html().parentElement) {
          this.authenticationView.dispose();
        }
      } else {
        this.authenticationMenuLoggedIn.hidden = true;
        this.authenticationMenuLoggedOut.hidden = false;
      }
    };

    // intialize ui
    initAuthenticationFrame();

    // create widget view
    this.authenticationView = new Widget.Server.AuthenticationView(
      new Widget.Server.AuthenticationService(this.requestService, configServer)
    );

    // link button event
    this.buttonLogIn.onclick = () => {
      this.frame3DPlanar.appendToUI(this.authenticationView.html());
    };

    this.authenticationButtonLogOut.onclick = () => {
      try {
        this.authenticationView.authenticationService.logout();
      } catch (e) {
        console.error(e);
      }
    };

    // listen for user state changes
    this.authenticationView.authenticationService.addObserver(
      updateAuthenticationFrame.bind(this)
    );
    updateAuthenticationFrame();
  }

  addWidgetGeocoding(configServer, pathIcon) {
    this.geocodingView = new Widget.Server.GeocodingView(
      new Widget.Server.GeocodingService(
        this.requestService,
        this.extent,
        configServer
      ),
      this.frame3DPlanar.itownsView
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.geocodingView.html().parentElement) {
        this.geocodingView.dispose();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.frame3DPlanar.appendToUI(this.geocodingView.html());
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetCityObject(configStyles, pathIcon) {
    if (!this.cityObjectProvider) {
      this.cityObjectProvider = new Widget.CityObjectProvider(
        this.frame3DPlanar.layerManager,
        configStyles
      );
    }

    this.cityObjectModule = new Widget.CityObjectModule(
      this.cityObjectProvider,
      configStyles
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.cityObjectModule.view.html().parentElement) {
        this.panMenuSideBar.remove(this.cityObjectModule.view.html());
        this.cityObjectModule.view.dispose();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add(
          'CityObject',
          this.cityObjectModule.view.html()
        );
        this.cityObjectModule.view.addListenerTo(this.frame3DPlanar.rootWebGL);
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetDebug3DTiles(pathIcon) {
    this.debug3DTilesView = new Widget.Debug3DTilesView(
      this.frame3DPlanar.layerManager
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.debug3DTilesView.html().parentElement) {
        this.panMenuSideBar.remove(this.debug3DTilesView.html());
        this.debug3DTilesView.dispose();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.debug3DTilesView.addListenerTo(this.frame3DPlanar.rootWebGL);
        this.panMenuSideBar.add('Debug 3D Tiles', this.debug3DTilesView.html());
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetDocument(configServer, configStyles, pathIcon) {
    const rootDocumentHtml = document.createElement('div');
    const parentHtmlFeature = document.createElement('div');

    // CORE
    this.documentCore = new Widget.Server.Document.Core(
      this.requestService,
      configServer
    );

    // VISUALIZER
    const visualizerView = new Widget.Server.Document.VisualizerView(
      this.frame3DPlanar.getItownsView(),
      this.documentCore.provider
    );

    const visualizeButton = document.createElement('button');
    visualizeButton.innerHTML = 'Visualize';
    visualizeButton.onclick = async () => {
      await visualizerView.startTravelToDisplayedDocument();
      this.frame3DPlanar.appendToUI(visualizerView.html());
    };
    this.documentCore.view.inspectorWindow.html().appendChild(visualizeButton);

    // CONTRIBUTE

    const documentContribute = new Widget.Server.Document.Contribute(
      this.documentCore.provider,
      visualizerView,
      this.requestService,
      this.frame3DPlanar.getItownsView(),
      this.frame3DPlanar.getItownsView().controls,
      configServer,
      this.frame3DPlanar.ui
    );

    const updateButton = document.createElement('button');
    updateButton.innerHTML = 'Update';
    updateButton.onclick = async () => {
      await documentContribute.updateWindow.updateFromDisplayedDocument();
      clearChildren(parentHtmlFeature);
      parentHtmlFeature.appendChild(documentContribute.updateWindow.html());
    };
    this.documentCore.view.inspectorWindow.html().appendChild(updateButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete';
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
    this.documentCore.view.inspectorWindow.html().appendChild(deleteButton);

    const createDocumentButton = document.createElement('button');
    createDocumentButton.innerHTML = 'Create new document';
    createDocumentButton.onclick = () => {
      clearChildren(parentHtmlFeature);
      parentHtmlFeature.appendChild(documentContribute.creationWindow.html());
    };
    this.documentCore.view.navigatorWindow.documentListContainer.appendChild(
      createDocumentButton
    );

    // VALIDATION
    const documentValidation = new Widget.Server.Document.Validation(
      this.documentCore.provider,
      this.requestService,
      configServer,
      this.documentCore.view.inspectorWindow.html()
    );

    this.documentCore.view.navigatorWindow.displayableFiltersContainer.appendChild(
      documentValidation.validationView.html()
    );

    // COMMENT
    const documentComment = new Widget.Server.Document.Comment(
      this.documentCore.provider,
      this.requestService,
      configServer
    );

    const commentButton = document.createElement('button');
    commentButton.innerHTML = 'Comment';
    commentButton.onclick = async () => {
      clearChildren(parentHtmlFeature);
      await documentComment.commentsWindow.getComments();
      parentHtmlFeature.appendChild(documentComment.commentsWindow.html());
    };

    this.documentCore.view.inspectorWindow.html().appendChild(commentButton);

    // LINK MODULE
    if (this.cityObjectModule) {
      const documentLink = new Widget.Server.Document.Link(
        this.documentCore.provider,
        this.cityObjectModule, // module should be manipulated from this scope and not doing dark things inside link module
        this.requestService,
        this.frame3DPlanar.getItownsView(),
        this.frame3DPlanar.getItownsView().controls,
        configServer,
        configStyles
      );

      this.documentCore.view.navigatorWindow.displayableFiltersContainer.appendChild(
        documentLink.view.documentInterface.navigatorHtml()
      );

      this.documentCore.view.inspectorWindow
        .html()
        .appendChild(documentLink.view.documentInterface.inspectorHtml());
    } else {
      console.warn(
        'You should add first a cityObject widget to benefit of the link feature'
      );
    }

    // PLUG WITH SIDEBAR BUTTON
    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (rootDocumentHtml.parentElement) {
        this.panMenuSideBar.remove(rootDocumentHtml);
        this.documentCore.view.navigatorWindow.dispose();
        this.documentCore.view.inspectorWindow.dispose();

        if (!this.cityObjectModule.view.html().parentElement) {
          // city object module is not open remove listener
          this.cityObjectModule.view.removeListener();
        }

        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        // rebuild rootDocument
        clearChildren(rootDocumentHtml);
        clearChildren(parentHtmlFeature);
        rootDocumentHtml.appendChild(
          this.documentCore.view.navigatorWindow.html()
        );
        rootDocumentHtml.appendChild(
          this.documentCore.view.inspectorWindow.html()
        );
        rootDocumentHtml.appendChild(parentHtmlFeature);
        this.panMenuSideBar.add('Document', rootDocumentHtml);
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );

        // so city object can be select by cityobject module
        this.cityObjectModule.view.addListenerTo(this.frame3DPlanar.rootWebGL);
      }
    };
  }

  addWidgetGuidedTour(configServer, pathIcon) {
    if (!this.documentCore) {
      /**
       * @todo should we handle that ? same for link with cityobjectmodule
       */
      console.warn('You should addWidgetDocument first');
      return;
    }

    this.guidedTourController = new Widget.Server.Document.GuidedTourController(
      this.documentCore,
      this.requestService,
      configServer
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.guidedTourController.guidedTour.html().parentElement) {
        this.panMenuSideBar.remove(this.guidedTourController.guidedTour.html());
        this.guidedTourController.guidedTour.dispose();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add(
          'Guided Tour',
          this.guidedTourController.guidedTour.html()
        );
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetCameraPositioner(pathIcon) {
    this.cameraPositioner = new Widget.CameraPositioner(
      this.frame3DPlanar.itownsView
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.cameraPositioner.html().parentElement) {
        this.panMenuSideBar.remove(this.cameraPositioner.html());
        this.cameraPositioner.dispose();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add(
          'Camera Positioner',
          this.cameraPositioner.html()
        );
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetTemporal(configTemporal, pathIcon) {
    this.temporalModule = new Widget.TemporalModule(
      this.frame3DPlanar.getLayerManager().tilesManagers[0],
      configTemporal
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.temporalModule.view.html().parentElement) {
        this.panMenuSideBar.remove(this.temporalModule.view.html());
        this.temporalModule.view.dispose();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add('Temporal', this.temporalModule.view.html());
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetLayerChoice(pathIcon) {
    this.layerChoice = new Widget.LayerChoice(this.frame3DPlanar.layerManager);

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.layerChoice.html().parentElement) {
        this.panMenuSideBar.remove(this.layerChoice.html());
        this.layerChoice.dispose();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add('Layer Choice', this.layerChoice.html());
        sideBarButton.classList.add(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      }
    };
  }

  addWidgetSlideShow(configSlideShow, pathIcon) {
    this.slideShow = new Widget.SlideShow(
      this.frame3DPlanar.itownsView,
      configSlideShow,
      this.extent
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.slideShow.html().parentElement) {
        this.panMenuSideBar.remove(this.slideShow.html());
        this.slideShow.dispose();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add('Slide Show', this.slideShow.html());
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
    if (!this.cityObjectProvider) {
      throw new Error(
        'no city object provider you should add CityObject widget'
      );
      // same as link or guided tour
    }

    this.sparqlQueryWindow = new Widget.Server.SparqlQueryWindow(
      new Widget.Server.SparqlEndpointResponseProvider(configServer),
      this.cityObjectProvider,
      this.frame3DPlanar.getLayerManager(),
      configWidget
    );

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);

    sideBarButton.onclick = () => {
      if (this.sparqlQueryWindow.html().parentElement) {
        this.panMenuSideBar.remove(this.sparqlQueryWindow.html());
        this.sparqlQueryWindow.dispose();
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add('Sparql', this.sparqlQueryWindow.html());
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

    const rootHtml = document.createElement('div');

    // create a single planar process using drag and drop game template
    const singleProcessPlanar = new Game.External.SinglePlanarProcess(
      new Shared.Game.Object3D({
        static: true,
        components: {
          GameScript: {
            idScripts: [
              Shared.Game.ScriptTemplate.DragAndDropAvatar.ID_SCRIPT,
              Shared.Game.ScriptTemplate.NativeCommandManager.ID_SCRIPT,
            ],
            variables: {
              idRenderDataAvatar: idRenderDataAvatar,
              speedRotate: 0.0005,
            },
          },
          ExternalScript: {
            idScripts: [
              Game.External.ScriptTemplate.DragAndDropAvatar.ID_SCRIPT,
              Game.External.ScriptTemplate.CameraManager.ID_SCRIPT,
            ],
          },
        },
      }),
      this.frame3DPlanar,
      assetManager,
      new InputManager(),
      {
        gameScriptClass: [
          Shared.Game.ScriptTemplate.DragAndDropAvatar,
          Shared.Game.ScriptTemplate.NativeCommandManager,
        ],
        externalGameScriptClass: [
          Game.External.ScriptTemplate.DragAndDropAvatar,
          Game.External.ScriptTemplate.CameraManager,
        ],
        gameOrigin: {
          x: this.extent.center().x,
          y: this.extent.center().y,
          z: 0,
        },
      }
    );

    // tell to the drag and drop external script where to add its html
    singleProcessPlanar.externalGameContext.userData.dragAndDropAvatarRootHtml =
      rootHtml;

    singleProcessPlanar.start();

    const sideBarButton = document.createElement('img');
    sideBarButton.src = pathIcon;
    this.menuSideBar.appendChild(sideBarButton);
    sideBarButton.onclick = () => {
      if (rootHtml.parentElement) {
        this.panMenuSideBar.remove(rootHtml);
        sideBarButton.classList.remove(
          '_sidebar_widget_menu_sidebar_img_selected'
        );
      } else {
        this.panMenuSideBar.add('Drag and drop avatar', rootHtml);
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
    const rootHtml = document.createElement('div');

    // create a single planar process using drag and drop game template
    const singleProcessPlanar = new Game.External.SinglePlanarProcess(
      new Shared.Game.Object3D({
        static: true,
        components: {
          GameScript: {
            idScripts: [
              Shared.Game.ScriptTemplate.DragAndDropAvatar.ID_SCRIPT,
              Shared.Game.ScriptTemplate.NativeCommandManager.ID_SCRIPT,
            ],
            variables: {
              idRenderDataAvatar: idRenderDataAvatar,
              speedRotate: 0.0005,
            },
          },
          ExternalScript: {
            idScripts: [
              Game.External.ScriptTemplate.DragAndDropAvatar.ID_SCRIPT,
              Game.External.ScriptTemplate.CameraManager.ID_SCRIPT,
            ],
          },
        },
      }),
      this.frame3DPlanar,
      assetManager,
      new InputManager(),
      {
        gameScriptClass: [
          Shared.Game.ScriptTemplate.DragAndDropAvatar,
          Shared.Game.ScriptTemplate.NativeCommandManager,
        ],
        externalGameScriptClass: [
          Game.External.ScriptTemplate.DragAndDropAvatar,
          Game.External.ScriptTemplate.CameraManager,
        ],
        gameOrigin: {
          x: this.extent.center().x,
          y: this.extent.center().y,
          z: 0,
        },
      }
    );

    // tell to the drag and drop external script where to add its html
    singleProcessPlanar.externalGameContext.userData.dragAndDropAvatarRootHtml =
      rootHtml;

    singleProcessPlanar.start();

    this.addCustomHtml(pathIcon, rootHtml, 'Drag and drop avatar');
  }
}

class PanMenuSideBar {
  constructor() {
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('_sidebar_widget_pan_menu_sidebar');

    this.containers = [];
  }

  add(label, el) {
    const newContainer = document.createElement('div');
    newContainer.innerHTML = label;
    newContainer.classList.add('_sidebar_widget_pan_menu_sidebar_container');
    newContainer.appendChild(el);
    this.containers.push(newContainer);
    this.rootHtml.appendChild(newContainer);
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
    if (!this.rootHtml.firstChild) this.fold(true);
  }

  fold(value) {
    if (value) {
      this.rootHtml.style.transform = 'translate(-100%,0%)';
    } else {
      this.rootHtml.style.transform = 'translate(0%,0%)';
    }
  }

  html() {
    return this.rootHtml;
  }
}
