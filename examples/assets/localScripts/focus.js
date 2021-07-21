/** @format */

let Shared = null;

//angle to inclinate the camera
const CAMERA_ANGLE = Math.PI / 6;

module.exports = class Focus {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;

    //quaternion to place the camera
    this.quaternionCam = new Shared.THREE.Quaternion().setFromEuler(
      new Shared.THREE.Euler(Math.PI * 0.5, 0, 0)
    );
    this.quaternionAngle = new Shared.THREE.Quaternion().setFromEuler(
      new Shared.THREE.Euler(-CAMERA_ANGLE, 0, 0)
    );

    //initial distance of the camera with the zeppelin
    this.distance = 150;
  }

  init() {
    const _this = this;

    //modulate the distance from the zeppelin with the wheel of the mouse
    //TODO should be register with the InputManager
    window.addEventListener('wheel', function (event) {
      _this.distance += event.wheelDelta * 0.1;
      _this.distance = Math.max(Math.min(_this.distance, 500), 0);
    });
  }

  tick() {
    //the gameobject parent of this script
    const go = arguments[0];

    //a context containing all data to script clientside script
    const localContext = arguments[1];

    //get the zeppelin gameobject by name
    const zeppelin = go.computeRoot().findByName('zeppelin');

    //compute world transform
    const obj = zeppelin.computeObject3D();
    let position = new Shared.THREE.Vector3();
    let quaternion = new Shared.THREE.Quaternion();
    obj.matrixWorld.decompose(position, quaternion, new Shared.THREE.Vector3());

    //move the position a bit up (z is up)
    position.z += 10;

    //compute camera position
    const dir = zeppelin
      .getDefaultForward()
      .applyQuaternion(this.quaternionAngle)
      .applyQuaternion(quaternion);

    position.sub(dir.setLength(this.distance));
    quaternion.multiply(this.quaternionCam);
    quaternion.multiply(this.quaternionAngle);

    //tweak values in camera object
    const iV = localContext.getGameView().getItownsView();
    iV.camera.camera3D.position.copy(position);
    iV.camera.camera3D.quaternion.copy(quaternion);
    iV.camera.camera3D.updateProjectionMatrix();
  }
};
