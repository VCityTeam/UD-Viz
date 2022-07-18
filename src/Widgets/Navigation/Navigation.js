//Components
import { ModuleView } from '../Components/ModuleView/ModuleView';
import * as THREE from 'three';
import './Navigation.css';

export class Navigation extends ModuleView {
  constructor(view3D) {
    super();
    
    //Scene renderer
    const renderer = view3D.mainLoop.gfxEngine.renderer;

    //Zoom value for the slider
    let zoomValue = 100;
    
    //Itowns camera 
    const camera = view3D.camera.camera3D;

    // Zoom UI
    let zoomDiv = document.createElement('nav');
    zoomDiv.className = 'slidecontainer';
    zoomDiv.innerHTML = 
        '<h2>Zoom</h2>\
        <h3 id="zoomMoins">-</h3>\
        <input type="range" min="1" max="100" value="50" class="slider" id="myRange">\
        <h3 id="zoomPlus">+</h3>\
        <img src="../../../../examples/assets/img/compass.png" id="compass" style="transform: rotate(0deg);">';
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
      camera.getWorldDirection(direction);
      let cameraPos = camera.position;
          
      direction =  new THREE.Vector3(direction.x * scaleZoom, direction.y * scaleZoom, direction.z * scaleZoom);
      cameraPos.set(cameraPos.x + direction.x, cameraPos.y + direction.y, cameraPos.z + direction.z);
      lastValue = this.value;
    };

    //Compass update with camera
    renderer.setAnimationLoop(() => {
      view3D.notifyChange();
      //Get z rotation of the camera and convert in degree
      document.getElementById('compass').style.transform = `rotate(${THREE.Math.radToDeg(camera.rotation.z)}deg)`;
    });
  }

  /////// MODULE VIEW METHODS
  enableView() {
    document.getElementsByClassName('slidecontainer')[0].style.setProperty('display', 'flex');
  }

  disableView() {
    document.getElementsByClassName('slidecontainer')[0].style.setProperty('display', 'none');
  }
}