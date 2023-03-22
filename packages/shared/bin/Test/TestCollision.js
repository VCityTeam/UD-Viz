const Shared = require('../../src/index');
const THREE = require('three');

const Script1 = class extends Shared.Game.ScriptBase {
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

  static get CLASS_ID() {
    return 'Collision';
  }
};

const Script2 = class extends Shared.Game.ScriptBase {
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
    const result = new Shared.Game.Object3D({
      object: {
        static: isStatic,
        name: name,
        components: {
          Collider: {
            shapes: [{ type: 'Circle', center: { x: 0, y: 0 }, radius: 1 }],
            body: false,
          },
          GameScript: {
            idScripts: [Script1.CLASS_ID],
          },
        },
      },
    });

    result.position.copy(position);

    return result;
  }

  static get CLASS_ID() {
    return 'Collision Test';
  }
};

const gameContext = new Shared.Game.Context(
  [Script1, Script2],
  new Shared.Game.Object3D({
    object: {
      uuid: 'root',
      name: 'Collision Test',
      components: {
        GameScript: {
          idScripts: [Script2.CLASS_ID],
        },
      },
    },
  })
);

gameContext.load().then(() => {
  const processInterval = new Shared.ProcessInterval({ fps: 51 });
  processInterval.start((dt) => {
    gameContext.step(dt);
  });
});
