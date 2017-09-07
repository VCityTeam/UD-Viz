var aboutIsActive = false;

//update the html with elements for this class (windows, buttons etc)
var aboutDiv = document.createElement("div");
aboutDiv.id = 'about';
document.body.appendChild(aboutDiv);

document.getElementById("about").innerHTML = '    <button id="aboutTab">À PROPOS</button>\
<div id="aboutWindow">\
<br><br><br>\
<p>Vilo3D est une application %%%%%%%%%%%%%%%</p>\
<p>Ce projet est une collaboration LIRIS CNRS</p>\
<p>Framework itowns</p>\
<p>Texte texte texte Texte texte texte</p>\
</div>';

// adjust display
document.getElementById("aboutWindow").style.display = (aboutIsActive)? "block" : "none";

// toggle window on click
document.getElementById("aboutTab").onclick = function () {
    document.getElementById('aboutWindow').style.display = aboutIsActive ? "none" : "block";
    aboutIsActive = aboutIsActive ? false : true;


};
