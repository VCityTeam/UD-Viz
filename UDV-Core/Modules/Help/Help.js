var helpIsActive = false;

//update the html with elements for this class (windows, buttons etc)
var helpDiv = document.createElement("div");
helpDiv.id = 'help';
document.body.appendChild(helpDiv);

document.getElementById("help").innerHTML = '    <button id="helpTab">AIDE</button>\
<div id="helpWindow">\
<p>Contrôles caméra</p>\
<ul>\
<li>Clic-gauche : déplacement par rapport au sol</li>\
<li>Clic-droit : déplacement vertical/latéral</li>\
<li>Ctrl + Clic-gauche : rotation</li>\
<li>Espace / Clic molette : zoom intelligent</li>\
<li>Molette : zoom</li>\
<li>T : vue de dessus</li>\
<li>Y : retour à la vue de départ</li>\
</ul>\
</div>';

document.getElementById("helpWindow").style.display = (helpIsActive)? "block" : "none";

document.getElementById("helpTab").onclick = function () {
    document.getElementById('helpWindow').style.display = helpIsActive ? "none" : "block";
    helpIsActive = helpIsActive ? false : true;


};
