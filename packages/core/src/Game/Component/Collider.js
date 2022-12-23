const { Circle, Polygon } = require('detect-collisions');
const {
  Component,
  ModelComponent,
  ControllerComponent,
} = require('./Component');
const THREE = require('three');

const ColliderComponent = class extends Component {};

ColliderComponent.TYPE = 'Collider';

/**
 * Component used to handle collision of a GameObject
 * Support by detect-collisions npm package
 */
const ColliderModel = class extends ModelComponent {
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
      type: ColliderModel.TYPE,
      shapes: this.shapesJSON,
      body: this.body,
    };
  }
};

class ColliderController extends ControllerComponent {
  constructor(model, object3D) {
    super(model, object3D);

    // Shapes wrappers
    this.shapeWrappers = [];
    this.model.getShapesJSON().forEach((shapeJSON) => {
      const wrapper = new ShapeWrapper(this.object3D, shapeJSON);
      this.shapeWrappers.push(wrapper);
    });
  }

  /**
   * Update worldtransform of the shapeWrappers
   */
  update() {
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    this.object3D.updateMatrixWorld();
    this.object3D.matrixWorld.decompose(position, quaternion, scale);

    this.shapeWrappers.forEach((b) => {
      b.update(position);
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
  constructor(object3D, json) {
    // Gameobject of this shapewrapper
    this.object3D = object3D;

    // Json
    this.json = json;

    // Shape detect-collisions npm package
    this.shape = null;

    // Init
    this.initShapeFromJSON(json);
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
  getObject3D() {
    return this.object3D;
  }

  /**
   * Create Circle/Polygon of detect-collisions
   * then add an update function to update the worldtransform
   * then attach getter function of the gameobject
   *
   * @param {JSON} json
   */
  initShapeFromJSON(json) {
    switch (json.type) {
      case 'Circle':
        {
          const circle = new Circle(
            parseFloat(json.center.x),
            parseFloat(json.center.y),
            parseFloat(json.radius)
          );

          this.update = (origin) => {
            circle.x = json.center.x + origin.x;
            circle.y = json.center.y + origin.y;
          };

          this.shape = circle;
        }
        break;
      case 'Polygon':
        {
          const points = [];
          json.points.forEach((p) => {
            points.push([parseFloat(p.x), parseFloat(p.y)]);
          });

          const polygon = new Polygon(0, 0, points);

          // Attach userData to perform update
          this.update = function (origin) {
            const points = [];
            json.points.forEach(function (p) {
              const point = [p.x + origin.x, p.y + origin.y];
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

    // Add a getter to the object3D
    this.shape.getObject3D = this.getObject3D.bind(this);
  }
}

module.exports = {
  Component: ColliderComponent,
  Model: ColliderModel,
  Controller: ColliderController,
};
