import * as THREE from 'three';
import * as proj4 from 'proj4';
import * as itowns from 'itowns';
import { View3D } from '../View3D/View3D';
import { computeNearFarCamera } from '../../Components/Camera/CameraUtils';
import * as THREEUtils from '../../Components/THREEUtils';
import { BrowserContext } from '../../Game/BrowserContext';

/**
 * Main view of an ud-viz game application
 * This object works with a state computer (./src/Game/Components/interpolator)
 */
export class GameView extends View3D {
  /**
   *
   * @param {*} params
   */
  constructor(params) {
    console.error('DEPRECATED');
    // Call parent class
    super(params);

    // Remove resize listener of parent
    window.removeEventListener('resize', this.resizeListener);
    this.resizeListener = this.onResize.bind(this);
    // Add its own
    window.addEventListener('resize', this.resizeListener);

    // Stop update of gameobject
    this.updateGameObject = true;
    if (params.updateGameObject != undefined)
      this.updateGameObject = params.updateGameObject;

    // TODO move these requesters in View3D
    // Array of callbacks call during the tick
    this.tickRequesters = [];
    this.resizeRequesters = [];
    this.onNewGORequesters = [];
    this.onDisposeRequesters = [];

    // Sky color
    this.skyColor = null;

    // UserData
    this.userData = params.userData || {};

    // Itowns rendering or not
    this.itownsRendering = false;
  }

  onResize() {
    super.onResize();

    this.resizeRequesters.forEach((cb) => {
      cb(this);
    });
  }

  getUserData(key) {
    return this.userData[key];
  }

  writeUserData(key, value) {
    this.userData[key] = value;
  }

  /**
   *
   * @param {boolean} value true go are updated false no
   */
  setUpdateGameObject(value) {
    this.updateGameObject = value;
  }

  /**
   * Register the function into tickRequesters
   *
   * @param {Function} cb a function that will be call every tick
   */
  addTickRequester(cb) {
    this.tickRequesters.push(cb);
  }

  // Allow user to plug a cb when resize method is called
  addResizeRequester(cb) {
    this.resizeRequesters.push(cb);
  }

  addOnNewGORequester(cb) {
    this.onNewGORequesters.push(cb);
  }

  addOnDisposeRequester(cb) {
    this.onDisposeRequesters.push(cb);
  }

  /**
   *
   * @param {BrowserContext} browserContext
   * @returns
   */
  start(browserContext) {
    const firstState = browserContext.init(this);

    return new Promise((resolve) => {
      // Build itowns view
      const o = firstState.getOrigin();
      const r = this.config.gameView.radiusExtent;
      if (o) {
        const [x, y] = proj4.default(this.projection).forward([o.lng, o.lat]);
        // Define geographic extent: CRS, min/max X, min/max Y
        const extent = new itowns.Extent(
          this.projection,
          x - r,
          x + r,
          y - r,
          y + r
        );
        this.initItownsView(extent);

        // TODO disable itowns rendering
        this.itownsView.render = function () {
          // Empty
        };
      } else {
        THREE.Object3D.DefaultUp.set(0, 0, 1);

        // No origin means no itowns view fill attr
        this.scene = new THREE.Scene();
        const canvas = document.createElement('canvas');
        this.rootWebGL.appendChild(canvas);
        this.renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: true,
          logarithmicDepthBuffer: true,
          alpha: true,
        });
        this.camera = new THREE.PerspectiveCamera(60, 1, 1, 1000); // Default params
        this.scene.add(this.camera);

        // Fill custom extent
        this.extent = {
          north: r,
          west: -r,
          south: -r,
          east: r,
          center: function () {
            return new THREE.Vector2();
          },
        };
      }

      // Start listening
      this.inputManager.startListening(this.rootWebGL);

      // Init scene attributes
      this.initSceneFromConfig(this.config.gameView.scene);
      this.scene.add(browserContext.getObject3D());

      // Start to tick
      const fps = this.config.gameView.fps;

      let now;
      let then = Date.now();
      let delta;
      const tick = () => {
        if (this.disposed) return; // Stop requesting frame if disposed

        requestAnimationFrame(tick);

        now = Date.now();
        delta = now - then;

        // Call tick requester
        this.tickRequesters.forEach((cb) => {
          cb(this);
        });

        if (delta > 1000 / fps) {
          // Update time stuffs
          then = now - (delta % 1000) / fps;

          browserContext.step(
            delta,
            this.updateGameObject,
            this.onNewGORequesters
          );

          // Render
          if (this.isRendering && !this.itownsRendering) {
            // This notably charge missing iTowns tiles according to current view.
            const iV = this.itownsView;
            if (iV) iV.notifyChange(this.getCamera());

            // Adjust camera params
            computeNearFarCamera(this.getCamera(), this.extent, 400);
            this.render();
          }
        }
      };
      resolve(); // resolve Promise meaning everything is intialize before first tick
      tick();

      // Differed a resize event
      setTimeout(this.resizeListener, 10);
    });
  }

  isItownsRendering() {
    return this.itownsRendering;
  }

  setItownsRendering(value) {
    // Only apply changes when value is different
    if (value == this.itownsRendering) {
      console.warn('setItownsRendering same value ', value); // DEBUG
      return;
    }

    this.itownsRendering = value;

    if (value) {
      // Creating controls like this put it in this.itownsView.controls
      this.planarControl = new itowns.PlanarControls(this.itownsView, {
        handleCollision: false,
        focusOnMouseOver: false,
        focusOnMouseClick: false,
      });

      // Dynamic near far computation
      this.itownsView.addFrameRequester(
        itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER,
        this.itownsRequesterBeforeRender
      );

      // Enable itowns rendering
      this.itownsView.render = null;
    } else {
      this.itownsView.controls.dispose();
      this.itownsView.controls = null;

      this.itownsView.removeFrameRequester(
        itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER,
        this.itownsRequesterBeforeRender
      );

      // Disable itowns rendering
      this.itownsView.render = function () {
        // Empty
      };
    }
  }

  /**
   * Initialize the scene of the itwons view => MOVE IN VIEW3D
   *
   */
  initSceneFromConfig(configScene) {
    if (!configScene) {
      console.error('no config');
    }

    // Init sky color based on config file
    this.skyColor = new THREE.Color(
      configScene.sky.color.r,
      configScene.sky.color.g,
      configScene.sky.color.b
    );

    // Init renderer
    const renderer = this.getRenderer();
    THREEUtils.initRenderer(renderer, this.skyColor);

    // Add lights
    const { directionalLight } = THREEUtils.addLights(this.scene);

    // Configure shadows based on a config files
    directionalLight.shadow.mapSize = new THREE.Vector2(
      configScene.shadowMapSize,
      configScene.shadowMapSize
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0005;
    this.directionalLight = directionalLight;

    if (configScene.sky.paths) {
      THREEUtils.addCubeTexture(configScene.sky.paths, this.getScene());
    }
  }

  /**
   * Dispose this view
   *
   */
  dispose() {
    super.dispose();

    this.onDisposeRequesters.forEach((requester) => {
      requester(this);
    });
  }

  // Allow user to set a custom render pass
  setRender(f) {
    this.render = f;
  }

  render() {
    // Render
    this.renderer.clearColor();
    this.renderer.render(this.scene, this.getCamera());
  }

  /**
   * Force this gameview to update with a specific state
   *
   * @param {WorldState} state
   */
  forceUpdate() {
    console.error('DEPRECATED');
    // let states = [];
    // if (!state) {
    //   const computer = this.interpolator.getLocalComputer();
    //   if (computer) {
    //     states = [computer.computeCurrentState()];
    //   } else {
    //     throw new Error('no local computer');
    //   }
    // } else states = [state];

    // const old = this.updateGameObject;
    // this.updateGameObject = true;
    // this.update(states);
    // this.updateGameObject = old;
  }
}
