export function DocumentBillboard( browserContainer ) {

this.windowIsActive =true;

  this.update = function update(){
  }

  this.refresh = function refresh(){
    this.activateWindow( this.windowIsActive );
  }


  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
  }

}
