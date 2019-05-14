export class BaseDemo {
    constructor() {
        this.modules = {};
        this.moduleNames = {};
        this.moduleActivation = {};
        this.config = {};
        this.parentElement;
        this.view;  // itowns view (3d scene)
        this.extent;  // itowns extent (city limits)
        this.renderer;
        this.controls;
        this.temporal;
        this.iconFolder = 'Icons';
    }

    get html() {
        return /*html*/`
            <input type="checkbox" id="activateTemporal" class="nonVisible">
            <header>
                <div class="header">
                    <div>
                        Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
                    </div>
                    <img id="logoIMU" src="../data/img/logo-imu.png" />
                    <img id="logoLIRIS" src="../data/img/logo-liris.png" />
                </div>
                <input type="checkbox" id="openSidebar">
                <!-- The HTML code corresponds to an hamburger menu icon -->
                <label id="closeHamburger" for="openSidebar">&#x2630</label>
                <div id="${this.menuId}">
                    <div id="navMenu"></div>
                    <!-- This one corresponds to a cross icon -->
                    <label id="openHamburger" for="openSidebar">&#x2716</label>
                    <label for="activateTemporal" id="temporalMenu" class="choiceMenu">Temporal</label>
                </div>
            </header>
            <section id="contentSection">
                <div id="viewerDiv"></div>
            </section>
        `;
    }

    get authenticationFrameHtml() {
        return /*html*/`
            <div id="${this.authenticationMenuLoggedInId}">
                <img src="${this.iconFolder}/profile.svg" id="profileIcon">
                <div id="${this.authenticationUserNameId}"></div>
                <button type="button" id="${this.authenticationLogoutButtonId}" class="logInOut">Logout</button>
            </div>
            <div id="${this.authenticationMenuLoggedOutId}">
                <button type="button" id="${this.authenticationLoginButtonId}" class="logInOut">Sign in</button>
            </div>
        `;
    }

    appendTo(htmlElement) {
        this.parentElement = htmlElement;
        let div = document.createElement('div');
        div.innerHTML = this.html;
        div.id = this.mainDivId;
        htmlElement.appendChild(div);
        this.initViewer();
    }

    //////// MODULE MANAGEMENT

    // Add a new module
    addModule(moduleName, moduleId, moduleClass, type = BaseDemo.MODULE_VIEW) {
        if ((typeof (moduleClass.enable) !== 'function') || (typeof (moduleClass.disable) !== 'function')) {
            throw 'A module must implement at least an enable() and a disable() methods';
        }

        this.modules[moduleId] = moduleClass;
        this.moduleNames[moduleName] = moduleId;
        this.moduleActivation[moduleId] = false;

        moduleClass.addListener('ENABLED', () => {
            console.log(`${moduleName} is enabled`);
            this.moduleActivation[moduleId] = true;

        });
        moduleClass.addListener('DISABLED', () => {
            console.log(`${moduleName} is disabled`);
            this.moduleActivation[moduleId] = false;
        });

        switch (type) {
            case BaseDemo.MODULE_VIEW:
                //create a new button in the menu
                this.createMenuButton(moduleId, moduleName);
                break;
            case BaseDemo.AUTHENTICATION_MODULE:
                this.createAuthenticationFrame(moduleId);
                break;
            default:
                throw `Unknown module type : ${type}`;
        }
    }

    // Create a menu button
    createMenuButton(moduleId, buttonText) {
        let button = document.createElement('label');
        button.id = this.getModuleButtonId(moduleId);
        button.innerText = buttonText;
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
        moduleClass.parentElement = this.contentSectionElement;
        moduleClass.addListener('ENABLED', () => {
            button.className = 'choiceMenu choiceMenuSelected';

        });
        moduleClass.addListener('DISABLED', () => {
            button.className = 'choiceMenu';
        });
        moduleClass.disable();
    }

    // Create the authentication frame
    createAuthenticationFrame(authModuleId) {
        let frame = document.createElement('div');
        frame.id = this.authenticationFrameId;
        frame.innerHTML = this.authenticationFrameHtml;
        this.menuElement.insertBefore(frame, document.getElementById('openHamburger').nextSibling);
        const authView = this.getModuleById(authModuleId);
        authView.parentElement = this.contentSectionElement;
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
        const updateFrame = () => {
            if (authService.isUserLoggedIn()) {
                const user = authService.getUser();
                this.authenticationMenuLoggedInElement.hidden = false;
                this.authenticationMenuLoggedOutElement.hidden = true;
                this.authenticationUserNameElement.innerHTML = `${user.firstname} ${user.lastname}`;
            } else {
                this.authenticationMenuLoggedInElement.hidden = true;
                this.authenticationMenuLoggedOutElement.hidden = false;
            }
        };
        authService.addObserver(updateFrame.bind(this));
        updateFrame();
    }

    // Is a module visible ?
    isModuleActive(moduleId) {
        return this.moduleActivation[moduleId];
    }

    // Get a module by id
    getModuleById(moduleId) {
        return this.modules[moduleId];
    }

    // Toggle a module
    toggleModule(moduleId) {
        if (!this.isModuleActive(moduleId)) {
            this.getModuleById(moduleId).enable();
        } else {
            this.getModuleById(moduleId).disable();
        }
    }

    // Get module button id
    getModuleButtonId(moduleId) {
        return `_base_demo_menu_button${moduleId}`;
    }

    // Get module button element
    getModuleButton(moduleId) {
        return document.getElementById(this.getModuleButtonId(moduleId));
    }

    initViewer() {
        const terrainAndElevationRequest = 'https://download.data.grandlyon.com/wms/grandlyon';

        // use this line for distant building server
        const buildingServerRequest = 'http://rict.liris.cnrs.fr/UDVDemo/Data/tileset.json';

        // if true, replace regular controls by controls adapted to finding precise orientation for documents
        // use false for regular controls (generic user)
        let useControlsForEditing = false;

        // Initialization of the renderer, view and extent
        [this.view, this.extent] = udvcore.Setup3DScene(terrainAndElevationRequest,
            buildingServerRequest,
            true,
            this.view);

        // The renderer provided by THREE.js as handled over by itowns
        this.renderer = this.view.scene;

        // camera starting position (south-west of the city, altitude 2000)
        this.view.camera.setPosition(new udvcore.itowns.Coordinates('EPSG:3946', this.extent.west(), this.extent.south(), 2000));
        // camera starting orientation (looking at city center)
        this.view.camera.camera3D.lookAt(this.extent.center().xyz());


        // PlanarControls (camera controller) options : regular mode (generic user) or edit mode
        // edit mode is more precise but less ergonomic : used to determine precise orientation for documents
        // see itowns/src/Renderer/ThreeExtended/PlanarControls.js for options parameters
        const optionsRegularMode = {
            maxAltitude: 15000,
            rotateSpeed: 3.0,
            autoTravelTimeMin: 2,
            autoTravelTimeMax: 6,
        };
        const optionsEditMode = {
            maxAltitude: 17000,
            rotateSpeed: 1.5,
            zoomInFactor: 0.04,
            zoomOutFactor: 0.04,
            maxPanSpeed: 5.0,
            minPanSpeed: 0.01,
            maxZenithAngle: 88,
        };

        // itowns' PlanarControls (camera controller) uses optionsEditMode or
        // optionsRegularMode depending on the value useControlsForEditing (boolean)
        this.controls = new udvcore.itowns.PlanarControls(this.view, (useControlsForEditing) ? optionsEditMode : optionsRegularMode);

        //////////// Temporal controller section

        // Retrieve the layer defined in Setup3DScene (we consider the first one
        // with the given name)
        const $3dTilesTemporalLayer = this.view.getLayers(layer => layer.name === '3d-tiles-temporal')[0];

        // Definition of the callback that is in charge of triggering a refresh
        // of the displayed layer when its (the layer) associated date has changed.
        let refreshDisplayLayerOnDate = (date) => {
            $3dTilesTemporalLayer.displayDate = date;
            this.view.notifyChange($3dTilesTemporalLayer);
        }

        // Instanciate a temporal controller
        this.temporal = new udvcore.TemporalController(
            refreshDisplayLayerOnDate,
            {   // Various available constructor options
                minTime: new moment("1700-01-01"),
                maxTime: new moment("2020-01-01"),
                currentTime: new moment().subtract(10, 'years'),
                timeStep: new moment.duration(1, 'years'),
                // or "YYYY-MMM" for Years followed months
                timeFormat: "YYYY",
                active: true
            });

        let temporalButton = document.getElementById('temporalMenu');
        //creating an icon
        let icon = document.createElement('img');
        icon.setAttribute('src', `${this.iconFolder}/temporal.svg`)
        icon.className = 'menuIcon';
        temporalButton.insertBefore(icon, temporalButton.firstChild);

        $3dTilesTemporalLayer.whenReady.then(
            // In order to configure the temporal slide bar widget, we must
            // retrieve the temporal events of displayed data. At this loading
            // stage it could be that the b3dm with the actual dates (down to
            // the building level) are not already loaded, but only their enclosing
            // tiles are at hand. We could recurse on tile hierarchy, but we also
            // have at hand the tileindex that we can (equivalently for the result)
            // iterate on.
            () => {
                // Store the layer for triggering scene updates when temporal slider
                // will be changed by user:
                this.temporal.layer = $3dTilesTemporalLayer;

                const tiles = $3dTilesTemporalLayer.tileIndex.index;
                const resultDates = [];
                for (const currentTileNb in tiles) {
                    const start = tiles[currentTileNb].boundingVolume.start_date;
                    if (start) {
                        resultDates.push(start);
                    }
                    const end = tiles[currentTileNb].boundingVolume.end_date;
                    if (end) {
                        resultDates.push(end);
                    }
                }
                // When there is such thing as a minimum and maximum, inform the temporal
                // widget of the data change and refresh the display.
                // Note: when the dataset doesn't have a minimum of two dates the temporal
                // widget remains with its default min/max values.
                if (resultDates.length >= 2) {
                    resultDates.sort();
                    this.temporal.minTime = new moment(resultDates[0]);
                    this.temporal.maxTime = new moment(resultDates[resultDates.length - 1]);
                    this.temporal.changeTime(this.temporal.minTime);
                    this.temporal.refresh();
                }
            }
        );
    }

    async loadConfigFile(filePath) {
        //loading configuration file
        // see https://github.com/MEPP-team/VCity/wiki/Configuring-UDV
        return $.ajax({
            type: "GET",
            url: filePath,
            datatype: "json",
            success: (data) => {
                this.config = data;
            }
        });
    }

    get mainDivId() {
        return '_base_demo';
    }

    get contentSectionId() {
        return 'contentSection';
    }

    get contentSectionElement() {
        return document.getElementById(this.contentSectionId);
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