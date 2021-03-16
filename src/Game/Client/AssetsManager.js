/** @format */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export class AssetsManager {
  constructor() {
    this.models = {};
  }

  fetch(idModel) {
    if (!this.models[idModel]) console.error('no model with id ', idModel);
    return this.models[idModel].clone();
  }

  buildNativeModel() {
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

    const geometryBox = new THREE.BoxGeometry();
    const cube = new THREE.Mesh(geometryBox, material);
    this.models['cube'] = cube;

    const geometrySphere = new THREE.SphereGeometry(1, 32, 32);
    const sphere = new THREE.Mesh(geometrySphere, material);
    this.models['sphere'] = sphere;

    this.buildGizmo();
  }

  buildGizmo() {
    const result = new THREE.Object3D();

    const buildArrowGizmo = function (color, direction, rotation) {
      const scale = 5;
      const height = scale;
      const radius = scale / 20;
      const geo = new THREE.CylinderGeometry(radius, radius, height);
      const material = new THREE.MeshLambertMaterial({ color: color });
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.add(direction.multiplyScalar(height / 2));
      mesh.rotation.copy(rotation);
      return mesh;
    };

    result.add(
      buildArrowGizmo(
        'green',
        new THREE.Vector3(0, 1, 0),
        new THREE.Euler(0, 0, 0)
      )
    );
    result.add(
      buildArrowGizmo(
        'red',
        new THREE.Vector3(1, 0, 0),
        new THREE.Euler(0, 0, Math.PI * 0.5)
      )
    );
    result.add(
      buildArrowGizmo(
        'blue',
        new THREE.Vector3(0, 0, 1),
        new THREE.Euler(Math.PI * 0.5, 0, 0)
      )
    );

    this.models['gizmo'] = result;
  }

  parse(id, obj, anchor) {
    //rotation
    const quatTHREE2UDV = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-Math.PI * 0.5, 0, Math.PI)
    );
    obj.applyQuaternion(quatTHREE2UDV);

    const bbox = new THREE.Box3().setFromObject(obj);
    const parent = new THREE.Object3D();
    switch (anchor) {
      case 'center':
        let center = bbox.min.lerp(bbox.max, 0.5);
        obj.position.sub(center);
        break;
      case 'max':
        obj.position.sub(bbox.max);
        break;
      case 'min':
        obj.position.sub(bbox.min);
        break;
      case 'center_min':
        let centerMin = bbox.min.clone().lerp(bbox.max, 0.5);
        centerMin.z = bbox.min.z;
        obj.position.sub(centerMin);
        break;
      default:
        throw new Error('no anchor');
    }

    parent.add(obj);

    parent.traverse(function (child) {
      if (child.geometry) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.models[id] = parent;
  }

  loadFromConfig(config) {
    //load config file
    const _this = this;
    const loader = new GLTFLoader();
    this.buildNativeModel();

    return new Promise((resolve, reject) => {
      var count = 0;
      for (var idModel in config.models) {
        const id = idModel;
        const modelAnchor = config.models[id].anchor;
        const modelPath = config.models[id].path;
        loader.load(
          modelPath,
          (data) => {
            //parse
            _this.parse(id, data.scene, modelAnchor);

            //check if finish
            count++;
            if (count == Object.keys(config.models).length) {
              console.log('Model loaded ', this.models);
              resolve();
            }
          },
          null,
          reject
        );
      }
    });
  }
}
