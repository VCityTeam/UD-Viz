

// CALL TO SETUP DATES & LOAD COLLADA BUILDINGS for Ilot du Lac (IDL)
var SetupIlotDuLac = function SetupIlotDuLac(){

    idlDates.push(new Date("1725-01-01"));
    idlDates.push(new Date("1812-01-01"));
    idlDates.push(new Date("1851-01-01"));
    idlDates.push(new Date("1860-01-01"));
    idlDates.push(new Date("1880-01-01"));
    idlDates.push(new Date("1895-01-01"));
    idlDates.push(new Date("1968-01-01"));
    idlDates.push(new Date("1971-01-01"));

    var loader = new THREE.ColladaLoader();
    var idlPosition = new THREE.Vector3(1844025, 5175788, 192);
    var idlPosition2 = idlPosition.clone().sub(new THREE.Vector3(0,0,20));
    var offsetpos = new THREE.Vector3(-6526.33,-6788.71,-190);
    var amountToLoad = 8;
    var amountLoaded = 0;
    var allLoadedEventSent = false;

    var onModelLoad = function onModelLoad(array, index, position, scale) {
        const offset = new THREE.Vector3();
        let object;
        return ( collada ) => {
            object = collada.scene;
            object.scale.set( scale, scale, scale );
            array[index] = object;
            array[index].position.set(position.x, position.y, position.z);
            array[index].rotation.x = 0 ;
            array[index].updateMatrixWorld();
            amountLoaded += 1;
            if(amountLoaded === amountToLoad && !allLoadedEventSent){
                // if all models have been loaded, dispatch the allModelsLoadedEvent
                window.dispatchEvent(allModelsLoadedEvent);
                allLoadedEventSent = true;
            }
        };
    };
    // event telling us that all models have been loaded
    var allModelsLoadedEvent = document.createEvent('Event');
    allModelsLoadedEvent.initEvent('allModelsLoaded', true, true);

    // load the models in the array and assign them a position and scale
    // use : loader.load(pathToModel, onModelLoad(array, index, position, scale)
    loader.load('Models/IDL/Etape0/IDL_Etape0.dae', onModelLoad(idlBuildings,0,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape0bis/IDL_Etape0bis.dae', onModelLoad(idlBuildings,1,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape1/IDL_Etape1.dae', onModelLoad(idlBuildings,2,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape2/IDL_Etape2.dae', onModelLoad(idlBuildings,3,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape3/IDL_Etape3.dae', onModelLoad(idlBuildings,4,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape4/IDL_Etape4.dae', onModelLoad(idlBuildings,5,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape5/IDL_Etape5.dae', onModelLoad(idlBuildings,6,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape6/IDL_Etape6.dae', onModelLoad(idlBuildings,7,idlPosition.clone().add(offsetpos),1.0) );
    //============================================================================================
}
