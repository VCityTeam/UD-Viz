/** @format */

const THREE = require('three');

const world2RefBB = function (point, bb) {
  const result = new THREE.Vector2();

  result.x = 2 * point.x - bb.max.x - bb.min.x;
  result.x /= bb.max.x - bb.min.x;

  result.y = 2 * point.y - bb.max.y - bb.min.y;
  result.y /= bb.max.y - bb.min.y;

  return result;
};

const colorHighlight = 'black';

const Circle = class CircleClass {
  constructor() {
    this.center = new THREE.Vector2();
    this.radius = 0;
    this.isEdited = false;
    this.htmlHover = false;
  }

  clone() {
    return new Circle().fromJSON(this.toJSON());
  }

  mouseUp(point) {
    this.isEdited = false;
  }
  mouseMove(point) {
    if (!this.isEdited || !this.center || !point) return;
    this.radius = this.center.distanceTo(point);
  }
  mouseDown(point) {
    if (!point) return;
    this.isEdited = true;
    this.center = point;
  }

  mouseOver() {
    if (this.htmlHover) return false;
    this.htmlHover = true;
    return true;
  }

  mouseOut() {
    this.htmlHover = false;
    return true;
  }

  draw(ctx, sizeCanvas, color, bb) {
    const offset = new THREE.Vector2(sizeCanvas / 2, sizeCanvas / 2);
    const scale = new THREE.Vector2(sizeCanvas / 2, sizeCanvas / 2);

    const w = bb.max.x - bb.min.x;
    const h = bb.max.y - bb.min.y;

    const scaleRadius = new THREE.Vector2(sizeCanvas / w, sizeCanvas / h);

    const center = world2RefBB(this.center, bb);

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.ellipse(
      center.x * scale.x + offset.x,
      center.y * scale.y + offset.y,
      this.radius * scaleRadius.x,
      this.radius * scaleRadius.y,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
    if (this.htmlHover) {
      ctx.lineWidth = 10;
      ctx.strokeStyle = colorHighlight;
      ctx.stroke();
    }
    ctx.closePath();
  }

  toString() {
    return Circle.TYPE;
  }

  fromJSON(shapeJSON) {
    if (shapeJSON.type != Circle.TYPE) throw new Error();
    this.center = shapeJSON.center;
    this.radius = shapeJSON.radius;
    return this;
  }

  toJSON() {
    return {
      type: Circle.TYPE,
      center: { x: this.center.x, y: this.center.y },
      radius: this.radius,
    };
  }
};

Circle.TYPE = 'Circle';

const Polygon = class PolygonClass {
  constructor() {
    this.points = [];
    this.htmlHover = false;
  }

  clone() {
    return new Polygon().fromJSON(this.toJSON());
  }

  toString() {
    return Polygon.TYPE;
  }

  mouseOver() {
    if (this.htmlHover) return false;
    this.htmlHover = true;
    return true;
  }

  mouseOut() {
    this.htmlHover = false;
    return true;
  }

  draw(ctx, sizeCanvas, color, bb) {
    const offset = new THREE.Vector2(sizeCanvas / 2, sizeCanvas / 2);
    const scale = new THREE.Vector2(sizeCanvas / 2, sizeCanvas / 2);

    const pointsCoord = [];
    this.points.forEach(function (p) {
      pointsCoord.push(world2RefBB(p, bb));
    });

    if (pointsCoord.length) {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(
        pointsCoord[0].x * scale.x + offset.x,
        pointsCoord[0].y * scale.y + offset.y
      );
      for (let i = 1; i < pointsCoord.length; i++) {
        ctx.lineTo(
          pointsCoord[i].x * scale.x + offset.x,
          pointsCoord[i].y * scale.y + offset.y
        );
      }

      ctx.closePath();
      ctx.fill();
      if (this.htmlHover) {
        ctx.lineWidth = 10;
        ctx.strokeStyle = colorHighlight;
        ctx.stroke();
      }

      pointsCoord.forEach(function (point) {
        ctx.beginPath();
        ctx.fillStyle = 'yellow';
        ctx.arc(
          point.x * scale.x + offset.x,
          point.y * scale.y + offset.y,
          1,
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.closePath();
      });
    }
  }
  mouseUp(point) {}
  mouseMove(point) {}
  mouseDown(point) {
    if (!point) return;
    this.points.push(point);
  }

  fromJSON(shapeJSON) {
    if (shapeJSON.type != Polygon.TYPE) throw new Error();
    const points = this.points;
    shapeJSON.points.forEach(function (p) {
      points.push(new THREE.Vector2(p.x, p.y));
    });

    return this;
  }

  toJSON() {
    const points = [];

    this.points.forEach(function (p) {
      points.push({ x: p.x, y: p.y });
    });

    return { type: Polygon.TYPE, points: points };
  }
};

Polygon.TYPE = 'Polygon';

export { Polygon };
export { Circle };
