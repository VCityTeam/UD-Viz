//Components
import { ModuleView } from '../../Components/ModuleView/ModuleView';
import * as THREE from 'three';
import './navigation.css';

export class Navigation extends ModuleView {
  constructor(view3D) {
    super();
    
    let renderer = view3D.mainLoop.gfxEngine.renderer;
    //Zoom value for the slider
    let zoomValue = 100;

    //3D scene of your camera
    let scene3D =  view3D.scene;

    // Zoom UI
    let zoomDiv = document.createElement('nav');
    zoomDiv.className = 'slidecontainer';
    zoomDiv.innerHTML = 
        '<h2>Zoom</h2>\
        <h3 id="zoomMoins">-</h3>\
        <input type="range" min="1" max="100" value="50" class="slider" id="myRange">\
        <h3 id="zoomPlus">+</h3>\
        <img src="./compass.png" id="compass" style="transform: rotate(-43.4214deg);">';
    document.getElementById('contentSection').append(zoomDiv);

    let rangeslider = document.getElementById('myRange');
    // Update the current slider value (each time you drag the slider handle)
    let lastValue = 50;
    rangeslider.oninput = function() {
      let scaleZoom = zoomValue;
      if (lastValue < this.value){
        scaleZoom = zoomValue;
      }else{
        scaleZoom = -zoomValue;
      }
      let direction = new THREE.Vector3();
      view3D.camera.getWorldDirection(direction);
      let camera = view3D.camera.position;
          
      direction =  new THREE.Vector3(direction.x * scaleZoom, direction.y * scaleZoom, direction.z * scaleZoom);
      camera.set(camera.x + direction.x, camera.y + direction.y, camera.z + direction.z);
      lastValue = this.value;
    };

    //Compass update with camera
    var dir = new THREE.Vector3();
    var sph = new THREE.Spherical();
    renderer.setAnimationLoop(() => {
      renderer.render(scene3D, view3D.camera);
      view3D.camera.getWorldDirection(dir);
      sph.setFromVector3(dir);
      document.getElementById('compass').style.transform = `rotate(${THREE.Math.radToDeg(sph.theta) - 180}deg)`;
    });
  }
}