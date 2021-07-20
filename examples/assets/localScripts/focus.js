/** @format */

let Shared = null;

const CAMERA_ANGLE = Math.PI / 6;

module.exports = class Focus {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;

    //quaternion
    this.quaternionCam = new Shared.THREE.Quaternion().setFromEuler(
      new Shared.THREE.Euler(Math.PI * 0.5, 0, 0)
    );
    this.quaternionAngle = new Shared.THREE.Quaternion().setFromEuler(
      new Shared.THREE.Euler(-CAMERA_ANGLE, 0, 0)
    );

    this.distance = 150;
  }

  init() {
    const _this = this;
    window.addEventListener('wheel', function (event) {
      _this.distance += event.wheelDelta * 0.1;
      _this.distance = Math.max(Math.min(_this.distance, 500), 0);
    });
  }

  tick() {
    const go = arguments[0];
    const localContext = arguments[1];

    const zeppelin = go.computeRoot().findByName('zeppelin');

    //world transform
    const obj = zeppelin.computeObject3D();
    let position = new Shared.THREE.Vector3();
    let quaternion = new Shared.THREE.Quaternion();
    obj.matrixWorld.decompose(position, quaternion, new Shared.THREE.Vector3());

    position.z += 10;

    const dir = zeppelin
      .getDefaultForward()
      .applyQuaternion(this.quaternionAngle)
      .applyQuaternion(quaternion);

    position.sub(dir.setLength(this.distance));
    quaternion.multiply(this.quaternionCam);
    quaternion.multiply(this.quaternionAngle);

    const iV = localContext.getGameView().getItownsView();
    iV.camera.camera3D.position.copy(position);
    iV.camera.camera3D.quaternion.copy(quaternion);
    iV.camera.camera3D.updateProjectionMatrix();
  }
};
