import { HeightmapElement } from './html';
import {
  Vector2,
  OrthographicCamera,
  Box3,
  Uniform,
  ShaderMaterial,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
} from 'three';
import { insert, EPSILON } from '@ud-viz/utils_shared';
import { imageToImageData } from './canvas';
import { PlanarView } from 'itowns';
import { createLocalStorageCheckbox, makeVisible } from '@ud-viz/utils_browser';

/**
 *
 * @param {PlanarView} view
 * @param {Box3} box3
 * @param {Vector2} size
 * @returns {String} - serialized image data
 */
export function box3ToHeightmap(view, box3, size = DEFAULT_HEIGHTMAP_SIZE) {
  let result;

  // everything except TileMesh are invisible
  view.scene.traverse((child) => {
    child.userData._bufferVisible = child.visible;
    child.visible = false;
  });

  const box3DimZ = box3.max.z - box3.min.z;
  const box3DimY = box3.max.y - box3.min.y;
  const box3DimX = box3.max.x - box3.min.x;

  // computing elevation
  {
    const camera = new OrthographicCamera(
      -box3DimX * 0.5,
      box3DimX * 0.5,
      box3DimY * 0.5,
      -box3DimY * 0.5,
      EPSILON,
      box3DimZ + EPSILON
    );
    box3.getCenter(camera.position);
    camera.position.z += box3DimZ * 0.5;

    const visibles = [];

    const planarTileMesh = view.scene.getObjectByName('planar');
    if (!planarTileMesh) console.error('no planar found');

    planarTileMesh.traverse((child) => {
      if (!child.isTileMesh) return;

      visibles.push(child);

      // record to restore after rendering
      child.userData._bufferMaterial = child.material;

      // create heightmap material could be optimized by creating one material per layer
      child.material = child.material.clone();

      // customize vertex and fragment shader

      // declare varying viewZ in vertex
      child.material.vertexShader = insert(
        child.material.vertexShader,
        child.material.vertexShader.indexOf('void main()'),
        ['varying float viewZ;', ''].join('\n')
      );

      // send it to fragment (interpolation/rasterization)
      child.material.vertexShader = insert(
        child.material.vertexShader,
        child.material.vertexShader.lastIndexOf('}'),
        ['viewZ = -mvPosition.z;', ''].join('\n') // see https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/project_vertex.glsl.js where mvPosition is declared and is the position in the view referential (just before being project on screen/glPosition)
      );

      // declaration of the later varying + 2 uniforms heightmapMin and heightmapMax used to normalize pixel value
      child.material.fragmentShader = insert(
        child.material.fragmentShader,
        child.material.fragmentShader.indexOf('void main()'),
        [
          'varying float viewZ;',
          'uniform float heightmapMin;',
          'uniform float heightmapMax;',
          '',
        ].join('\n')
      );

      // computation of glFragColor/heightmap result
      child.material.fragmentShader = insert(
        child.material.fragmentShader,
        child.material.fragmentShader.lastIndexOf('}'),
        [
          '	float heightValue = (viewZ)/(heightmapMax - heightmapMin);',
          '	heightValue = clamp(heightValue, 0.0, 1.0);',
          '	gl_FragColor = vec4( vec3(heightValue) , 1 );',
          '',
        ].join('\n')
      );

      // normalize z/height in box referential
      child.material.uniforms.heightmapMax = new Uniform(box3.max.z);
      child.material.uniforms.heightmapMin = new Uniform(box3.min.z);
    });

    // 3DTiles heightmap material
    const heightmapMaterial = new ShaderMaterial({
      uniforms: {
        min: {
          value: box3.min.z,
        },
        max: {
          value: box3.max.z,
        },
      },

      vertexShader: [
        'varying float viewZ;',
        'void main() {',
        ' viewZ = -(modelViewMatrix * vec4(position.xyz, 1.0)).z;',
        '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}',
      ].join('\n'),

      fragmentShader: [
        'varying float viewZ;',
        'uniform float min;',
        'uniform float max;',
        'void main() {',
        '	float heightValue = (viewZ)/(max - min);',
        '	heightValue = clamp(heightValue, 0.0, 1.0);',
        '	gl_FragColor = vec4( vec3(heightValue) , 1 );',
        '}',
      ].join('\n'),
    });

    // apply heightmap material on 3DTiles
    view
      .getLayers((l) => l.isC3DTilesLayer)
      .forEach((layer) => {
        visibles.push(layer.object3d);
        layer.object3d.traverse((child) => {
          if (child.material) {
            child.userData._bufferMaterial = child.material;
            child.material = heightmapMaterial;
          }
        });
      });

    visibles.forEach((v) => makeVisible(v));

    // lego world size + render
    const bufferSize = view.renderer.getSize(new Vector2());
    view.renderer.setSize(size.x, size.y); // lego world size.xy = box.size.xy / hsize.xy size.z = heightmap value / box.size.z
    view.renderer.render(view.scene, camera);
    result = view.renderer.domElement.toDataURL(); // serialize image on screen
    view.renderer.setSize(bufferSize.x, bufferSize.y); // restore renderer state

    // restore planarTileMesh state
    planarTileMesh.traverse((child) => {
      if (!child.isTileMesh) return;
      child.material = child.userData._bufferMaterial;
      // clean for GC optimize with a cache ?
      delete child.userData._bufferMaterial;
    });

    // restore 3DTiles material
    view
      .getLayers((l) => l.isC3DTilesLayer)
      .forEach((layer) =>
        layer.object3d.traverse((child) => {
          if (child.material) {
            child.material = child.userData._bufferMaterial;
            delete child.userData._bufferMaterial;
          }
        })
      );
  }

  // reset visibility
  view.scene.traverse((child) => {
    child.visible = child.userData._bufferVisible;
    delete child.userData._bufferVisible;
  });

  return result;
}

export class Heightmap {
  constructor(name) {
    this.name = name;

    this.domElement = new HeightmapElement();
    this.domElement.title = name;

    this.box3Wireframe = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({ wireframe: true, color: 'blue' })
    );

    this.checkboxVisibilityBoxWireframe = createLocalStorageCheckbox(
      'heightmap_checkbox',
      'heightmap box3 visible',
      this.domElement,
      false
    );

    this._box3 = null;

    this._min = null;
    this._max = null;

    this.array = null;
  }

  set box3(value) {
    this._box3 = value;
    this.domElement.box3 = value;
  }

  get box3() {
    return this._box3;
  }

  set min(value) {
    this._min = value;
    this.domElement.min = value;
  }

  get min() {
    return this._min;
  }

  get max() {
    return this._max;
  }

  set max(value) {
    this._max = value;
    this.domElement.max = value;
  }

  async load(view, box3, size, scaleHeight = 1) {
    this.box3 = box3.clone();

    // ui to visualize box3 in scene
    {
      this.checkboxVisibilityBoxWireframe.checked = false;
      this.box3Wireframe.removeFromParent();
      this.checkboxVisibilityBoxWireframe.onchange = () => {
        if (this.checkboxVisibilityBoxWireframe.checked) {
          this.box3.getCenter(this.box3Wireframe.position);
          this.box3Wireframe.scale.set(
            this.box3.max.x - this.box3.min.x,
            this.box3.max.y - this.box3.min.y,
            this.box3.max.z - this.box3.min.z
          );
          this.box3Wireframe.updateMatrixWorld();
          if (!this.box3Wireframe.parent) view.scene.add(this.box3Wireframe);
        } else {
          this.box3Wireframe.removeFromParent();
        }
        view.notifyChange();
      };
    }

    this.domElement.img.src = box3ToHeightmap(view, this.box3, size);

    return new Promise((resolve, reject) => {
      // could be optimize with mipmap
      this.domElement.img.onload = () => {
        const data = imageToImageData(this.domElement.img);

        let min = Infinity;
        let max = -Infinity;

        let i = 0;
        let j = 0;
        this.array = new Array(this.domElement.img.naturalHeight);
        for (let k = 0; k < this.array.length; k++) {
          this.array[k] = new Array(this.domElement.img.naturalWidth);
        }
        // spacialize values in 2D
        for (let index = 0; index < data.length; index += 4) {
          // heightmap array = (pixel value / 255) * box dim z
          j = Math.floor(index / 4 / this.domElement.img.naturalWidth);
          i = index / 4 - j * this.domElement.img.naturalWidth;

          this.array[j][i] =
            data[index + 3] != 0
              ? this.box3.max.z -
                (data[index] / 255) * (this.box3.max.z - this.box3.min.z)
              : this.box3.min.z;

          if (this.array[j][i] > max) max = this.array[j][i];
          if (this.array[j][i] < min) min = this.array[j][i];
        }

        for (let k = 0; k < this.array.length; k++) {
          for (let l = 0; l < this.array[k].length; l++) {
            this.array[k][l] -= min;
            this.array[k][l] *= scaleHeight;
          }
        }

        this.min = min;
        this.max = max;

        view.notifyChange();
        resolve(true);
      };

      this.domElement.img.onerror = reject;
    });
  }
}
