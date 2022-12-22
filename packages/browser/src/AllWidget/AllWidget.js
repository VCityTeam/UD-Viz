import * as Widget from '../Component/Itowns/Widget/Widget';
const WidgetView = Widget.Component.WidgetView;
import { Planar } from '../Component/Frame3D/Planar';
import THREEUtil from '../Component/THREEUtil';
const itowns = require('itowns');
const proj4 = require('proj4');
const THREE = require('three');

import './AllWidget.css';

/**
 * Represents the base HTML content of a demo for UD-Viz and provides methods to
 * dynamically add widgets.
 */
export class AllWidget {
  /**
   *
   * @param {object} config - TODO describe
   */
  constructor(config) {
    this.config = config; // recommended to not ref the config but to create state in this for what need to be store

    // allwidget state
    this.widgets = {};
    this.widgetNames = {};
    this.widgetActivation = {};
    this.widgetBindings = {};
    this.requireAuthWidgets = [];
    this.authService = null;
    this.parentElement = null;

    /** @type {Planar} */
    this.frame3DPlanar = null;

    // init DOM
    this.appendTo(document.body);
    this.addLogos();
  }

  initFrame3DPlanarFromConfig(frame3DPlanarConfig) {
    // initialize frame3DPlanar from config
    const parentDiv = document.getElementById(this.contentSectionId);

    // http://proj4js.org/
    // define a projection as a string and reference it that way
    proj4.default.defs(
      frame3DPlanarConfig.extent.crs,
      '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
        ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );

    const extent = new itowns.Extent(
      frame3DPlanarConfig.extent.crs,
      parseInt(frame3DPlanarConfig.extent.west),
      parseInt(frame3DPlanarConfig.extent.east),
      parseInt(frame3DPlanarConfig.extent.south),
      parseInt(frame3DPlanarConfig.extent.north)
    );

    this.frame3DPlanar = new Planar(extent, {
      htmlParent: parentDiv,
      hasItownsControls: true,
      coordinates: frame3DPlanarConfig['coordinates'],
      maxSubdivisionLevel: frame3DPlanarConfig['maxSubdivisionLevel'],
      heading: frame3DPlanarConfig['heading'],
      tilt: frame3DPlanarConfig['tilt'],
      range: frame3DPlanarConfig['range'],
      config3DTilesLayers: frame3DPlanarConfig['3D_tiles_layers'],
      configBaseMapLayer: frame3DPlanarConfig['base_map_layer'],
      configElevationLayer: frame3DPlanarConfig['elevation_layer'],
      configGeoJSONLayers: frame3DPlanarConfig['geoJSON_layers'],
    });

    THREEUtil.addLights(this.frame3DPlanar.getScene());
    THREEUtil.initRenderer(
      this.frame3DPlanar.getRenderer(),
      new THREE.Color(0x6699cc)
    );

    // requester compute near far
    this.frame3DPlanar
      .getItownsView()
      .addFrameRequester(itowns.MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE, () => {
        // z is HARDCODED https://github.com/VCityTeam/UD-Viz/issues/469
        const min = new THREE.Vector3(extent.west, extent.south, 0);
        const max = new THREE.Vector3(extent.east, extent.north, 500);

        THREEUtil.computeNearFarCamera(
          this.frame3DPlanar.getCamera(),
          min,
          max
        );
      });
  }

  /**
   *
   * @returns {Planar}
   */
  getFrame3DPlanar() {
    return this.frame3DPlanar;
  }

  /**
   * Returns the basic html content of the demo
   */
  get html() {
    return /* html*/ `       
            <div id="_all_widget_stuct_main_panel">
                <nav>
                    <div class="title-ud-viz Text-Style">
                      UD-VIZ
                    </div>
                    <hr>
                    <ul id="${this.menuId}">
                    </ul>
                </nav>
                <section id="${this.contentSectionId}">
                  <div id="_window_widget_content"></div>
                </section>
            </div>
        `;
  }

  addLogos() {
    // Path file for all the logo images
    const logos = this.config.logos;

    // Path to the logos folder
    const imageFolder = this.config.imageFolder;

    // Create div to integrate all logos images
    const logoDiv = document.createElement('div');
    logoDiv.id = 'logo-div';
    document.getElementById(this.mainDivId).append(logoDiv);

    for (let i = 0; i < logos.length; i++) {
      const img = document.createElement('img');
      img.src = imageFolder.concat('/'.concat(logos[i]));
      img.classList.add('logos');
      logoDiv.appendChild(img);
    }
  }

  /**
   * Returns the html element representing the upper-left frame of the UI,
   * which contains informations
   * about the logged in user.
   */
  get authenticationFrameHtml() {
    return /* html*/ `
            <div id="${this.authenticationMenuLoggedInId}">
                <div id="${this.authenticationUserNameId}"></div>
                <button type="button" id="${this.authenticationLogoutButtonId}"
                class="logInOut">Logout</button>
            </div>
            <div id="${this.authenticationMenuLoggedOutId}">
                <button type="button" id="${this.authenticationLoginButtonId}"
                class="logInOut"><img src="${this.config.icon_authenfication_path}"></button>
            </div>
        `;
  }

  /**
   * Appends the demo HTML to an HTML element.
   *
   * @param htmlElement The parent node to add the demo into. The
   * recommended way of implementing the demo is simply to have an
   * empty body and call this method with `document.body` as
   * parameter.
   */
  appendTo(htmlElement) {
    this.parentElement = htmlElement;
    const div = document.createElement('div');
    div.innerHTML = this.html;
    div.id = this.mainDivId;
    htmlElement.appendChild(div);
  }

  // ////// WIDGET MANAGEMENT

  /**
   * Adds a new widget view to the demo.
   *
   * @param widgetId A unique id. Must be a string without spaces. It
   * will be used to generate some HTML ids in the page. It will also
   * be used to look for an icon to put with the button
   * @param widgetClass The widget view class. Must implement some
   * methods (`enable`, `disable` and `addEventListener`). The
   * recommended way of implementing them is to extend the
   * `WidgetView` class, as explained [on the
   * wiki](https://github.com/MEPP-team/UD-Viz/wiki/Generic-demo-and-widgets-with-WidgetView-&-BaseDemo).
   * @param options An object used to specify various options.
   * `options.name` allows you to specify the name that will be
   * displayed in the toggle button. By default, it makes a
   * transformation of the id (like this : myWidget -> My Widget).
   * `options.type` is the "type" of the widget view that defines how
   * it is added to the demo. The default value is `WIDGET_VIEW`,
   * which simply adds a toggle button to the side menu. If set to
   * `AUTHENTICATION_WIDGET`, an authentication frame will be created
   * in the upper left corner of the page to contain informations
   * about the user. `options.requireAuth` allows you to
   * specify if this widget can be shown without authentication (ie.
   * if no user is logged in). The default value is `false`. If set to
   * `true`, and no athentication widget was loaded, it has no effect
   * (the widget view will be shown). `options.binding` is the shortcut
   * key code to toggle the widget. By default, no shortcut is created.
   */
  addWidgetView(widgetId, widgetClass, options = {}) {
    if (
      typeof widgetClass.enable !== 'function' ||
      typeof widgetClass.disable !== 'function'
    ) {
      throw 'A widget must implement at least an enable() and a disable() methods';
    }

    // Default name is the id transformed this way :
    // myWidget -> My Widget
    // my_widget -> My widget
    let widgetName = widgetId
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, (str) => str.toUpperCase());
    let type = AllWidget.WIDGET_VIEW;
    let requireAuth = false;
    if (options) {
      if (options.type) {
        if (
          options.type === AllWidget.WIDGET_VIEW ||
          options.type === AllWidget.AUTHENTICATION_WIDGET
        ) {
          type = options.type;
        } else {
          throw `Invalid value for option 'type' : '${options.type}'`;
        }
      }
      if (options.name) {
        widgetName = options.name;
      }
      if (options.requireAuth) {
        requireAuth = options.requireAuth;
      }
    }
    const binding = options.binding;

    this.widgets[widgetId] = widgetClass;
    this.widgetNames[widgetName] = widgetId;
    this.widgetActivation[widgetId] = false;

    widgetClass.addEventListener(WidgetView.EVENT_ENABLED, () => {
      this.widgetActivation[widgetId] = true;
    });
    widgetClass.addEventListener(WidgetView.EVENT_DISABLED, () => {
      this.widgetActivation[widgetId] = false;
    });

    switch (type) {
      case AllWidget.WIDGET_VIEW:
        // Create a new button in the menu
        this.createMenuButton(widgetId, widgetName, binding);
        break;
      case AllWidget.AUTHENTICATION_WIDGET:
        this.createAuthenticationFrame(widgetId);
        break;
      default:
        throw `Unknown widget type : ${type}`;
    }

    if (requireAuth) {
      this.requireAuthWidgets.push(widgetId);
      this.updateAuthentication();
    }

    if (binding) {
      this.widgetBindings[binding] = widgetId;
    }
  }

  /**
   * Creates a new button in the side menu.
   *
   * @param widgetId The widget id.
   * @param buttonText The text to display in the button.
   * @param {string} [accessKey] The key binding for the widget.
   */
  createMenuButton(widgetId, buttonText, accessKey) {
    const button = document.createElement('li');
    button.id = this.getWidgetButtonId(widgetId);
    button.innerHTML = `<p class="_all_widget_menu_hint">${buttonText}</p>`;
    if (accessKey) {
      button.accessKey = accessKey;
    }
    this.menuElement.appendChild(button);
    const icon = document.createElement('img');

    // Creating an icon
    icon.setAttribute('src', `${this.config.iconFolder}/${widgetId}.svg`);
    icon.className = 'menuIcon';
    button.insertBefore(icon, button.firstChild);

    // Define button behavior
    button.onclick = (() => {
      this.toggleWidget(widgetId);
    }).bind(this);
    const widgetClass = this.getWidgetById(widgetId);

    // Dynamically color the button
    widgetClass.parentElement = this.viewerDivElement.parentElement;
    widgetClass.addEventListener(WidgetView.EVENT_ENABLED, () => {
      button.className = 'choiceMenu choiceMenuSelected';
    });
    widgetClass.addEventListener(WidgetView.EVENT_DISABLED, () => {
      button.className = 'choiceMenu';
    });
    widgetClass.disable();
  }

  /**
   * Creates an authentication frame for the authentication widget.
   *
   * @param authWidgetId The id of the authentication widget.
   */
  createAuthenticationFrame(authWidgetId) {
    const frame = document.createElement('div');
    frame.id = this.authenticationFrameId;
    frame.innerHTML = this.authenticationFrameHtml;
    document.getElementById('_all_widget_stuct_main_panel').append(frame);
    const authView = this.getWidgetById(authWidgetId);
    authView.parentElement = this.viewerDivElement.parentElement;
    const authService = authView.authenticationService;
    this.authenticationLoginButtonElement.onclick = () => {
      if (this.isWidgetActive(authWidgetId)) {
        authView.disable();
      } else {
        authView.enable();
      }
    };
    this.authenticationLogoutButtonElement.onclick = () => {
      try {
        authService.logout();
      } catch (e) {
        console.error(e);
      }
    };

    authService.addObserver(this.updateAuthentication.bind(this));
    this.authService = authService;
    this.updateAuthentication();
  }

  /**
   * This method should be called when the authentication state changes
   *  (ie. a user log in / out), or when a widget is added. It has two
   *  purposes :
   *  1. To update the upper-left square of the side menu (which contains
   *     use informations)
   *  2. To show / hide the widgets that require authentication (as defined
   *     by the `options` parameter in the method `addWidgetView`
   */
  updateAuthentication() {
    if (this.authService) {
      if (this.authService.isUserLoggedIn()) {
        const user = this.authService.getUser();
        this.authenticationMenuLoggedInElement.hidden = false;
        this.authenticationMenuLoggedOutElement.hidden = true;
        this.authenticationUserNameElement.innerHTML = `Logged in as <em>${user.firstname} ${user.lastname}</em>`;
        for (const mid of this.requireAuthWidgets) {
          this.getWidgetButton(mid).style.removeProperty('display');
        }
      } else {
        this.authenticationMenuLoggedInElement.hidden = true;
        this.authenticationMenuLoggedOutElement.hidden = false;
        for (const mid of this.requireAuthWidgets) {
          this.getWidgetButton(mid).style.setProperty('display', 'none');
        }
      }
    }
  }

  /**
   * Returns if the widget view is currently enabled or not.
   *
   * @param widgetId The widget id.
   */
  isWidgetActive(widgetId) {
    return this.widgetActivation[widgetId];
  }

  /**
   * Returns the widget view class by its id.
   *
   * @param widgetId The widget id.
   */
  getWidgetById(widgetId) {
    return this.widgets[widgetId];
  }

  /**
   * If the widget view is enabled, disables it, else, enables it.
   *
   * @param widgetId The widget id.
   */
  toggleWidget(widgetId) {
    if (!this.isWidgetActive(widgetId)) {
      this.getWidgetById(widgetId).enable();
    } else {
      this.getWidgetById(widgetId).disable();
    }
  }

  getWidgetButtonId(widgetId) {
    return `_all_widget_menu_button${widgetId}`;
  }

  // Get widget button element
  getWidgetButton(widgetId) {
    return document.getElementById(this.getWidgetButtonId(widgetId));
  }

  // //////////////////////////////////////////////////////
  // GETTERS FOR HTML IDS AND ELEMENTS OF THE DEMO PAGE //
  // //////////////////////////////////////////////////////

  get mainDivId() {
    return '_all_widget';
  }

  get headerId() {
    return '_all_widget_header';
  }

  get headerElement() {
    return document.getElementById(this.headerId);
  }

  get authFrameLocationId() {
    return '_all_widget_auth_frame_location';
  }

  get authFrameLocationElement() {
    return document.getElementById(this.authFrameLocationId);
  }

  get contentSectionId() {
    return 'contentSection';
  }

  get contentSectionElement() {
    return document.getElementById(this.contentSectionId);
  }

  get viewerDivId() {
    return 'viewerDiv';
  }

  get viewerDivElement() {
    return document.getElementById(this.viewerDivId);
  }

  get menuId() {
    return '_all_widget_menu';
  }

  get menuElement() {
    return document.getElementById(this.menuId);
  }

  get authenticationFrameId() {
    return '_all_widget_profile';
  }

  get authenticationFrameElement() {
    return document.getElementById(this.authenticationFrameId);
  }

  get authenticationLogoutButtonId() {
    return '_all_widget_button_logout';
  }

  get authenticationLogoutButtonElement() {
    return document.getElementById(this.authenticationLogoutButtonId);
  }

  get authenticationLoginButtonId() {
    return '_all_widget_button_login';
  }

  get authenticationLoginButtonElement() {
    return document.getElementById(this.authenticationLoginButtonId);
  }

  get authenticationMenuLoggedInId() {
    return '_all_widget_profile_menu_logged_in';
  }

  get authenticationMenuLoggedInElement() {
    return document.getElementById(this.authenticationMenuLoggedInId);
  }

  get authenticationMenuLoggedOutId() {
    return '_all_widget_profile_menu_logged_out';
  }

  get authenticationMenuLoggedOutElement() {
    return document.getElementById(this.authenticationMenuLoggedOutId);
  }

  get authenticationUserNameId() {
    return '_all_widget_profile_name';
  }

  get authenticationUserNameElement() {
    return document.getElementById(this.authenticationUserNameId);
  }

  static get WIDGET_VIEW() {
    return 'WIDGET_VIEW';
  }

  static get AUTHENTICATION_WIDGET() {
    return 'AUTHENTICATION_WIDGET';
  }
}
