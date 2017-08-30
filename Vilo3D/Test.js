THREE = itowns.THREE;

var scene, camera, renderer;
var geometry, material, mesh;

var positionCollada = new THREE.Vector3(0,0,0);
console.log("positioncollada" , positionCollada)
init();

var scale = 100;

//var ColladaLoader = require('three-collada-loader');

var object;
   var loadingManager = new THREE.LoadingManager( function() {         } );
   var loader = new THREE.ColladaLoader(loadingManager);
     //loader.options.convertUpAxis = true;
        loader.load( 'elf/elf.dae', function ( collada ) {
            object = collada.scene;
            collada.scene.traverse( function(node) {
					if (node instanceof THREE.Mesh) {
						//scene.add(node);
                        console.log("node",node);
					}});
            object.scale.set( scale, scale, scale );
     object.position.set(positionCollada.x, positionCollada.y, positionCollada.z);
     scene.add( object );
     console.log(positionCollada);
     object.updateMatrixWorld();
        } );

    var geometry = new THREE.BoxGeometry( 5, 5, 5 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.copy(positionCollada);
    cube.updateMatrixWorld();
    //scene.add( cube );

var AmbientLight = new THREE.AmbientLight( 0xffffff,0.5 );
  AmbientLight.position.set(449588.55700000003, 6200917.614, 3454.564500000003 + 1000 ).normalize();
  scene.add( AmbientLight );

  var DirLight = new THREE.DirectionalLight( 0xffffff ,2);
    //DirLight.position.set(449588.55700000003, 6200917.614, 3454.564500000003 + 1000 ).normalize();
    scene.add( DirLight );


animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 500;

    geometry = new THREE.BoxGeometry( 100, 100, 100 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true} );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    scene.background = new THREE.Color( 0xbfd1e5 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

}

function animate() {

    requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render( scene, camera );

}
