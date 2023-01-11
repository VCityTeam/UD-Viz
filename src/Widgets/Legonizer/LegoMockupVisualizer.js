import * as THREE from 'three';
import * as itowns from 'itowns';
import './LegoVisualizerScene.css';

/**
 * @param {itowns} view3D
 */
export class LegoMockupVisualizer {
  constructor(view3D, legoMockup) {
    this.view3D = view3D;

    this.legoMockup = legoMockup;

    this.sceneElement;

    this.constructHtml();

    this.createTHREEScene();
  }

  constructHtml() {
    // This.view3D.rootHtml
    this.sceneElement = document.createElement('div');
    this.sceneElement.id = 'legoVisualizerScene';

    this.view3D.rootHtml.appendChild(this.sceneElement);
  }

  createTHREEScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(
      this.sceneElement.clientWidth,
      this.sceneElement.clientHeight
    );
    this.sceneElement.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    /**
     *
     */
    function animate() {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();
  }
}
