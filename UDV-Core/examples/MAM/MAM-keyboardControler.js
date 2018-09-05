'use strict';

document.addEventListener('keydown', (event) => {

  if (event.key === '1') {
	  //Switch the 3D building Layer visibility
	  for (const layer of view.getLayers()) {
		  if (layer.id === 'WFS Bus lines') {
			  layer.visible = !layer.visible;
		}
	}
    return;
  }
  
  if (event.key === '2') {
	  //Switch the BusLine Layer visibility
	  for (const layer of view.getLayers()) {
		  if (layer.id === 'WFS Buildings') {
			  layer.visible = !layer.visible;
		}
	}
    return;
  }
  
  if (event.key === '3') {
	  //Switch the BusLine Layer visibility
	  for (const layer of view.getLayers()) {
		  if (layer.id === 'WMS Pollution Air') {
			  layer.visible = !layer.visible;
		}
	}
    return;
  }

/*  if (event.ctrlKey) {
    // Même si event.key n'est pas 'Control' (par ex., 'a' is pressed),
    // event.ctrlKey peut être true si la touche Ctrl est pressée dans le même temps.
    alert(`Combinaison de ctrlKey + ${nomTouche}`);
  } else {
    alert(`Touche pressée ${nomTouche}`);
  }*/
}, false);
