/** @format */

const THREE = require('three');
const ScriptComponent = require('../../../../Shared/GameObject/Components/ScriptComponent');

export class HeightmapModel {
  constructor(gameObjectModel) {
    this.gameObjectModel = gameObjectModel;

    //shader
    this.heightmapMaterial = new THREE.ShaderMaterial({
      uniforms: {
        min: { value: null },
        max: { value: null },
      },

      vertexShader: [
        'varying float viewZ;',

        'void main() {',

        ' viewZ = -(modelViewMatrix * vec4(position.xyz, 1.)).z;',

        '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '}',
      ].join('\n'),

      fragmentShader: [
        'varying float viewZ;',
        'uniform float min;',
        'uniform float max;',

        'void main() {',

        '	float heightValue = 1.0 - (viewZ)/(max - min);',
        '	heightValue = clamp(heightValue, 0.0, 1.0);',
        '	gl_FragColor = vec4( vec3(heightValue) , 1 );',

        '}',
      ].join('\n'),
    });
  }

  computeHeightmapMaterial() {
    this.heightmapMaterial.uniforms.max.value = this.maxPosition().z;
    this.heightmapMaterial.uniforms.min.value = this.minPosition().z;
    return this.heightmapMaterial;
  }

  bindHeightmapGO() {
    const gameobject = this.gameObjectModel.getGameObject();
    const script = gameobject.getComponent(ScriptComponent.TYPE);
    if (!script) throw new Error();
    script.data.heightmap_geometry = this.computeGeoJSON();
  }

  initHeightmap() {
    const gameobject = this.gameObjectModel.getGameObject();
    const defaultpath = 'default_path';
    let script = gameobject.getComponent(ScriptComponent.TYPE);
    if (!script) {
      gameobject.setComponent(
        ScriptComponent.TYPE,
        new ScriptComponent(gameobject, {
          type: ScriptComponent.TYPE,
          idScripts: ['map'],
          data: {
            heightmap_path: defaultpath,
            heightmap_geometry: this.computeGeoJSON(),
          },
        })
      );
    } else {
      if (!script.data) script.data = { heightmap_path: defaultpath };
      script.data.heightmap_geometry = this.computeGeoJSON();
    }
  }

  computeGeoJSON() {
    const bb = this.getBoundingBox();

    return {
      bounding_box: {
        min: {
          x: bb.min.x,
          y: bb.min.y,
          z: bb.min.z,
        },
        max: {
          x: bb.max.x,
          y: bb.max.y,
          z: bb.max.z,
        },
      },
      heightmap_min: this.minPosition().z,
      heightmap_max: this.maxPosition().z,
    };
  }

  getBoundingBox() {
    return this.gameObjectModel.getBoundingBox();
  }

  getScene() {
    return this.gameObjectModel.getScene();
  }

  computeDepthResolution() {
    if (!this.plansAreValid()) return 0;
    const dist = this.planTop.position.z - this.planBottom.position.z;
    return dist / 255; //255 is the number of value possible in heightmap
  }

  minPosition() {
    return this.planBottom.position;
  }

  maxPosition() {
    return this.planTop.position;
  }

  initScene() {
    const bbox = this.getBoundingBox();
    const center = bbox.min.clone().lerp(bbox.max, 0.5);
    const widthO = bbox.max.x - bbox.min.x;
    const heightO = bbox.max.y - bbox.min.y;

    const planGeometry = new THREE.PlaneGeometry(widthO, heightO);
    const matPlan = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: 0x00000,
      //   transparent: true,
      //   opacity: 0.5,
    });

    this.planTop = new THREE.Mesh(planGeometry, matPlan);
    this.planBottom = new THREE.Mesh(planGeometry, matPlan);

    const scene = this.gameObjectModel.getScene();

    scene.add(this.planTop);
    scene.add(this.planBottom);

    //move pos
    this.planBottom.position.copy(center);
    this.planTop.position.copy(center);

    this.movePlanTop(bbox.max.z);
    this.movePlanBottom(bbox.min.z);
  }

  movePlanTop(z) {
    this.planTop.position.z = z;

    this.bindHeightmapGO();
  }

  movePlanBottom(z) {
    this.planBottom.position.z = z;

    this.bindHeightmapGO();
  }

  plansAreValid() {
    const dist = this.planTop.position.z - this.planBottom.position.z;
    return dist > 0;
  }
}
