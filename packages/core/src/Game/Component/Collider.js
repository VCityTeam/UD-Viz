const { Circle, Polygon } = require('detect-collisions');
const { Component, Model, Controller } = require('./Component');
const THREE = require('three');

/**
 * Collider object3D component, this component use {@link https://www.npmjs.com/package/detect-collisions}, note that collisions are handle in 2D
 */
const ColliderComponent = class extends Component {};

ColliderComponent.TYPE = 'Collider';

/**
 * @typedef {object} PolygonJSON - json object to configure {@link Polygon} of {@link https://www.npmjs.com/package/detect-collisions}
 * @property {string} type - to identify this is a Polygon must be equal to "Polygon"
 * @property {Array<{x,y}>} points - points of the polygon
 */

/**
 * @typedef {object} CircleJSON - json object to configure {@link Circle} of {@link https://www.npmjs.com/package/detect-collisions}
 * @property {string} type - to identify this is a Circle must be equal to "Circle"
 * @property {{x,y}} center - center of the circle
 * @property {number} radius - radius of the circle
 */

const ColliderModel = class extends Model {
  /**
   * Model of a collider component
   *
   * @param {object} json - object to configure collider model
   * @param {string} json.uuid - uuid collider model
   * @param {Array<PolygonJSON|CircleJSON>=} json.shapes - shapes of collisions
   * @param {boolean} json.body - if true this is a physics collisions
   * @todo body should be handle by context (meaning context move according the physic of the collision)
   */
  constructor(json) {
    super(json);

    /** @type {Array<PolygonJSON|CircleJSON>} - shapes of collisions */
    this.shapesJSON = json.shapes || [];

    /** @type {boolean} - if true this is a physics collision */
    this.body = json.body || false;
  }

  /**
   *
   * @returns {boolean} - body of collider model
   */
  isBody() {
    return this.body;
  }

  /**
   *
   * @returns {Array<PolygonJSON|CircleJSON>} - shapes json of collider model
   */
  getShapesJSON() {
    return this.shapesJSON;
  }

  /**
   *
   * @returns {object} - export collider model to json object
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

class ColliderController extends Controller {
  /**
   * Controller collider component
   *
   * @param {ColliderModel} model - model controller
   * @param {object} object3D - object3D parent of this collider component
   */
  constructor(model, object3D) {
    super(model, object3D);

    /** @type {ShapeWrapper[]} - shapes wrapper {@link ShapeWrapper} */
    this.shapeWrappers = [];

    // initialize shape wrapper from model shapesJSON
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
   * @returns {ShapeWrapper[]} - shape wrappers of controller
   */
  getShapeWrappers() {
    return this.shapeWrappers;
  }
}

class ShapeWrapper {
  /**
   * Wrap {@link Polygon} or {@link Circle} of {@link https://www.npmjs.com/package/detect-collisions}
   *
   * @param {object} object3D - object 3D parent of the controller collider
   * @param {PolygonJSON|CircleJSON} json - shapeJSON
   */
  constructor(object3D, json) {
    /** @type {object} - object3D parent of the controller collider */
    this.object3D = object3D;

    /** @type {PolygonJSON|CircleJSON} - shape JSON */
    this.json = json;

    /** @type {Polygon|Circle} - {@link Circle} or {@link Polygon} of {@link https://www.npmjs.com/package/detect-collisions} */
    this.shape = null;
    this.initShapeFromJSON(json);
  }

  /**
   *
   * @returns {Polygon|Circle} - shape of {@link https://www.npmjs.com/package/detect-collisions}
   */
  getShape() {
    return this.shape;
  }

  /**
   *
   * @returns {object} - object3D of shape wrapper
   */
  getObject3D() {
    return this.object3D;
  }

  /**
   * Initialize shape of {@link https://www.npmjs.com/package/detect-collisions} and update method then attach a getter to the object3D to the shape
   *
   * @param {PolygonJSON|CircleJSON} json - shape json
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

          /**
           * update world transform of shape
           *
           * @param {{x:number,y:number}} origin - origin in world
           */
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

          /**
           * update world transform of shape
           *
           * @param {{x:number,y:number}} origin - origin in world
           * @todo rotation is not handle
           */
          this.update = function (origin) {
            const points = [];
            json.points.forEach(function (p) {
              const point = [p.x + origin.x, p.y + origin.y];
              points.push(point);
            });
            polygon.setPoints(points);
          };

          this.shape = polygon;
        }
        break;
      default:
    }

    /**
     * attach a getter to the shape so its object3D attach can be access in colllide result {@link Context}
     */
    this.shape.getObject3D = this.getObject3D.bind(this);
  }
}

module.exports = {
  Component: ColliderComponent,
  Model: ColliderModel,
  Controller: ColliderController,
};
