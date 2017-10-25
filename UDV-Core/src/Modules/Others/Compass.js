/**
* Class : Compass Controller
* adds a basic compass that rotates according to the orientation of the camera
* imprecise when zenith angle close to 90 (camera close to the ground)
*/

//update the html with elements for this class (compass image)
var compassDiv = document.createElement("div");
compassDiv.id = 'compass';
document.body.appendChild(compassDiv);

document.getElementById("compass").innerHTML = '\
<div id="compassWindow">\
<img id="compassImg" src="/img/compass.gif"></img>\
</div>';

/**
* Constructor for CompassController
* manages the orientation of the compass image
* @param controls : an instance of PlanarControls
*/
// =======================================================================
export function CompassController(controls) {

    // instance of PlanarControls
    this.controls = controls;

    // the compassImg html object
    const compass = document.getElementById("compassImg");

    // request update every active frame
    this.controls.view.addFrameRequester(this);

    // called by framerequester
    //===================================================================
    this.update = function update(){

        // camera.rotation.z is the angle we need : we update the css style
        // of the image to rotate it
        compass.style.transform = "rotate("+this.controls.camera.rotation.z+"rad)";
    }
}
