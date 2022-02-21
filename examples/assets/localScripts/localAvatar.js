/** @format */

let udviz;
let Shared = null;

module.exports = class LocalAvatar {
  constructor(conf, udvizBundle) {
    this.conf = conf;
    udviz = udvizBundle;
    Shared = udviz.Game.Shared;

    this.avatar = null;
    this.intersectionCube = null;
    this.inputManager = null;

    //raycaster for avoiding buildings collisions with avatar
    this.raycaster = new Shared.THREE.Raycaster();
  }

  addObjectToArray(array, tilesManager, layerName) {
    let layerManager = null;
    for (let index = 0; index < tilesManager.length; index++) {
      const element = tilesManager[index];
      //debugger
      if (element.layer.id == layerName) {
        layerManager = element;
        break;
      }
    }

    if (!layerManager) throw new Error('no layer called ', layerName);

    layerManager.tiles.forEach(function (t) {
      const obj = t.getObject3D();
      if (obj) array.push(obj);
    });
  }
  buildingsHit(tilesManager, origin, direction) {
    const buildings = [];
    this.addObjectToArray(buildings, tilesManager, '3d-tiles-layer-building');

    this.raycaster.ray.origin = origin;
    this.raycaster.ray.direction = direction;

    const intersections = this.raycaster.intersectObjects(buildings, true);
    if (intersections.length) return intersections[0];
    return null;
  }
  groundElevationDelta(tilesManager, origin) {
    const ground = [];
    this.addObjectToArray(ground, tilesManager, '3d-tiles-layer-relief');
    this.addObjectToArray(ground, tilesManager, '3d-tiles-layer-road');

    const zShift = 500;
    this.raycaster.ray.origin.set(origin.x, origin.y, origin.z + zShift);
    this.raycaster.ray.direction.set(0, 0, -1);

    const intersections = this.raycaster.intersectObjects(ground, true);
    return intersections.length ? intersections[0].distance - zShift : null;
  }

  init() {
    const avatar = arguments[0].computeRoot().findByName('avatar');
    this.avatar = avatar;
    const localContext = arguments[1];
    const gV = localContext.getGameView();
    const scene = gV.getScene();
    const tilesManager = gV.getLayerManager().tilesManagers;
    const worldOrigin = gV.getObject3D().position;

    //Input manager of the game
    const inputManager = localContext.getGameView().getInputManager();

    //intersection cube
    const geometry = new Shared.THREE.BoxGeometry(1, 1, 1);
    const material = new Shared.THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.intersectionCube = new Shared.THREE.Mesh(geometry, material);
    scene.add(this.intersectionCube);

    const dt = localContext.getDt();
    const translationSpeed = 0.03;
    const translationLength = translationSpeed * dt;
    const speedRotate = 0.0006;

    const checkCollisionFun = function (direction) {
      const origin = avatar
        .getPosition()
        .clone()
        .add(worldOrigin)
        .add(new Shared.THREE.Vector3(0, 0, 1));
      const intersection = this.buildingsHit(tilesManager, origin, direction);
      const depth = intersection ? intersection.distance : Infinity;

      if (depth != Infinity) {
        this.intersectionCube.visibility = true;
        this.intersectionCube.position.copy(intersection.point);
        this.intersectionCube.updateMatrixWorld();
      } else {
        this.intersectionCube.visibility = false;
      }

      return translationLength > depth;
    }.bind(this);
    const updateGroundElevationFun = function () {
      const zDelta = this.groundElevationDelta(
        tilesManager,
        avatar.getPosition().clone().add(worldOrigin)
      );
      if (!zDelta) return;
      avatar.move(new Shared.THREE.Vector3(0, 0, -zDelta));
    }.bind(this);

    //FORWARD
    inputManager.addKeyCommand('move_forward', ['z'], function () {
      const dt = localContext.getDt();
      const direction = avatar.computeForwardVector();
      if (checkCollisionFun(direction)) return;
      avatar.move(direction.setLength(translationLength));
      updateGroundElevationFun();
    });
    //BACKWARD
    inputManager.addKeyCommand('move_backward', ['s'], function () {
      const dt = localContext.getDt();
      const direction = avatar.computeBackwardVector();
      if (checkCollisionFun(direction)) return;
      avatar.move(direction.setLength(translationLength));
      updateGroundElevationFun();
    });
    //LEFT
    inputManager.addKeyCommand('rotate_left', ['q'], function () {
      const dt = localContext.getDt();
      avatar.rotate(new Shared.THREE.Vector3(0, 0, speedRotate * dt));
    });
    //RIGHT
    inputManager.addKeyCommand('rotate_right', ['d'], function () {
      const dt = localContext.getDt();
      avatar.rotate(new Shared.THREE.Vector3(0, 0, -speedRotate * dt));
    });

    //tick command
    gV.addTickRequester(function () {
      inputManager.computeCommands();
    });
  }

  tick() {}
};
