/**
* Class : Compass Controller
* adds a "compass" window that can be open/closed with a button
*/

THREE = itowns.THREE;

//update the html with elements for this class (windows, buttons etc)
var compassDiv = document.createElement("div");
compassDiv.id = 'compass';
document.body.appendChild(compassDiv);

document.getElementById("compass").innerHTML = '\
<div id="compassWindow">\
<img id="compassImg" src="../UDV-Core/img/compass.gif"></img>\
</div>';

//ctx.fillRect(50,20,100,50);


/**
* Constructor for CompassController
* manages the orientation of the compass image
* @param controls : an instance of PlanarControls
*/
// ===========================================================================================
function CompassController(controls) {

    // instance of PlanarControls
    this.controls = controls;

    this.view = this.controls.view;

    this.domElement = this.view.mainLoop.gfxEngine.renderer.domElement;

    const compass = document.getElementById("compassImg");

    const euler = new THREE.Euler();

    this.view.addFrameRequester(this);

    // called by framerequester
    //===================================================================
    this.update = function update(){

        euler.setFromQuaternion(this.controls.camera.quaternion);

        compass.style.transform = "rotate("+euler.z+"rad)";
    }

    //this.domElement.addEventListener('mousedown', this.update.bind(this), false);

}
