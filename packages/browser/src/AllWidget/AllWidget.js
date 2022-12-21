import * as Widget from '../Component/Itowns/Widget/Widget';
const WidgetView = Widget.Component.WidgetView;
import { Planar } from '../Component/Frame3D/Planar';
import FileUtil from '../Component/FileUtil';
const itowns = require('itowns');
const proj4 = require('proj4');

import './AllWidget.css';

/**
 * Represents the base HTML content of a demo for UD-Viz and provides methods to
 * dynamically add widgets.
 */
export class AllWidget {
  constructor() {
    this.modules = {};
    this.moduleNames = {};
    this.moduleActivation = {};
    this.moduleBindings = {};
    this.requireAuthModules = [];
    this.authService = null;
    this.config = null;
    this.parentElement = null;

    /** @type {Planar} */
    this.frame3DPlanar = null;
  }

  /**
   * Wrapper getter
   * @returns {Planar}
   */
  getFrame3DPlanar() {
    return this.frame3DPlanar;
  }

  /**
   *
   * @param {object} configPath - config should be describe here
   * @returns
   */
  start(configPath) {
    return new Promise((resolve) => {
      this.appendTo(document.body);

      FileUtil.loadJSON(configPath).then((config) => {
        // ref config for user
        this.config = config;
        // if a field of the config is required at runtime it should be in state of the object ?
        console.warn('config should not be ref');

        this.addLogos();

        // initialize frame3DPlanar from config
        const parentDiv = document.getElementById(this.contentSectionId);

        // http://proj4js.org/
        // define a projection as a string and reference it that way
        proj4.default.defs(
          config['crs'],
          '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
            ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
        );

        const extent = new itowns.Extent(
          config['crs'],
          parseInt(config['extents']['min_x']),
          parseInt(config['extents']['max_x']),
          parseInt(config['extents']['min_y']),
          parseInt(config['extents']['max_y'])
        );

        const coordinates = extent.center();

        console.log('config coordinates bad');
        let heading = -50;
        let range = 3000;
        let tilt = 10;

        // Assign default value or config value
        if (config && config['camera'] && config['camera']['position']) {
          if (config['camera']['position']['heading'])
            heading = config['camera']['position']['heading'];

          if (config['camera']['position']['range'])
            range = config['camera']['position']['range'];

          if (config['camera']['position']['tilt'])
            tilt = config['camera']['position']['tilt'];

          if (config['camera']['position']['x'])
            coordinates.x = config['camera']['position']['x'];

          if (config['camera']['position']['y'])
            coordinates.y = config['camera']['position']['y'];
        }

        this.frame3DPlanar = new Planar(extent, {
          htmlParent: parentDiv,
          hasItownsControls: true,
          coordinates: coordinates,
          maxSubdivisionLevel: config['maxSubdivisionLevel'],
          heading: heading,
          tilt: tilt,
          range: range,
          config3DTilesLayer: config['3DTilesLayers'],
          configBaseMapLayer: config['base_map_layers'][0], // intialiaze with the first one
          configElevationLayer: config['elevation_layer'],
          configGeoJSONLayers: config['GeoJSONLayers'],
        });

        resolve(config);
      });
    });
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
    const logos = this.config.assets.logos;

    // Path to the logos folder
    const imageFolder = this.config.assets.imageFolder;

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

  // ////// MODULE MANAGEMENT

  /**
   * Adds a new module view to the demo.
   *
   * @param moduleId A unique id. Must be a string without spaces. It
   * will be used to generate some HTML ids in the page. It will also
   * be used to look for an icon to put with the button
   * @param moduleClass The module view class. Must implement some
   * methods (`enable`, `disable` and `addEventListener`). The
   * recommended way of implementing them is to extend the
   * `WidgetView` class, as explained [on the
   * wiki](https://github.com/MEPP-team/UD-Viz/wiki/Generic-demo-and-modules-with-WidgetView-&-BaseDemo).
   * @param options An object used to specify various options.
   * `options.name` allows you to specify the name that will be
   * displayed in the toggle button. By default, it makes a
   * transformation of the id (like this : myModule -> My Module).
   * `options.type` is the "type" of the module view that defines how
   * it is added to the demo. The default value is `MODULE_VIEW`,
   * which simply adds a toggle button to the side menu. If set to
   * `AUTHENTICATION_MODULE`, an authentication frame will be created
   * in the upper left corner of the page to contain informations
   * about the user. `options.requireAuth` allows you to
   * specify if this module can be shown without authentication (ie.
   * if no user is logged in). The default value is `false`. If set to
   * `true`, and no athentication module was loaded, it has no effect
   * (the module view will be shown). `options.binding` is the shortcut
   * key code to toggle the module. By default, no shortcut is created.
   */
  addModuleView(moduleId, moduleClass, options = {}) {
    if (
      typeof moduleClass.enable !== 'function' ||
      typeof moduleClass.disable !== 'function'
    ) {
      throw 'A module must implement at least an enable() and a disable() methods';
    }

    // Default name is the id transformed this way :
    // myModule -> My Module
    // my_module -> My module
    let moduleName = moduleId
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, (str) => str.toUpperCase());
    let type = AllWidget.MODULE_VIEW;
    let requireAuth = false;
    if (options) {
      if (options.type) {
        if (
          options.type === AllWidget.MODULE_VIEW ||
          options.type === AllWidget.AUTHENTICATION_MODULE
        ) {
          type = options.type;
        } else {
          throw `Invalid value for option 'type' : '${options.type}'`;
        }
      }
      if (options.name) {
        moduleName = options.name;
      }
      if (options.requireAuth) {
        requireAuth = options.requireAuth;
      }
    }
    const binding = options.binding;

    this.modules[moduleId] = moduleClass;
    this.moduleNames[moduleName] = moduleId;
    this.moduleActivation[moduleId] = false;

    moduleClass.addEventListener(WidgetView.EVENT_ENABLED, () => {
      this.moduleActivation[moduleId] = true;
    });
    moduleClass.addEventListener(WidgetView.EVENT_DISABLED, () => {
      this.moduleActivation[moduleId] = false;
    });

    switch (type) {
      case AllWidget.MODULE_VIEW:
        // Create a new button in the menu
        this.createMenuButton(moduleId, moduleName, binding);
        break;
      case AllWidget.AUTHENTICATION_MODULE:
        this.createAuthenticationFrame(moduleId);
        break;
      default:
        throw `Unknown module type : ${type}`;
    }

    if (requireAuth) {
      this.requireAuthModules.push(moduleId);
      this.updateAuthentication();
    }

    if (binding) {
      this.moduleBindings[binding] = moduleId;
    }
  }

  /**
   * Creates a new button in the side menu.
   *
   * @param moduleId The module id.
   * @param buttonText The text to display in the button.
   * @param {string} [accessKey] The key binding for the module.
   */
  createMenuButton(moduleId, buttonText, accessKey) {
    const button = document.createElement('li');
    button.id = this.getModuleButtonId(moduleId);
    button.innerHTML = `<p class="_all_widget_menu_hint">${buttonText}</p>`;
    if (accessKey) {
      button.accessKey = accessKey;
    }
    this.menuElement.appendChild(button);
    const icon = document.createElement('img');

    // Creating an icon
    icon.setAttribute(
      'src',
      `${this.config.assets.iconFolder}/${moduleId}.svg`
    );
    icon.className = 'menuIcon';
    button.insertBefore(icon, button.firstChild);

    // Define button behavior
    button.onclick = (() => {
      this.toggleModule(moduleId);
    }).bind(this);
    const moduleClass = this.getModuleById(moduleId);

    // Dynamically color the button
    moduleClass.parentElement = this.viewerDivElement.parentElement;
    moduleClass.addEventListener(WidgetView.EVENT_ENABLED, () => {
      button.className = 'choiceMenu choiceMenuSelected';
    });
    moduleClass.addEventListener(WidgetView.EVENT_DISABLED, () => {
      button.className = 'choiceMenu';
    });
    moduleClass.disable();
  }

  /**
   * Creates an authentication frame for the authentication module.
   *
   * @param authModuleId The id of the authentication module.
   */
  createAuthenticationFrame(authModuleId) {
    const frame = document.createElement('div');
    frame.id = this.authenticationFrameId;
    frame.innerHTML = this.authenticationFrameHtml;
    document.getElementById('_all_widget_stuct_main_panel').append(frame);
    const authView = this.getModuleById(authModuleId);
    authView.parentElement = this.viewerDivElement.parentElement;
    const authService = authView.authenticationService;
    this.authenticationLoginButtonElement.onclick = () => {
      if (this.isModuleActive(authModuleId)) {
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
   *  (ie. a user log in / out), or when a module is added. It has two
   *  purposes :
   *  1. To update the upper-left square of the side menu (which contains
   *     use informations)
   *  2. To show / hide the modules that require authentication (as defined
   *     by the `options` parameter in the method `addModuleView`
   */
  updateAuthentication() {
    if (this.authService) {
      if (this.authService.isUserLoggedIn()) {
        const user = this.authService.getUser();
        this.authenticationMenuLoggedInElement.hidden = false;
        this.authenticationMenuLoggedOutElement.hidden = true;
        this.authenticationUserNameElement.innerHTML = `Logged in as <em>${user.firstname} ${user.lastname}</em>`;
        for (const mid of this.requireAuthModules) {
          this.getModuleButton(mid).style.removeProperty('display');
        }
      } else {
        this.authenticationMenuLoggedInElement.hidden = true;
        this.authenticationMenuLoggedOutElement.hidden = false;
        for (const mid of this.requireAuthModules) {
          this.getModuleButton(mid).style.setProperty('display', 'none');
        }
      }
    }
  }

  /**
   * Returns if the module view is currently enabled or not.
   *
   * @param moduleId The module id.
   */
  isModuleActive(moduleId) {
    return this.moduleActivation[moduleId];
  }

  /**
   * Returns the module view class by its id.
   *
   * @param moduleId The module id.
   */
  getModuleById(moduleId) {
    return this.modules[moduleId];
  }

  /**
   * If the module view is enabled, disables it, else, enables it.
   *
   * @param moduleId The module id.
   */
  toggleModule(moduleId) {
    if (!this.isModuleActive(moduleId)) {
      this.getModuleById(moduleId).enable();
    } else {
      this.getModuleById(moduleId).disable();
    }
  }

  getModuleButtonId(moduleId) {
    return `_all_widget_menu_button${moduleId}`;
  }

  // Get module button element
  getModuleButton(moduleId) {
    return document.getElementById(this.getModuleButtonId(moduleId));
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

  static get MODULE_VIEW() {
    return 'MODULE_VIEW';
  }

  static get AUTHENTICATION_MODULE() {
    return 'AUTHENTICATION_MODULE';
  }
}
