import { ModuleView } from '../../ModuleView/ModuleView.js';
import { TilesManager } from '../../3DTiles/TilesManager.js';

/**
 * Represents the base HTML content of a demo for UDV and provides methods to
 * dynamically add module views.
 */
export class BaseDemo {
    constructor(config = {}) {
        this.modules = {};
        this.moduleNames = {};
        this.moduleActivation = {};
        this.moduleBindings = {};
        this.requireAuthModules = [];
        this.authService;
        this.config = {};
        this.parentElement;
        this.view;  // itowns view (3d scene)
        this.extent;  // itowns extent (city limits)
        this.controls;
        /**
         * Object used to manage the 3DTiles layer.
         *
         * @type {TilesManager}
         */
        this.tilesManager;
        // Temporal is currently disabled and will be reintroduced in a new
        // version based on a 3D Tiles extension
        this.temporal = false;
        ///// Config values for some file paths
        // iconFolder    : folder for icons (for the modules menu)
        // imageFolder   : folder for the logo files (for LIRIS and IMU)
        // logoIMUFile   : filename for IMU logo
        // logoLIRISFile : filename for LIRIS logo
        config = config || {};
        this.iconFolder = config.iconFolder || 'icon';
        this.imageFolder = config.imageFolder || 'img';
        this.logoIMUFile = config.logoIMUFile || 'logo-imu.png';
        this.logoLIRISFile = config.logoLIRISFile || 'logo-liris.png';
    }

    /**
     * Returns the basic html content of the demo
     */
    get html() {
        return /*html*/`
            <header id="${this.headerId}">
                <div>
                    <h1>UDV &bull;</h1>
                    <div id="${this.authFrameLocationId}"></div>
                </div>
                <div id="_base_demo_struct_header_panel">
                    <img id="logoIMU" src="${this.imageFolder}/${this.logoIMUFile}" />
                    <img id="logoLIRIS" src="${this.imageFolder}/${this.logoLIRISFile}" />
                    <p style="display: inline-block; color: white; margin: 0;">
                        Icons made by <a href="https://www.freepik.com/"
                        title="Freepik">Freepik</a> from
                        <a href="https://www.flaticon.com/"
                        title="Flaticon">www.flaticon.com</a><br> is licensed by
                        <a href="http://creativecommons.org/licenses/by/3.0/"
                        title="Creative Commons BY 3.0" target="_blank">
                        CC 3.0 BY</a>
                    </p>
                </div>
            </header>
            <div id="_base_demo_stuct_main_panel">
                <nav>
                    <ul id="${this.menuId}">
                    </ul>
                </nav>
                <section id="${this.contentSectionId}">
                    <div id="${this.viewerDivId}"></div>
                </section>
            </div>
        `;
    }

    /**
     * Returns the html element representing the upper-left frame of the UI,
     * which contains informations
     * about the logged in user.
     */
    get authenticationFrameHtml() {
        return /*html*/`
            <div id="${this.authenticationMenuLoggedInId}">
                <div id="${this.authenticationUserNameId}"></div>
                <button type="button" id="${this.authenticationLogoutButtonId}"
                class="logInOut">Logout</button>
            </div>
            <div id="${this.authenticationMenuLoggedOutId}">
                <button type="button" id="${this.authenticationLoginButtonId}"
                class="logInOut">Sign in</button>
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
        let div = document.createElement('div');
        div.innerHTML = this.html;
        div.id = this.mainDivId;
        htmlElement.appendChild(div);
    }

    //////// MODULE MANAGEMENT

    /**
     * Adds a new module view to the demo.
     *
     * @param moduleId A unique id. Must be a string without spaces. It
     * will be used to generate some HTML ids in the page. It will also
     * be used to look for an icon to put with the button
     * @param moduleClass The module view class. Must implement some
     * methods (`enable`, `disable` and `addEventListener`). The
     * recommended way of implementing them is to extend the
     * `ModuleView` class, as explained [on the
     * wiki](https://github.com/MEPP-team/UDV/wiki/Generic-demo-and-modules-with-ModuleView-&-BaseDemo).
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
        if ((typeof (moduleClass.enable) !== 'function')
         || (typeof (moduleClass.disable) !== 'function')) {
            throw 'A module must implement at least an enable() and a disable() methods';
        }

        //Default name is the id transformed this way :
        // myModule -> My Module
        // my_module -> My module
        let moduleName = moduleId
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, (str) => str.toUpperCase());
        let type = BaseDemo.MODULE_VIEW;
        let requireAuth = false;
        if (!!options) {
            if (!!options.type) {
                if (options.type === BaseDemo.MODULE_VIEW
                    || options.type === BaseDemo.AUTHENTICATION_MODULE) {
                    type = options.type;
                } else {
                    throw `Invalid value for option 'type' : '${options.type}'`;
                }
            }
            if (!!options.name) {
                moduleName = options.name;
            }
            if (!!options.requireAuth) {
                requireAuth = options.requireAuth;
            }
        }
        const binding = options.binding;

        this.modules[moduleId] = moduleClass;
        this.moduleNames[moduleName] = moduleId;
        this.moduleActivation[moduleId] = false;

        moduleClass.addEventListener(ModuleView.EVENT_ENABLED, () => {
            this.moduleActivation[moduleId] = true;

        });
        moduleClass.addEventListener(ModuleView.EVENT_DISABLED, () => {
            this.moduleActivation[moduleId] = false;
        });

        switch (type) {
            case BaseDemo.MODULE_VIEW:
                //create a new button in the menu
                this.createMenuButton(moduleId, moduleName, binding);
                break;
            case BaseDemo.AUTHENTICATION_MODULE:
                this.createAuthenticationFrame(moduleId);
                break;
            default:
                throw `Unknown module type : ${type}`;
        }

        if (requireAuth) {
            this.requireAuthModules.push(moduleId);
            this.updateAuthentication();
        }

        if (!!binding) {
            this.moduleBindings[binding] = moduleId;
        }
    }

    /**
     * Creates a new button in the side menu.
     * @param moduleId The module id.
     * @param buttonText The text to display in the button.
     * @param {String} [accessKey] The key binding for the module.
     */
    createMenuButton(moduleId, buttonText, accessKey) {
        let button = document.createElement('li');
        button.id = this.getModuleButtonId(moduleId);
        button.innerHTML = `<p class="_base_demo_menu_hint">${buttonText}</p>`;
        if (!!accessKey) {
            button.accessKey = accessKey;
        }
        this.menuElement.appendChild(button);
        let icon = document.createElement('img');

        //creating an icon
        icon.setAttribute('src', `${this.iconFolder}/${moduleId}.svg`)
        icon.className = 'menuIcon';
        button.insertBefore(icon, button.firstChild);

        //define button behavior
        button.onclick = (() => {
            this.toggleModule(moduleId);
        }).bind(this);
        let moduleClass = this.getModuleById(moduleId);

        //dynamically color the button
        moduleClass.parentElement = this.viewerDivElement;
        moduleClass.addEventListener(ModuleView.EVENT_ENABLED, () => {
            button.className = 'choiceMenu choiceMenuSelected';

        });
        moduleClass.addEventListener(ModuleView.EVENT_DISABLED, () => {
            button.className = 'choiceMenu';
        });
        moduleClass.disable();
    }

    /**
     * Creates an authentication frame for the authentication module.
     * @param authModuleId The id of the authentication module.
     */
    createAuthenticationFrame(authModuleId) {
        let frame = document.createElement('div');
        frame.id = this.authenticationFrameId;
        frame.innerHTML = this.authenticationFrameHtml;
        this.authFrameLocationElement.appendChild(frame);
        const authView = this.getModuleById(authModuleId);
        authView.parentElement = this.viewerDivElement;
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
        if (!!this.authService) {
            if (this.authService.isUserLoggedIn()) {
                const user = this.authService.getUser();
                this.authenticationMenuLoggedInElement.hidden = false;
                this.authenticationMenuLoggedOutElement.hidden = true;
                this.authenticationUserNameElement.innerHTML =
                    `Logged in as <em>${user.firstname} ${user.lastname}</em>`;
                for (let mid of this.requireAuthModules) {
                    this.getModuleButton(mid).style.removeProperty('display');
                }
            } else {
                this.authenticationMenuLoggedInElement.hidden = true;
                this.authenticationMenuLoggedOutElement.hidden = false;
                for (let mid of this.requireAuthModules) {
                    this.getModuleButton(mid).style.setProperty('display',
                        'none');
                }
            }
        }
    }

    /**
     * Returns if the module view is currently enabled or not.
     * @param moduleId The module id.
     */
    isModuleActive(moduleId) {
        return this.moduleActivation[moduleId];
    }

    /**
     * Returns the module view class by its id.
     * @param moduleId The module id.
     */
    getModuleById(moduleId) {
        return this.modules[moduleId];
    }

    /**
     * If the module view is enabled, disables it, else, enables it.
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
        return `_base_demo_menu_button${moduleId}`;
    }

    // Get module button element
    getModuleButton(moduleId) {
        return document.getElementById(this.getModuleButtonId(moduleId));
    }

    addLyonWMSLayer() {
        // ********* ADD TERRAIN LAYERS (WMS imagery and WMS elevation)
        // These layer are served by the grandLyon
        // Add a WMS imagery source
         let wmsImagerySource = new itowns.WMSSource({
            extent: this.extent,
            name: 'Ortho2009_vue_ensemble_16cm_CC46',
            url: 'https://download.data.grandlyon.com/wms/grandlyon',
            version: '1.3.0',
            projection: 'EPSG:3946',
            format: 'image/jpeg',
        });
        // Add a WMS imagery layer
        let wmsImageryLayer = new itowns.ColorLayer('wms_imagery', {
            updateStrategy: {
                type: itowns.STRATEGY_DICHOTOMY,
                options: {},
            },
            source: wmsImagerySource,
        });
        this.view.addLayer(wmsImageryLayer);

        // Add a WMS elevation source
        let wmsElevationSource = new itowns.WMSSource({
            extent: this.extent,
            url: 'https://download.data.grandlyon.com/wms/grandlyon',
            name: 'MNT2012_Altitude_10m_CC46',
            projection: 'EPSG:3946',
            heightMapWidth: 256,
            format: 'image/jpeg',
        });
        // Add a WMS elevation layer
        let wmsElevationLayer = new
        itowns.ElevationLayer('wms_elevation', {
            useColorTextureElevation: true,
            colorTextureElevationMinZ: 37,
            colorTextureElevationMaxZ: 240,
            source: wmsElevationSource,
        });
        this.view.addLayer(wmsElevationLayer);
    }

    /**
     * Adds a 3D Tiles layer the iTowns 3D view.
     * @param {string} layer The name of the type of object to add to the view. This name should
     * be one of the properties of the 3DTilesLayer object (in .json config file).
     */
    add3DTilesLayer(layer) {
        //  ADD 3D Tiles Layer
        let $3dTilesLayer = new itowns.GeometryLayer(
            this.config['3DTilesLayer'][layer]['id'], new THREE.Group());
        $3dTilesLayer.name = 'Lyon-2015-'.concat(layer);
        $3dTilesLayer.url =
            this.config['3DTilesLayer'][layer]['url'];
        $3dTilesLayer.protocol = '3d-tiles';
        let material;
        if (layer === 'building') {
            material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        } else if (layer === 'relief') {
            material = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
        } else if (layer === 'water') {
            material = new THREE.MeshLambertMaterial({ color: 0xB0E0E6 });
        }
        $3dTilesLayer.overrideMaterials = material;

        itowns.View.prototype.addLayer.call(this.view, $3dTilesLayer);

        if (layer === 'building') {
            // Initialize the 3DTiles manager
            this.tilesManager = new TilesManager(this.view,
                this.view.getLayerById(this.config['3DTilesLayer']['building']['id']));
        }
    }

    /**
     * Initializes the iTowns 3D view.
     * @param {string} area The name of the area to view. Used to adjust the extent, this name should be
     * one of the properties of the 3DTilesLayer object (in .json config file).
     */
    init3DView(area) {
        // ********* INIT ITOWNS VIEW
        // Define projection used in iTowns viewer (taken from
        // https://epsg.io/3946, Proj4js section)
        itowns.proj4.defs('EPSG:3946', '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
            ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

        // Define geographic extent: CRS, min/max X, min/max Y
        // area should be one of the properties of the object extents in config file
        let min_x = parseInt(this.config['extents'][area]['min_x']);
        let max_x = parseInt(this.config['extents'][area]['max_x']);
        let min_y = parseInt(this.config['extents'][area]['min_y']);
        let max_y = parseInt(this.config['extents'][area]['max_y']);
        this.extent = new itowns.Extent(
            'EPSG:3946',
            min_x, max_x,
            min_y, max_y);
        // `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
        let viewerDiv = document.getElementById('viewerDiv');
        // Instantiate PlanarView (iTowns' view that will hold the layers)
        // The skirt allows to remove the cracks between the terrain tiles
        this.view = new itowns.PlanarView(viewerDiv, this.extent, {
            disableSkirt: false
        });

        // ********* 3D Elements
        // Lights
        let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 0, 20000);
        directionalLight.updateMatrixWorld();
        this.view.scene.add(directionalLight);

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        ambientLight.position.set(0, 0, 3000);
        directionalLight.updateMatrixWorld();
        this.view.scene.add(ambientLight);

        // Camera
        let p = {
            coord: this.extent.center(), heading: -49.6, range: 3000, tilt:
                17
        };
        itowns.CameraUtils.transformCameraToLookAtTarget(this.view, this.view.camera.camera3D, p);

        // Controls
        this.controls = new itowns.PlanarControls(this.view, {});

        // Set sky color to blue
        this.view.mainLoop.gfxEngine.renderer.setClearColor(0x6699cc, 1);
    }
    /*
    * Updates the 3D view by notifying iTowns that it changed (e.g. because a layer has been added).
    */
     update3DView() {
        // Request itowns view redraw
        this.view.notifyChange();
    }

    /**
     * Loads a config file. Module views should only be added after calling
     * this method.
     * @param filePath The path to the config file.
     */
    async loadConfigFile(filePath) {
        //loading configuration file
        // see https://github.com/MEPP-team/VCity/wiki/Configuring-UDV
        return $.ajax({
            type: "GET",
            url: filePath,
            datatype: "json",
            success: (data) => {
                this.config = data;
            },
            error: (e) => {
                throw 'Could not load config file : ' + filePath;
            }
        });
    }

    ////////////////////////////////////////////////////////
    // GETTERS FOR HTML IDS AND ELEMENTS OF THE DEMO PAGE //
    ////////////////////////////////////////////////////////

    get mainDivId() {
        return '_base_demo';
    }

    get headerId() {
        return '_base_demo_header';
    }

    get headerElement() {
        return document.getElementById(this.headerId);
    }

    get authFrameLocationId() {
        return '_base_demo_auth_frame_location';
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
        return '_base_demo_menu';
    }

    get menuElement() {
        return document.getElementById(this.menuId);
    }

    get authenticationFrameId() {
        return '_base_demo_profile';
    }

    get authenticationFrameElement() {
        return document.getElementById(this.authenticationFrameId);
    }

    get authenticationLogoutButtonId() {
        return '_base_demo_button_logout';
    }

    get authenticationLogoutButtonElement() {
        return document.getElementById(this.authenticationLogoutButtonId);
    }

    get authenticationLoginButtonId() {
        return '_base_demo_button_login';
    }

    get authenticationLoginButtonElement() {
        return document.getElementById(this.authenticationLoginButtonId);
    }

    get authenticationMenuLoggedInId() {
        return '_base_demo_profile_menu_logged_in';
    }

    get authenticationMenuLoggedInElement() {
        return document.getElementById(this.authenticationMenuLoggedInId);
    }

    get authenticationMenuLoggedOutId() {
        return '_base_demo_profile_menu_logged_out';
    }

    get authenticationMenuLoggedOutElement() {
        return document.getElementById(this.authenticationMenuLoggedOutId);
    }

    get authenticationUserNameId() {
        return '_base_demo_profile_name';
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
