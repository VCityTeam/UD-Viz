/** @format */
const { Circle, Polygon } = require('detect-collisions');

module.exports = class ShapeWrapper {
  constructor(gameObject, json) {
    this.gameObject = gameObject;
    this.json = json;

    //sgape detect - collision
    this.shape = null;

    this.initFromJSON(json);
  }

  getShape() {
    return this.shape;
  }

  getGameObject() {
    return this.gameObject;
  }

  initFromJSON(json) {
    switch (json.type) {
      case 'Circle':
        const circle = new Circle(json.center.x, json.center.y, json.radius);

        this.update = function (worldtransform) {
          circle.x = json.center.x + worldtransform.position.x;
          circle.y = json.center.y + worldtransform.position.y;
        };

        this.shape = circle;
        break;
      case 'Polygon':
        const points = [];
        json.points.forEach(function (p) {
          points.push([p.x, p.y]);
        });

        const polygon = new Polygon(0, 0, points);

        //attach userData to perform update
        this.update = function (worldtransform) {
          const points = [];
          json.points.forEach(function (p) {
            const point = [
              p.x + worldtransform.position.x,
              p.y + worldtransform.position.y,
            ];
            points.push(point);
            //TODO handle rotation
          });
          polygon.setPoints(points);
        };

        this.shape = polygon;
        break;
      default:
    }

    //ref private to access gameObject from shape collision
    this.shape.gameObject = this.gameObject;
  }
};
