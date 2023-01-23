import * as Widget from '../Component/Widget/Widget';
const WidgetView = Widget.Component.WidgetView;
import {
  Frame3DPlanar,
  Frame3DPlanarOption,
} from '../Component/Frame3D/Frame3DPlanar';
import './Mockup.css';

import THREEUtil from '../Component/THREEUtil';
const THREE = require('three');

const itowns = require('itowns');
/**
 * @class Represents the base HTML content of a demo for UD-Viz and provides methods to dynamically add widgets.
 */
export class MockUp {
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
    let hasItownsControls = true;
    if (configFrame3DPlanar['hasItownsControls'] != undefined) {
      hasItownsControls = configFrame3DPlanar['hasItownsControls'];
    }

    const frame3DPlanar = new Frame3DPlanar(extent, {
      htmlParent: parentDiv,
      hasItownsControls: hasItownsControls,
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
            <div id="_MockUp_stuct_main_panel">
                <nav>
                    <div class="title-ud-viz Text-Style">
                      UD-VIZ
                    </div>
                    <hr>
                    <ul id="${this.menuId}">
                    </ul>
                </nav>
                <section id="${this.contentSectionId}">
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
   * Appends the demo HTML to an HTML element.D
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
    let type = MockUp.WIDGET_VIEW;
    let requireAuth = false;
    if (options) {
      if (options.type) {
        if (options.type === MockUp.WIDGET_VIEW) {
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
      case MockUp.WIDGET_VIEW:
        // Create a new button in the menu
        this.createMenuButton(widgetId, widgetName, binding);
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
    button.innerHTML = `<p class="_MockUp_menu_hint">${buttonText}</p>`;
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
    return `_MockUp_menu_button${widgetId}`;
  }

  // Get widget button element
  getWidgetButton(widgetId) {
    return document.getElementById(this.getWidgetButtonId(widgetId));
  }

  // //////////////////////////////////////////////////////
  // GETTERS FOR HTML IDS AND ELEMENTS OF THE DEMO PAGE //
  // //////////////////////////////////////////////////////

  get mainDivId() {
    return '_MockUp';
  }

  get headerId() {
    return '_MockUp_header';
  }

  get headerElement() {
    return document.getElementById(this.headerId);
  }

  get viewerDivId() {
    return 'viewerDiv';
  }

  get viewerDivElement() {
    return document.getElementById(this.viewerDivId);
  }

  get menuId() {
    return '_MockUp_menu';
  }

  get menuElement() {
    return document.getElementById(this.menuId);
  }

  get authenticationUserNameId() {
    return '_MockUp_profile_name';
  }

  get authenticationUserNameElement() {
    return document.getElementById(this.authenticationUserNameId);
  }

  get contentSectionId() {
    return 'contentSection';
  }

  get contentSectionElement() {
    return document.getElementById(this.contentSectionId);
  }

  static get WIDGET_VIEW() {
    return 'WIDGET_VIEW';
  }

  static get AUTHENTICATION_WIDGET() {
    return 'AUTHENTICATION_WIDGET';
  }
}
