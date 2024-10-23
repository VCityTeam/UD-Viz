import { PlanarView } from 'itowns';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
export class ViewManager {
  constructor(extent, options) {
    /** @type {HTMLElement} */
    this.domElement = document.createElement('div');
    /**
     * `this.domElement` has be added to the DOM in order to compute its dimension
     * this is necessary because the itowns.PlanarView need these dimension in order to be initialized correctly
     */
    if (options.parentDomElement instanceof HTMLElement) {
      options.parentDomElement.appendChild(this.domElement);
    } else {
      document.body.appendChild(this.domElement);
    }

    /** @type {PlanarView} */
    this.itownsView = this.initView(extent, options);
    /** @type {OrbitControls} */
    this.orbitControls = this.setupOrbitControls(extent);
  }

  initView(extent, options) {
    if (options.domElementClass)
      this.domElement.classList.add(options.domElementClass);

    /** @type {PlanarView} */
    return new PlanarView(this.domElement, extent, {
      maxSubdivisionLevel: options.maxSubdivisionLevel || 2,
      noControls: true,
    });
  }

  setupOrbitControls(extent) {
    /** @type {OrbitControls} */
    const orbitControls = new OrbitControls(
      this.itownsView.camera.camera3D,
      this.itownsView.mainLoop.gfxEngine.label2dRenderer.domElement
    );
    orbitControls.target.copy(extent.center().toVector3().clone());
    orbitControls.addEventListener('change', () => {
      this.itownsView.notifyChange(this.itownsView.camera.camera3D);
    });
    return orbitControls;
  }
}
