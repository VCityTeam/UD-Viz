/**
 * Class: DocumentBillboard
 * Description :
 * The DocumentBrowser is an object in charge of displaying documents in the form of billboards
 * WORK IN PROGRESS
 */
import { MAIN_LOOP_EVENTS } from 'itowns';

export function DocumentBillboard(documentController)
{

  this.frustum = new THREE.Frustum();

  this.documentController = documentController;
  this.billboards = [];
  this.windowIsActive = false;
  this.billboardsAreActive = false;

  this.newRenderer;

  this.activateBillboards = function activateBillboards(active)
  {
    if (typeof active != 'undefined')
    {
      this.billboardsAreActive = active;
    }
    this.billboardsActive = active ? true : false;
    this.toggleBillboards();
  }

  this.refresh = function refresh()
  {
    this.activateBillboards(this.billboardsAreActive);
  }

  this.toggleBillboards = function toggleBillboards(){
    if(this.billboardsAreActive){
      this.billboardsAreActive = false;
      this.hideBillboards();
    }
    else {
      this.billboardsAreActive = true;
      this.showBillboards();
    }
    this.documentController.view.notifyChange(true);
  }

  this.initialize = function initialize(){

    this.newRenderer = new THREE.WebGLRenderer();
    this.newRenderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.newRenderer.domElement);

    this.createSetOfBillboards();

  }

  this.createBillboard = function createBillboard(doc){

    var object, material;
    var objGeometry = new THREE.PlaneGeometry(12,10);
    var texture = new THREE.TextureLoader().load(this.documentController.url + this.documentController.folder +  doc.metaData.link);
    material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
    object = new THREE.Mesh(objGeometry.clone(), material);
    this.billboards.push(object);
    object.scale.set(50,50,50);
    object.quaternion.copy( this.documentController.view.camera.camera3D.quaternion );//face camera when created. Then
    object.position.x=doc.visualization.positionX;
    object.position.y= doc.visualization.positionY;
    object.position.z= 626;
    object.updateMatrixWorld();
    this.documentController.view.scene.add(object);
    //object.visible = false;
  }

  this.createSetOfBillboards = function createSetOfBillboards(){

    this.documentController.getDocuments();

    this.documentController.setOfDocuments.forEach((document) => {
      this.createBillboard(document);
    });
  }

  this.showBillboards = function showBillboards(){
    this.billboards.forEach((element)=>{
      element.traverse(function ( object ) { object.visible = true; }) ;
      element.updateMatrixWorld();
    });
  }

  this.hideBillboards = function hideBillboards(){
    this.billboards.forEach((billboard) => {
      billboard.visible = false ;
    });
  }

  this.changeAltitude = function changeAltitude(billboard){

  }

  this.updateBillboardOrientation = function updateBillboardOrientation(){
    for(var i = 0; i<this.billboards.length;i++){
      this.billboards[i].quaternion.copy( this.documentController.view.camera.camera3D.quaternion );
      this.billboards[i].updateMatrixWorld();

  //    var posImg = new THREE.Vector3(this.billboards[i].position.x,this.billboards[i].position.y,this.billboards[i].position.z);
    //  var pos = this.documentController.view.camera.camera3D.position;
      //var d = posImg.distanceTo(pos)
      //console.log(d)

//https://stackoverflow.com/questions/10858599/how-to-determine-if-plane-is-in-three-js-camera-frustum

    }
    this.toScreenPosition(this.billboards[0]);
  }

  this.toScreenPosition = function toScreenPosition(obj){

    var vector = new THREE.Vector3();

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(this.documentController.view.camera.camera3D);

    var widthHalf = 0.5*this.newRenderer.context.canvas.width;
    var heightHalf = 0.5*this.newRenderer.context.canvas.height;

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    //  console.log('x',vector.x)
    //    console.log('y',vector.y)
  }

  this.documentController.controls.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,this.updateBillboardOrientation.bind(this) );

  this.initialize();
}
