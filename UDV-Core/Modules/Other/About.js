/**
* adds an "About" window that can be open/closed with a button
* simply include this file in the html, no need to instanciate anything in main.js
*/

var aboutIsActive = false;

//update the html with elements for this class (windows, buttons etc)
var aboutDiv = document.createElement("div");
aboutDiv.id = 'about';
document.body.appendChild(aboutDiv);

document.getElementById("about").innerHTML = '<button id="aboutTab">À PROPOS</button>\
<div id="aboutWindow">\
<br><br><br>\
<p>Ce projet de recherche a été effectué au sein du <a href="https://liris.cnrs.fr/vcity/wiki/doku.php">LIRIS</a>\
 en collaboration avec le laboratoire <a href="http://umr5600.cnrs.fr/fr/accueil/">EVS</a>\
  et supporté par le <a href=http://imu.universite-lyon.fr/>LabEx IMU</a>.</p>\
<p>Ces développements s\'appuient sur <a href="http://www.itowns-project.org/">iTowns</a>\
 et <a href=https://www.3dcitydb.org/3dcitydb/3dcitydbhomepage/>3DCityDB</a>.</p>\
<p>La visite proposée est basée sur le livre \
<a href="http://imu.universite-lyon.fr/le-livre-la-ville-ordinaire-medaille-dor-de-la-societe-francaise-dhistoire-des-hopitaux/">"La Ville Ordinaire"</a>\
 d\'Anne-Sophie Clémençon.</p>\
</div>';

// adjust display
document.getElementById("aboutWindow").style.display = (aboutIsActive)? "block" : "none";

// toggle window on click
document.getElementById("aboutTab").onclick = function () {
    document.getElementById('aboutWindow').style.display = aboutIsActive ? "none" : "block";
    aboutIsActive = aboutIsActive ? false : true;


};
