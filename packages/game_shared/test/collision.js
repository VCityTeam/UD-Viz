const { ScriptBase, Context, Object3D } = require('../src/index');
const { ProcessInterval } = require('@ud-viz/utils_shared');
const THREE = require('three');

const Script1 = class extends ScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    this.onEnterDone = false;
    this.isCollidingDone = false;
  }

  onEnterCollision() {
    if (this.onEnterDone) throw new Error('on enter already done');
    if (this.isCollidingDone) throw new Error('iscolliding already done');

    this.onEnterDone = true;
  }

  isColliding() {
    if (!this.onEnterDone) throw new Error('on enter was not done');
    this.isCollidingDone = true;
  }

  onLeaveCollision() {
    if (!this.onEnterDone) throw new Error('on enter was not done');
    if (!this.isCollidingDone) throw new Error('iscolliding was not done');

    // test succeed
    process.exit(0);
  }

  static get ID_SCRIPT() {
    return 'Collision';
  }
};

const Script2 = class extends ScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    this.object1 = null;
    this.object2 = null;
  }

  load() {
    return new Promise((resolve) => {
      this.object1 = this.createCollider(
        'object1',
        new THREE.Vector3(10, 0, 0),
        false
      );
      this.object1.uuid = 'object1';

      this.object2 = this.createCollider(
        'object2',
        new THREE.Vector3(0, 0, 0),
        true
      );
      this.object2.uuid = 'object2';

      this.context.addObject3D(this.object1).then(() => {
        this.context.addObject3D(this.object2).then(() => {
          resolve();
        });
      });
    });
  }

  tick() {
    this.object1.position.x -= 0.01 * this.context.dt;
  }

  createCollider(name, position, isStatic) {
    const result = new Object3D({
      object: {
        static: isStatic,
        name: name,
        components: {
          Collider: {
            shapes: [{ type: 'Circle', center: { x: 0, y: 0 }, radius: 1 }],
            body: false,
          },
          GameScript: {
            idScripts: [Script1.ID_SCRIPT],
          },
        },
      },
    });

    result.position.copy(position);

    return result;
  }

  static get ID_SCRIPT() {
    return 'Collision Test';
  }
};

const gameContext = new Context(
  [Script1, Script2],
  new Object3D({
    object: {
      uuid: 'root',
      name: 'Collision Test',
      components: {
        GameScript: {
          idScripts: [Script2.ID_SCRIPT],
        },
      },
    },
  })
);

gameContext.load().then(() => {
  const processInterval = new ProcessInterval({ fps: 51 });
  processInterval.start((dt) => {
    gameContext.step(dt);
  });
});
