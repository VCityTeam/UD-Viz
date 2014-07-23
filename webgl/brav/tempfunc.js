var fs= require('fs');
var path = require('path');


exports.buildJsonFromTuile = function (x, z, lod){

	var truc= loadConfigTuile(x,z,lod);
	
	var json = '[{"nbBatiment":'+truc.nbOfBuilding+',"listBatiment":{';

	for(var i=1;i<truc.building.length;i++){
		try{
			var file= path.resolve('./ressources/paris/building/Building_'+truc.building[i]+'.json');
			json+=fs.readFileSync(file).toString()
		}catch(err){
			json += '"'+truc.building[i]+'":{}"';
		}
		if(i!=truc.building.length-1)
			json+=','
	}
	
	json +='},"min":['+truc.boundingBoxMin[0]+','+truc.boundingBoxMin[1]+','+truc.boundingBoxMin[2]+'],"max":['+truc.boundingBoxMax[0]+','+truc.boundingBoxMax[1]+','+truc.boundingBoxMax[2]+']}]';
	
	return json;
}


function loadConfigTuile(x,z,lod){

	var boundingBoxMax=new Array();
	var boundingBoxMin=new Array();
	var nbOfBuilding;
	var building= new Array();
	var i=1;

	var file= path.resolve('./ressources/paris/LOD'+lod+'/tiles/tile'+x+'_'+z+'.conf');

	fs.readFileSync(file).toString().split('\n').forEach(function (line) {
		if(i==1){
			var temp = line.split(' ');
			boundingBoxMax[0]= temp[1];
			boundingBoxMax[1]= temp[2];
			boundingBoxMax[2]= temp[3];
		}else if(i==2){
			var temp= line.split(' ');
			boundingBoxMin[0]= temp[1];
			boundingBoxMin[1]= temp[2];
			boundingBoxMin[2]= temp[3];
		}else if(i==3){
			var temp =line.split(' ');
			nbOfBuilding=temp[1];
		}else if(i==4){
			 building=line.split(' ');
		}else{
		}
	i++;	

	});

	return {
		boundingBoxMax: boundingBoxMax,
		boundingBoxMin: boundingBoxMin,
		nbOfBuilding: nbOfBuilding,
		building: building
	}
}

