import { ColliderComponent } from '@ud-viz/game_shared/src';
import { throttle } from '@ud-viz/utils_shared/src';
import { Box3, Vector3 } from 'three';

export class DebugCollision {
  constructor(gameContext) {
    /** @type {import("@ud-viz/game_shared").Context} */
    this.gameContext = gameContext;

    /** @type {HTMLCanvasElement} */
    this.domElement = document.createElement('canvas');
    this.domElement.width = 512;
    this.domElement.height = 512;

    this.draw = throttle(() => {
      const ctx = this.domElement.getContext('2d');

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, this.domElement.width, this.domElement.height);

      const bb = new Box3();
      this.gameContext.object3D.traverse((child) => {
        const collider = child.getComponent(ColliderComponent.TYPE);
        if (collider) {
          collider.controller.shapeWrappers.forEach((wrapper) => {
            if (wrapper.json.type == ColliderComponent.SHAPE_TYPE.CIRCLE) {
              bb.expandByPoint(
                new Vector3(
                  wrapper.shape.x + wrapper.shape.radius * wrapper.shape.scale,
                  wrapper.shape.y + wrapper.shape.radius * wrapper.shape.scale,
                  0
                )
              );
              bb.expandByPoint(
                new Vector3(
                  wrapper.shape.x - wrapper.shape.radius * wrapper.shape.scale,
                  wrapper.shape.y - wrapper.shape.radius * wrapper.shape.scale,
                  0
                )
              );
            } else {
              // TODO: check how to do the same thing without reading _coords
              for (
                let index = 0;
                index < wrapper.shape._coords.length;
                index += 2
              ) {
                const x = wrapper.shape._coords[index];
                const y = wrapper.shape._coords[index + 1];

                bb.expandByPoint(new Vector3(x, y, 0));
              }
            }
          });
        }
      });

      const maxDim = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y);

      const center = bb.getCenter(new Vector3());

      ctx.save();
      ctx.translate(
        (0.5 - center.x / maxDim) * this.domElement.width,
        (0.5 + center.y / maxDim) * this.domElement.height
      );
      ctx.scale(
        this.domElement.width / maxDim,
        -this.domElement.height / maxDim
      );

      ctx.beginPath();
      this.gameContext.collisions.drawBVH(ctx);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'red';
      ctx.stroke();

      ctx.beginPath();
      this.gameContext.collisions.draw(ctx);
      ctx.fillStyle = 'green';
      ctx.fill();
      ctx.restore();
    }, 100);
  }
}
