const { polygon2DArea } = require('@ud-viz/utils_shared');
const { Component, Model, Controller } = require('./Component');

const { Circle, Polygon } = require('detect-collisions');
const { Euler, Vector3, Quaternion } = require('three');

/**
 * Collider object3D component, this component use {@link https://www.npmjs.com/package/detect-collisions}, note that collisions are handle in 2D
 *
 * @see module:Collider
 * @class
 */
const ColliderComponent = class extends Component {};

ColliderComponent.TYPE = 'Collider';
ColliderComponent.SHAPE_TYPE = {
  CIRCLE: 'Circle',
  POLYGON: 'Polygon',
};

/**
 * @see module:Collider
 * @class
 */
const ColliderModel = class extends Model {
  /**
   * Model of a collider component
   *
   * @param {object} json - object to configure collider model
   * @param {string} json.uuid - uuid collider model
   * @param {Array<PolygonJSON|CircleJSON>} [json.shapes] - shapes of collisions
   * @param {boolean} json.body - if true this is a physics collisions
   * @todo body should be handle by context (meaning context move according the physic of the collision)
   */
  constructor(json) {
    super(json);

    /**
     * shapes of collisions
     *
     * @type {Array<PolygonJSON|CircleJSON>}
     */
    this.shapesJSON = json.shapes || [];

    /**
     * if true this is a physics collision
     *
     * @type {boolean}
     */
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

/**
 * @see module:Collider
 * @class
 */
class ColliderController extends Controller {
  /**
   * Controller collider component
   *
   * @param {ColliderModel} model - model controller
   * @param {import("../Object3D").Object3D} object3D - object3D parent of this collider component
   */
  constructor(model, object3D) {
    super(model, object3D);

    /**
     * shapes wrapper {@link ShapeWrapper}
     *
     * @type {ShapeWrapper}
     */
    this.shapeWrappers = [];

    /**  initialize shape wrapper from model shapesJSON */
    this.model.getShapesJSON().forEach((shapeJSON) => {
      const wrapper = new ShapeWrapper(
        this.object3D,
        shapeJSON,
        this.model.isBody()
      );
      this.shapeWrappers.push(wrapper);
    });
  }

  /**
   * Update worldtransform of the shapeWrappers
   *
   * @param {Vector3} offset - offset of the collider system
   */
  update(offset) {
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();
    this.object3D.updateMatrixWorld();
    this.object3D.matrixWorld.decompose(position, quaternion, scale);

    // collision referential is offseted so detect-collision deals with small number
    position.sub(offset);

    this.shapeWrappers.forEach((b) => {
      b.update(position, new Euler().setFromQuaternion(quaternion), scale);
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

/**
 * @class
 */
class ShapeWrapper {
  /**
   * Wrap {@link Polygon} or {@link Circle} of {@link https://www.npmjs.com/package/detect-collisions}
   *
   * @param {object} object3D - object 3D parent of the controller collider
   * @param {PolygonJSON|CircleJSON} json - shapeJSON
   * @param {boolean} body - shape body
   */
  constructor(object3D, json, body) {
    /**
     * object3D parent of the controller collider
     *
     * @type {object}
     */
    this.object3D = object3D;

    /**
     * shape JSON
     *
     * @type {PolygonJSON|CircleJSON}
     */
    this.json = json;

    /** @type {boolean} */
    this.body = body; // TODO shape of detect have a isStatic attr

    /**
     * {@link Circle} or {@link Polygon} of {@link https://www.npmjs.com/package/detect-collisions}
     *
     * @type {Polygon|Circle}
     */
    this.shape = null;
    this.initShapeFromJSON(json);
  }

  /**
   *
   * @returns {boolean} - body
   */
  isBody() {
    return this.body;
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
      case ColliderComponent.SHAPE_TYPE.CIRCLE:
        {
          const circle = new Circle(
            parseFloat(json.center.x),
            parseFloat(json.center.y),
            parseFloat(json.radius)
          );

          /**
           * update world transform of shape
           *
           * @param {{x:number,y:number}} worldPosition - world position
           * @param {*} worldRotation - world rotation useless here since this is not an ellipse but a circle
           * @param {{x:number,y:number}} worldScale - world scale
           */
          this.update = (worldPosition, worldRotation, worldScale) => {
            circle.x = json.center.x + worldPosition.x;
            circle.y = json.center.y + worldPosition.y;
            circle.scale = Math.max(worldScale.x, worldScale.y); // take the bigger scale
          };

          this.shape = circle;
        }
        break;
      case ColliderComponent.SHAPE_TYPE.POLYGON:
        {
          const points = [];
          json.points.forEach((p) => {
            points.push([parseFloat(p.x), parseFloat(p.y)]);
          });

          if (
            polygon2DArea(
              points.map((el) => {
                return { x: el[0], y: el[1] };
              })
            ) < 0
          )
            points.reverse(); // if area is negative it means polygon points are in the wrong order

          const polygon = new Polygon(0, 0, points);

          /**
           * update world transform of shape
           *
           * @param {{x:number,y:number}} worldPosition - world position
           * @param {{z:number}} worldRotation - world rotation
           * @param {{x:number,y:number}} worldScale - world scale
           */
          this.update = (worldPosition, worldRotation, worldScale) => {
            polygon.x = worldPosition.x;
            polygon.y = worldPosition.y;
            polygon.angle = worldRotation.z;
            polygon.scale_x = worldScale.x;
            polygon.scale_y = worldScale.y;
          };

          this.shape = polygon;
        }
        break;
      default:
    }

    // attach a getter to the shape so its object3D attach can be access in colllide result {@link Context}
    this.shape.getWrapper = () => {
      return this;
    };
  }
}

/**
 * `MODULE` Collider
 *
 * @exports Collider
 */

module.exports = {
  /** @see ColliderComponent */
  Component: ColliderComponent,
  /** @see ColliderModel */
  Model: ColliderModel,
  /** @see ColliderController */
  Controller: ColliderController,
};
