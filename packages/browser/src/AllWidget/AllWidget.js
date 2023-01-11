import * as Widget from '../Component/Widget/Widget';
const WidgetView = Widget.Component.WidgetView;
import {
  Frame3DPlanar,
  Frame3DPlanarOption,
} from '../Component/Frame3D/Frame3DPlanar';
import './AllWidget.css';

import THREEUtil from '../Component/THREEUtil';
const THREE = require('three');

const itowns = require('itowns');
/**
 * @class Represents the base HTML content of a demo for UD-Viz and provides methods to dynamically add widgets.
 */
export class AllWidget {
  /**
   *
   * @param {itowns.Extent} extent - Geographical bounding rectangle. {@link http://www.itowns-project.org/itowns/docs/#api/Geographic/Extent Extent}
   * @param {object} configAllWidget - Contains differents paths
   * @param {string} configAllWidget.iconFolder - Path of the icons' folder
   * @param {string} configAllWidget.logosFolder - Path of the logos' folder
   * @param {string[]} configAllWidget.logos - Array of paths of logos' file
   * @param {string} configAllWidget.icon_autenfication_path - Path of authentification's icon file
   * @param {Frame3DPlanarOption} configFrame3DPlanar - Config to create instance of {@link Frame3DPlanar}
   */
  constructor(extent, configAllWidget, configFrame3DPlanar) {
    this.configAllWidget = configAllWidget; // recommended to not ref the configAllWidget but to create state in this for what need to be store

    // allwidget state
    this.widgets = {};
    this.widgetNames = {};
    this.widgetActivation = {};
    this.widgetBindings = {};
    this.requireAuthWidgets = [];
    this.authService = null;
    this.parentElement = null;

    // init DOM
    this.appendTo(document.body);
    this.addLogos();

    /** @type {Frame3DPlanar} */
    this.frame3DPlanar = this.createFrame3DPlanarFromConfig(
      extent,
      document.getElementById(this.contentSectionId),
      configFrame3DPlanar
    );
  }

  /**
   * It creates a 3D planar frame from a configuration object
   *
   * @param {itowns.Extent} extent - Geographical bounding rectangle. {@link http://www.itowns-project.org/itowns/docs/#api/Geographic/Extent Extent}
   * @param {HTMLDivElement} parentDiv - the HTML element in which the 3D frame will be created.
   * @param {Frame3DPlanarOption} configFrame3DPlanar - the configuration object for the frame3DPlanar
   * @returns {Frame3DPlanar} A new Frame3DPlanar object.
   */
  createFrame3DPlanarFromConfig(extent, parentDiv, configFrame3DPlanar) {
    const frame3DPlanar = new Frame3DPlanar(extent, {
      htmlParent: parentDiv,
      hasItownsControls: true,
      coordinates: configFrame3DPlanar['coordinates'],
      maxSubdivisionLevel: configFrame3DPlanar['maxSubdivisionLevel'],
      heading: configFrame3DPlanar['heading'],
      tilt: configFrame3DPlanar['tilt'],
      range: configFrame3DPlanar['range'],
    });

    THREEUtil.addLights(frame3DPlanar.getScene());
    THREEUtil.initRenderer(
      frame3DPlanar.getRenderer(),
      new THREE.Color(0x6699cc)
    );

    return frame3DPlanar;
  }

  /**
   *
   * @returns {Frame3DPlanar} return `this.frame3DPlanar`
   */
  getFrame3DPlanar() {
    return this.frame3DPlanar;
  }

  /**
   * @returns {string} Returns the basic html content of the demo
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

  /**
   * It creates a div element, adds an id to it, appends it to the main div, and then adds all the logos to it
   */
  addLogos() {
    // Path file for all the logo images
    const logos = this.configAllWidget.logos;

    // Path to the logos folder
    const imageFolder = this.configAllWidget.imageFolder;

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
   
   * @returns {string} Returns the html element representing the upper-left frame of the UI,
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
                class="logInOut"><img src="${this.configAllWidget['icon_autenfication_path']}"></button>
            </div>
        `;
  }

  /**
   * Appends the demo HTML to an HTML element.
   *
   * @param {HTMLDivElement} htmlElement The parent node to add the demo into. The
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
   * @param {number} widgetId A unique id. Must be a string without spaces. It
   * will be used to generate some HTML ids in the page. It will also
   * be used to look for an icon to put with the button
   * @param {object} widgetClass The widget view class. Must implement some
   * methods (`enable`, `disable` and `addEventListener`). The
   * recommended way of implementing them is to extend the
   * `WidgetView` class, as explained [on the
   * wiki](https://github.com/MEPP-team/UD-Viz/wiki/Generic-demo-and-widgets-with-WidgetView-&-BaseDemo).
   * @param {object} options - An object used to specify various options.
   * @param {string} options.name - Allows you to specify the name that will be
   * displayed in the toggle button. By default, it makes a
   * transformation of the id (like this : myWidget -> My Widget).
   * @param {string} options.type - Is the "type" of the widget view that defines how
   * it is added to the demo. The default value is `WIDGET_VIEW`,
   * which simply adds a toggle button to the side menu. If set to
   * `AUTHENTICATION_WIDGET`, an authentication frame will be created
   * in the upper left corner of the page to contain informations
   * about the user.
   * @param {boolean} options.requireAuth - Allows you to
   * specify if this widget can be shown without authentication (ie.
   * if no user is logged in). The default value is `false`. If set to
   * `true`, and no athentication widget was loaded, it has no effect
   * (the widget view will be shown).
   * @param {string} [options.binding] is the shortcut key code to toggle the widget. .
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
   * @param {number} widgetId The widget id.
   * @param {string} buttonText The text to display in the button.
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
    icon.setAttribute(
      'src',
      `${this.configAllWidget.iconFolder}/${widgetId}.svg`
    );
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
   * @param {string} authWidgetId The id of the authentication widget.
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
   * If the widgetActivation object has a property with the name of the widgetId, then return true,
   * otherwise return false.
   *
   * @param {string} widgetId - The id of the widget to check.
   * @returns {boolean} A boolean value.
   */
  isWidgetActive(widgetId) {
    return this.widgetActivation[widgetId];
  }

  /**
   * Given a widget ID, return the widget object.
   *
   * @param {string} widgetId - The id of the widget to get.
   * @returns {object} The widget with the given id.
   */
  getWidgetById(widgetId) {
    return this.widgets[widgetId];
  }

  /**
   * If the widget view is enabled, disables it, else, enables it.
   *
   * @param {string} widgetId The widget id.
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
