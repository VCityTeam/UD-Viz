

import { Views, itowns, THREE } from 'ud-viz';
import THREEUtils from 'ud-viz/src/Game/Shared/Components/THREEUtils';

const View3D = Views.View3D;

let x = 1832891;
let y = 5174952;
let r = 1000;

const extent = new itowns.Extent('EPSG:3946', x - r, x + r, y - r, y + r);
const view = new View3D();
view.initItownsView(extent);

const center = extent.center();

const image = document.createElement('img');
image.src =
  'https://lh3.googleusercontent.com/proxy/-V2q6dQpdGNZw6JMniNsnI1hTItamwP2cXIoQBZQAZhU-NYEXHC39lJd1qJYIcrg8gvrx3tGeyJiPsg6v1A_l4xhWUgZ7O1aRTF9vfZD3ZcmB5Z1qNw6BMikdxzL4UGMMsSk9PRjAXQ6pTiLi3I-7CeobzNbDZ2Nz4dbw4cAlQTAJmWvSj80IbAhjlnk';
view.appendCSS3D(
  image,
  { width: 200, height: 500 },
  new THREEUtils.Transform(
    new THREE.Vector3(center.x, center.y, 50),
    new THREE.Vector3(Math.PI * 0.5, Math.PI * 0.2, 0),
    new THREE.Vector3(2, 2, 2)
  )
);

const geometry = new THREE.SphereGeometry(100, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sphere = new THREE.Mesh(geometry, material);
sphere.position.copy(new THREE.Vector3(center.x + 200, center.y, 50));
sphere.updateMatrixWorld();

view.getItownsView().scene.add(sphere);
