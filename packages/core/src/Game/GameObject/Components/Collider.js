const { Circle, Polygon } = require('detect-collisions');
const { Model, Controller } = require('./Component');

/**
 * Component used to handle collision of a GameObject
 * Support by detect-collisions npm package
 */
const ColliderModelModule = class ColliderModel extends Model {
  constructor(json) {
    super(json);

    // Shapes in json format
    this.shapesJSON = json.shapes || [];

    // Boolean to know if its a physics collisions or not
    this.body = json.body || false;
  }

  /**
   *
   * @returns {boolean}
   */
  isBody() {
    return this.body;
  }

  /**
   * This component can run on the server side
   *
   * @returns {boolean}
   */
  isWorldComponent() {
    return true;
  }

  /**
   *
   * @param {JSON} json
   */
  setShapesJSON(json) {
    this.shapesJSON = json;
  }

  /**
   *
   * @returns {JSON}
   */
  getShapesJSON() {
    return this.shapesJSON;
  }

  /**
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    return {
      uuid: this.uuid,
      type: ColliderModelModule.TYPE,
      shapes: this.shapesJSON,
      body: this.body,
    };
  }
};

ColliderModelModule.TYPE = 'Collider';

class ColliderController extends Controller {
  constructor(assetsManager, model, parentGO) {
    super(assetsManager, model, parentGO);

    // Shapes wrappers
    this.shapeWrappers = [];
    this.model.getShapesJSON().forEach((shapeJSON) => {
      const wrapper = new ShapeWrapper(this.parentGameObject, shapeJSON);
      this.shapeWrappers.push(wrapper);
    });
  }

  /**
   * Update worldtransform of the shapeWrappers
   */
  update() {
    const worldTransform = this.parentGameObject.computeWorldTransform();
    this.shapeWrappers.forEach(function (b) {
      b.update(worldTransform);
    });
  }

  /**
   *
   * @returns {object}
   */
  getShapeWrappers() {
    return this.shapeWrappers;
  }
}

/**
 * Object to wrap the Polygon and Circle of the detect-collisions npm package
 */
class ShapeWrapper {
  constructor(gameObject, json) {
    // Gameobject of this shapewrapper
    this.gameObject = gameObject;

    // Json
    this.json = json;

    // Shape detect-collisions npm package
    this.shape = null;

    // Init
    this.initFromJSON(json);
  }

  /**
   *
   * @returns {Circle/Polygon}
   */
  getShape() {
    return this.shape;
  }

  /**
   *
   * @returns {GameObject}
   */
  getGameObject() {
    return this.gameObject;
  }

  /**
   * Create Circle/Polygon of detect-collisions
   * then add an update function to update the worldtransform
   * then attach getter function of the gameobject
   *
   * @param {JSON} json
   */
  initFromJSON(json) {
    switch (json.type) {
      case 'Circle':
        {
          const circle = new Circle(
            parseFloat(json.center.x),
            parseFloat(json.center.y),
            parseFloat(json.radius)
          );

          this.update = function (worldtransform) {
            const wp = worldtransform.position;
            circle.x = json.center.x + wp.x;
            circle.y = json.center.y + wp.y;
          };

          this.shape = circle;
        }
        break;
      case 'Polygon':
        {
          const points = [];
          json.points.forEach(function (p) {
            points.push([parseFloat(p.x), parseFloat(p.y)]);
          });

          const polygon = new Polygon(0, 0, points);

          // Attach userData to perform update
          this.update = function (worldtransform) {
            const points = [];
            json.points.forEach(function (p) {
              const wp = worldtransform.position;
              const point = [p.x + wp.x, p.y + wp.y];
              points.push(point);
              // TODO handle rotation
            });
            polygon.setPoints(points);
          };

          this.shape = polygon;
        }
        break;
      default:
    }

    // Add a getter to the gameObject
    this.shape.getGameObject = this.getGameObject.bind(this);
  }
}

module.exports = {
  Model: ColliderModelModule,
  Controller: ColliderController,
};
