/** @format */

let udviz = null;
let Shared;

module.exports = class Focus {
  constructor(conf, udvizBundle) {
    this.conf = conf;
    udviz = udvizBundle;
    Shared = udviz.Game.Shared;

    //quaternion to place the camera
    this.quaternionCam = new Shared.THREE.Quaternion().setFromEuler(
      new Shared.THREE.Euler(Math.PI * 0.5, 0, 0)
    );
    this.quaternionAngle = new Shared.THREE.Quaternion().setFromEuler(
      new Shared.THREE.Euler(-this.conf.cameraAngle, 0, 0)
    );

    //initial distance of the camera with the zeppelin
    this.distance = this.conf.minDist;
  }

  init() {
    const _this = this;

    const localContext = arguments[1];
    const gV = localContext.getGameView();
    const manager = gV.getInputManager();
    manager.addMouseInput(gV.html(), 'wheel', function (event) {
      _this.distance += event.wheelDelta * 0.1;
      _this.distance = Math.max(
        Math.min(_this.distance, _this.conf.maxDist),
        _this.conf.minDist
      );
    });
  }

  tick() {
    //the gameobject parent of this script
    const go = arguments[0];

    //a context containing all data to script clientside script
    const localContext = arguments[1];

    //get the zeppelin gameobject by name
    const zeppelin = go.computeRoot().findByName(this.conf.nameGO2Focus);

    //compute world transform
    const obj = zeppelin.computeObject3D();
    let position = new Shared.THREE.Vector3();
    let quaternion = new Shared.THREE.Quaternion();
    obj.matrixWorld.decompose(position, quaternion, new Shared.THREE.Vector3());

    //move the position a bit up (z is up)
    position.z += this.conf.offsetZ;

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
