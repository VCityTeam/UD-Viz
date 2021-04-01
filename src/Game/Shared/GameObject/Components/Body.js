/** @format */

const { Circle, Polygon } = require('detect-collisions');
const THREE = require('three');

const BodyModule = class Body {
  constructor(parent, json) {
    if (!json) throw new Error('no json');
    this.parent = parent;
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
    this.shapesJSON = json.shapes || [];

    //data
    this.bodies = [];
    this.createBodies();
  }

  initAssets(assetsManager) {
    //nada
  }

  createBodies() {
    const bodies = this.bodies;

    this.shapesJSON.forEach(function (s) {
      switch (s.type) {
        case 'Circle':
          const circle = new Circle(s.center.x, s.center.y, s.radius);

          //attach userData to perform update
          circle.userData = s;
          circle.update = function (worldtransform) {
            circle.x = circle.userData.center.x + worldtransform.position.x;
            circle.y = circle.userData.center.y + worldtransform.position.y;
          };

          bodies.push(circle);
          break;
        case 'Polygon':
          const points = [];
          s.points.forEach(function (p) {
            points.push([p.x, p.y]);
          });

          const polygon = new Polygon(0, 0, points);

          //attach userData to perform update
          polygon.userData = s;
          polygon.update = function (worldtransform) {
            const points = [];
            polygon.userData.points.forEach(function (p) {
              const point = [
                p.x + worldtransform.position.x,
                p.y + worldtransform.position.y,
              ];
              points.push(point);
              //TODO handle rotation
            });
            polygon.setPoints(points);
          };

          bodies.push(polygon);
          break;
        default:
      }
    });
  }

  onCollision(result) {
    this.parent.transform.position.x -= result.overlap * result.overlap_x;
    this.parent.transform.position.y -= result.overlap * result.overlap_y;
  }

  getBodies() {
    return this.bodies;
  }

  update() {
    const worldTransform = this.parent.computeWorldTransform();
    this.bodies.forEach(function (b) {
      b.update(worldTransform);
    });
  }

  isServerSide() {
    return true;
  }

  setShapesJSON(json) {
    this.shapesJSON = json;
  }

  getShapesJSON() {
    return this.shapesJSON;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      type: BodyModule.TYPE,
      shapes: this.shapesJSON,
    };
  }
};

BodyModule.TYPE = 'Body';

module.exports = BodyModule;
