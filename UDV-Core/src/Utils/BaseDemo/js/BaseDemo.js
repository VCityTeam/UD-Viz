export class BaseDemo {
    constructor() {
        this.modules = {};
        this.moduleNames = {};
        this.moduleActivation = {};
        this.config = {};
        this.parentElement;
    }

    get html() {
        return /*html*/`
        <input type="checkbox" id="activateTemporal" class="nonVisible">
        <header>
            <div class="header">
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
                <div id="profileMenu">
                    <div id="profileMenuLoggedIn" hidden=true>
                        <img src="Icons/profile.svg" id="profileIcon">
                        <div id="name"></div>
                        <button type="button" id="logout" class="logInOut">Logout</button>
                    </div>
                    <div id="profileMenuLoggedOut">
                        <label for="activateLoginRegistration" id="loginRegistration" class="logInOut">Sign In</label>
                    </div>
                </div>
                <label for="activateTemporal" id="temporalMenu" class="choiceMenu">Temporal</label>
            </div>
        </header>
        <section id="contentSection">
            <div id="viewerDiv"></div>
        </section>
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
    addModule(moduleName, moduleId, moduleClass) {
        if ((typeof(moduleClass.enable) !== 'function') || (typeof(moduleClass.disable) !== 'function')) {
            throw 'A module must implement at least an enable() and a disable() methods';
        }

        this.modules[moduleId] = moduleClass;
        this.moduleNames[moduleName] = moduleId;
        this.moduleActivation[moduleId] = false;

        //create a new button in the menu
        let button = document.createElement('label');
        button.id = this.getModuleButtonId(moduleId);
        button.innerText = moduleName;
        this.menuElement.appendChild(button);
        button.onclick = (() => {
            this.toggleModule(moduleId);
        }).bind(this);
        moduleClass.addListener('ENABLED', () => {
            this.moduleActivation[moduleId] = true;
            button.className = 'choiceMenu choiceMenuSelected';

        });
        moduleClass.addListener('DISABLED', () => {
            this.moduleActivation[moduleId] = false;
            button.className = 'choiceMenu';
        });
        moduleClass.disable();
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

        let view;  // itowns view (3d scene)
        let extent;  // itowns extent (city limits)

        // Initialization of the renderer, view and extent
        [view, extent] = udvcore.Setup3DScene(terrainAndElevationRequest,
            buildingServerRequest,
            true,
            view);

        // The renderer provided by THREE.js as handled over by itowns
        const renderer = view.scene;

        // camera starting position (south-west of the city, altitude 2000)
        view.camera.setPosition(new udvcore.itowns.Coordinates('EPSG:3946', extent.west(), extent.south(), 2000));
        // camera starting orientation (looking at city center)
        view.camera.camera3D.lookAt(extent.center().xyz());


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
        const controls = new udvcore.itowns.PlanarControls(view, (useControlsForEditing) ? optionsEditMode : optionsRegularMode);

        //////////// Temporal controller section

        // Retrieve the layer defined in Setup3DScene (we consider the first one
        // with the given name)
        const $3dTilesTemporalLayer = view.getLayers(layer => layer.name === '3d-tiles-temporal')[0];

        // Definition of the callback that is in charge of triggering a refresh
        // of the displayed layer when its (the layer) associated date has changed.
        function refreshDisplayLayerOnDate(date) {
            $3dTilesTemporalLayer.displayDate = date;
            view.notifyChange($3dTilesTemporalLayer);
        }

        // Instanciate a temporal controller
        const temporal = new udvcore.TemporalController(
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

        $3dTilesTemporalLayer.whenReady.then(
            // In order to configure the temporal slide bar widget, we must
            // retrieve the temporal events of displayed data. At this loading
            // stage it could be that the b3dm with the actual dates (down to
            // the building level) are not already loaded, but only their enclosing
            // tiles are at hand. We could recurse on tile hierarchy, but we also
            // have at hand the tileindex that we can (equivalently for the result)
            // iterate on.
            function () {
                // Store the layer for triggering scene updates when temporal slider
                // will be changed by user:
                temporal.layer = $3dTilesTemporalLayer;

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
                    temporal.minTime = new moment(resultDates[0]);
                    temporal.maxTime = new moment(resultDates[resultDates.length - 1]);
                    temporal.changeTime(temporal.minTime);
                    temporal.refresh();
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

    get menuId() {
        return '_base_demo_menu';
    }

    get menuElement() {
        return document.getElementById(this.menuId);
    }
}