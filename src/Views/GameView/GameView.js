/** @format */

import * as udviz from '../../index';
import * as THREE from 'three';
import * as proj4 from 'proj4';
import * as itowns from 'itowns';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const MySobelOperatorShader = {
	uniforms: {
		'tDiffuse': { value: null },
		'resolution': new THREE.Uniform(new THREE.Vector2()),
	},

	vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
  `,

	fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    varying vec2 vUv;
    void main() {
      vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );
      //vec2 texel = vUv;
      // kernel definition (in glsl matrices are filled in column-major order)
      const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 ); // x direction kernel
      const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 ); // y direction kernel
      // fetch the 3x3 neighbourhood of a fragment
      // first column
      vec4 tx0y0 = texture2D( tDiffuse, vUv + texel * vec2( -1, -1 ) );
      vec4 tx0y1 = texture2D( tDiffuse, vUv + texel * vec2( -1,  0 ) );
      vec4 tx0y2 = texture2D( tDiffuse, vUv + texel * vec2( -1,  1 ) );
      // second column
      vec4 tx1y0 = texture2D( tDiffuse, vUv + texel * vec2(  0, -1 ) );
      vec4 tx1y1 = texture2D( tDiffuse, vUv + texel * vec2(  0,  0 ) );
      vec4 tx1y2 = texture2D( tDiffuse, vUv + texel * vec2(  0,  1 ) );
      // third column
      vec4 tx2y0 = texture2D( tDiffuse, vUv + texel * vec2(  1, -1 ) );
      vec4 tx2y1 = texture2D( tDiffuse, vUv + texel * vec2(  1,  0 ) );
      vec4 tx2y2 = texture2D( tDiffuse, vUv + texel * vec2(  1,  1 ) );
      // gradient value in x direction
      vec4 valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
        Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
        Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;
      // gradient value in y direction
      vec4 valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
        Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
        Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;
      // magnitute of the total gradient
      gl_FragColor = sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) );
    }
  `,
};

const MaskShader = {

	uniforms: {
		'tDiffuse': { value: null },
		'tMask': { value: null },
		'resolution': new THREE.Uniform(new THREE.Vector2()),
	},

	vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
  `,

	fragmentShader: /* glsl */`
		uniform sampler2D tDiffuse;
		uniform sampler2D tMask;
		uniform vec2 resolution;
		varying vec2 vUv;
		void main() {
      gl_FragColor = vec4(0.);

      /*
      //gl_FragColor = vec4(mod(vUv*resolution, vec2(2.)), 0., 1.);
      //gl_FragColor = vec4(vec2(mod(vUv.x*resolution.x/5., 2.)), 0., 1.);
      float xgrad = mod(vUv.x*resolution.x, 10.)/10.;
      if(xgrad > 0.5)
        gl_FragColor = texture2D(tDiffuse, vUv);
      else
        gl_FragColor = texture2D(tMask, vUv);
      */

      vec4 maskTexel = texture2D(tMask, vUv);
      float maskFactor = max(max(max(maskTexel.x, maskTexel.y), maskTexel.z), maskTexel.w);
      gl_FragColor = vec4((1.- maskFactor) * texture2D(tDiffuse, vUv).xyz, 1.);
      // if(maskFactor <= 0.)
      //   gl_FragColor = texture2D(tDiffuse, vUv);
		}
  `
};


const MYMAT = new THREE.ShaderMaterial({
  uniforms: {
    // logDepthBufFC:{value:1},
    // opacity: {
    //   value: 1.0
    // }
  },
  vertexShader: `
    #define NORMAL

    varying vec3 vNormal;
    varying float vDepth;

    #include <common>
    #include <logdepthbuf_pars_vertex>

    void main() {
      #include <beginnormal_vertex>
      #include <defaultnormal_vertex>

      //vNormal = normalize( transformedNormal );

      #include <begin_vertex>
      #include <project_vertex>
      #include <logdepthbuf_vertex>

      vNormal = normal;
      //vDepth = 1.0 + gl_Position.w;
      //vDepth = log(1.0 + abs(gl_Position.z));
      //vDepth = gl_Position.w;
      //vDepth = log(1. + abs(mvPosition.y));
    }
  `,
  fragmentShader: `
    #define NORMAL

    varying vec3 vNormal;
    varying float vDepth;

    #include <packing>
    #include <normalmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>

    void main() {

      #include <clipping_planes_fragment>
      #include <logdepthbuf_fragment>
      #include <normal_fragment_begin>
      #include <normal_fragment_maps>

      gl_FragColor = vec4(packNormalToRGB( normal ), 0.);
      //gl_FragColor = vec4(packNormalToRGB( normal ), gl_FragCoord.w);
    }
  `,
});
// MYMAT.side = THREE.FrontSide;
//MYMAT.clippingPlanes = [];
MYMAT.flatShading = false;
// MYMAT.normalMapType = THREE.ObjectSpaceNormalMap;




import LocalScript from '../../Game/Shared/GameObject/Components/LocalScript';
import { View3D } from '../View3D/View3D';

const udvShared = require('../../Game/Shared/Shared');
const THREEUtils = udvShared.Components.THREEUtils;

/**
 * Main view of an ud-viz game application
 * This object works with a state computer (./src/Game/Components/StateComputer)
 */
export class GameView extends View3D {
  constructor(params) {
    //call parent class
    super(params);

    //assets
    this.assetsManager = params.assetsManager;

    //state computer
    this.stateComputer = params.stateComputer;

    //object3D
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'GameView_Object3D';

    //sky color
    this.skyColor = null;

    //the last state processed
    this.lastState = null;

    //stop update of gameobject
    this.updateGameObject = true;
    if (params.updateGameObject != undefined)
      this.updateGameObject = params.updateGameObject;

    //context pass to the localScript GameObject
    this.localContext = new LocalContext(this);

    //Current GameObject UUID in the last state
    this.currentUUID = {};

    //TODO move in View3D
    //Array of callbacks call during the tick
    this.tickRequesters = [];

    //userData
    this.userData = params.userData || {};

    //renderTarget for special effects
    const size = super.getSize();
    this.renderTargetFX = new THREE.WebGLRenderTarget(size.x, size.y, {
      depthBuffer: true,
      stencilBuffer: true,
    });
    // this.overrideMaterialFX = new THREE.MeshNormalMaterial();
    this.overrideMaterialFX = MYMAT;
  }

  onResize(){
    super.onResize();
    const size = super.getSize();
    this.renderTargetFX.setSize(size.x, size.y);
  }

  getUserData(key) {
    return this.userData[key];
  }

  writeUserData(key, value) {
    this.userData[key] = value;
  }

  getLocalContext() {
    return this.localContext;
  }

  /**
   *
   * @param {Boolean} value true go are updated false no
   */
  setUpdateGameObject(value) {
    this.updateGameObject = value;
    this.stateComputer.setPause(value);
  }

  /**
   *
   * @returns {THREE.Color} color of the renderer clear color
   */
  getSkyColor() {
    return this.skyColor;
  }

  /**
   * register the function into tickRequesters
   * @param {Function} cb a function that will be call every tick
   */
  addTickRequester(cb) {
    this.tickRequesters.push(cb);
  }

  /**
   * Initialize this view
   *
   * @param {WorldState} state first state of this view
   */
  start(state) {
    //build itowns view
    const o = state.getOrigin();
    const [x, y] = proj4.default(this.projection).forward([o.lng, o.lat]);
    const r = this.config.itowns.radiusExtent;
    // Define geographic extent: CRS, min/max X, min/max Y
    const extent = new itowns.Extent(
      this.projection,
      x - r,
      x + r,
      y - r,
      y + r
    );
    this.initItownsView(extent);

    //TODO disable itons rendering
    this.itownsView.render = function () {
      //empty
    };

    this.initScene(state);

    //start to tick
    const _this = this;
    const fps = this.config.game.fps;

    let now;
    let then = Date.now();
    let delta;
    const tick = function () {
      if (_this.disposed) return; //stop requesting frame if disposed

      requestAnimationFrame(tick);

      now = Date.now();
      delta = now - then;

      if (delta > 1000 / fps) {
        // update time stuffs
        then = now - (delta % 1000) / fps;

        //set dt
        _this.localContext.setDt(delta);

        //call tick requester
        _this.tickRequesters.forEach(function (cb) {
          cb(_this.localContext);
        });

        //update Gameview
        _this.update(_this.stateComputer.computeCurrentState());
      }
    };
    tick();

    //differed a resize event
    setTimeout(this.onResize.bind(this), 1000);
  }

  /**
   *
   * @returns {THREE.Object3D} return the object3D of the gameview
   */
  getObject3D() {
    return this.object3D;
  }

  /**
   * initialize the scene of the itwons view
   * @param {WorldState} state
   */
  initScene(state) {
    const o = state.getOrigin();
    const [x, y] = proj4.default(this.projection).forward([o.lng, o.lat]);

    //add the object3D of the Game
    //TODO this object should be in World
    this.object3D.position.x = x;
    this.object3D.position.y = y;
    this.object3D.position.z = o.alt;
    this.itownsView.scene.add(this.object3D);

    //init sky color based on config file
    this.skyColor = new THREE.Color(
      this.config.game.skyColor.r,
      this.config.game.skyColor.g,
      this.config.game.skyColor.b
    );

    //init renderer
    const renderer = this.getRenderer();
    THREEUtils.initRenderer(renderer, this.skyColor);

    //add lights
    const { directionalLight, ambientLight } = THREEUtils.addLights(
      this.itownsView.scene
    );

    //configure shadows based on a config files
    directionalLight.shadow.mapSize = new THREE.Vector2(
      this.config.game.shadowMapSize,
      this.config.game.shadowMapSize
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0005;
    this.directionalLight = directionalLight;

    if (this.config.game && this.config.game.sky) {
      THREEUtils.addEquiRectangularMap(
        this.config.game.sky.path,
        renderer,
        this.getScene()
      );
    }
  }

  /**
   * dispose this view
   */
  dispose(keepAssets = false) {
    super.dispose();
    this.stateComputer.stop();

    if (!keepAssets) this.assetsManager.dispose();
  }

  /**
   * Update GameObject with the new state
   * Initialize assets of the new GameObject
   * Call LocalScript of the GameObject
   * Replace Shadow light if needed
   * Call a render pass
   *
   * @param {WorldState} state the new state used to update this view
   */
  update(state) {
    const _this = this;
    const newGO = [];
    const ctx = this.localContext;

    //update lastState with the new one
    if (this.lastState) {
      let lastGO = this.lastState.getGameObject();

      if (this.updateGameObject) {
        //update lastGO

        lastGO.traverse(function (g) {
          const uuid = g.getUUID();
          const current = state.getGameObject().find(uuid);
          if (current) {
            //update local components
            g.updateFromGO(current, ctx);
          } else {
            //do not exist remove it
            g.removeFromParent();
            delete _this.currentUUID[g.getUUID()];
          }
        });

        state.getGameObject().traverse(function (g) {
          const uuid = g.getUUID();
          const old = lastGO.find(uuid);
          if (!old) {
            //new one add it
            const parent = lastGO.find(g.getParentUUID());
            parent.addChild(g);
          }

          if (!_this.currentUUID[g.getUUID()]) {
            newGO.push(g);
          }
        });
      }

      state.setGameObject(lastGO); //set it
    } else {
      state.getGameObject().traverse(function (g) {
        newGO.push(g);
      });
    }

    //bufferize
    this.lastState = state;

    //init assets new GO
    newGO.forEach(function (g) {
      g.initAssetsComponents(_this.assetsManager, {
        udviz: udviz,
        Shared: udvShared,
      });
    });

    const go = state.getGameObject();

    //localscript event INIT + ON_NEW_GAMEOBJECT
    newGO.forEach(function (g) {
      console.log('New GO => ', g.name);
      _this.currentUUID[g.getUUID()] = true;

      //init newGO localscript
      const scriptComponent = g.getComponent(LocalScript.TYPE);
      if (scriptComponent) {
        scriptComponent.execute(LocalScript.EVENT.INIT, [ctx]);
      }

      //notify other go that a new go has been added
      go.traverse(function (child) {
        const scriptComponent = child.getComponent(LocalScript.TYPE);
        if (scriptComponent) {
          scriptComponent.execute(LocalScript.EVENT.ON_NEW_GAMEOBJECT, [
            ctx,
            g,
          ]);
        }
      });
    });

    //rebuild object
    this.object3D.children.length = 0;
    this.object3D.add(go.computeObject3D());
    this.object3D.updateMatrixWorld();

    //update shadow
    if (newGO.length)
      THREEUtils.bindLightTransform(
        10,
        Math.PI / 4,
        Math.PI / 4,
        this.object3D,
        this.directionalLight
      );

    if (this.updateGameObject) {
      //tick local script
      go.traverse(function (child) {
        const scriptComponent = child.getComponent(LocalScript.TYPE);
        if (scriptComponent)
          scriptComponent.execute(LocalScript.EVENT.TICK, [ctx]);
      });
    }

    if (this.isRendering) {
      //render
      const scene = this.itownsView.scene;
      scene.updateMatrixWorld();
      const camera = this.itownsView.camera.camera3D;
      const renderer = this.itownsView.mainLoop.gfxEngine.renderer;
      
      const composer = new EffectComposer(renderer, this.renderTargetFX);
      const normalsPass = new RenderPass(scene, camera, this.overrideMaterialFX);
      composer.addPass(normalsPass);
      const sobelPass = new ShaderPass(MySobelOperatorShader);
      sobelPass.uniforms.resolution.value = new THREE.Vector2(composer.writeBuffer.width, composer.writeBuffer.height);
      composer.addPass(sobelPass);
      composer.renderToScreen = false;
      composer.render();

      const finalComposer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      finalComposer.addPass(renderPass);
      const compositionPass = new ShaderPass(MaskShader);
      compositionPass.uniforms.tMask.value = this.renderTargetFX.texture;
      compositionPass.uniforms.resolution.value = new THREE.Vector2(composer.writeBuffer.width, composer.writeBuffer.height);
      finalComposer.addPass(compositionPass);
      finalComposer.render();
    }

    //This notably charge missing iTowns tiles according to current view.
    this.getItownsView().notifyChange(this.getItownsView().camera.camera3D);
  }

  /**
   * force this gameview to update with a specific state
   * @param {WorldState} state
   */
  forceUpdate(state) {
    if (!state) state = this.stateComputer.computeCurrentState();

    let old = this.updateGameObject;
    this.updateGameObject = true;
    this.update(state);
    this.updateGameObject = old;
  }

  /**
   * @returns {AssetsManager}
   */
  getAssetsManager() {
    return this.assetsManager;
  }

  /**
   * @returns {WorldState}
   */
  getLastState() {
    return this.lastState;
  }

  getStateComputer() {
    return this.stateComputer;
  }
}

/**
 * Context pass to the GameObject LocalScript to work
 */
class LocalContext {
  constructor(gameView) {
    this.dt = 0;
    this.gameView = gameView;
    this.webSocketService = null;
  }

  /**
   *
   * @param {Number} dt delta time of the current frame
   */
  setDt(dt) {
    this.dt = dt;
  }

  /**
   *
   * @returns {Number}
   */
  getDt() {
    return this.dt;
  }

  setWebSocketService(w) {
    this.webSocketService = w;
  }

  getWebSocketService() {
    return this.webSocketService;
  }

  /**
   *
   * @returns {GameView}
   */
  getGameView() {
    return this.gameView;
  }
}
