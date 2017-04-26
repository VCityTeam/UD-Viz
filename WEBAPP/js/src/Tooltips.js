/** 
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 * Contains the HTML of the tooltip that will display semantic informations
 * Generaite the HTML from semantic array and add it in the HTML page.
 * @class VCC.Tooltips
 * @constructor
 * @param {int} x X position of the point clicked
 * @param {int} y Y position of the point clicked
 * @param {int} z Z position of the point clicked
 * @param {Array[String,String]} semanticArray Array containing all semantic fields to be written in tooltip
 */

VCC.Tooltips = function(x, y, z, semanticArray) {

	if (semanticArray !== undefined) {

		this.width = 400;
		this.height = 300;
		this.point3D = new THREE.Vector3(x, y, z);

		this.html = document.createElement('div');

		this.html.style.position = "absolute";
		this.html.style.overflow = "";
		this.html.style.fontSize = "0.9em";
		this.html.style.textAlign = "left";
		//this.html.style.background = "rgba(120,0,0,1)";
		this.html.style.color = "#000";
		this.html.style.bgColor = "#ccc";
		this.html.style.width = this.width + "px";
		this.html.style.height = this.height + "px";

		this.html.style.zIndex = 100;

		this.html.style.backgroundImage = "url(balloon.png)";
		this.html.style.backgroundRepeat = "no-repeat"

		var infoDiv = document.createElement('div');
		infoDiv.style.position = "absolute";
		infoDiv.style.width = "100%";
		infoDiv.style.height = "100%";
		var table = document.createElement('table');

		var caption = document.createElement('caption');
		var titleTable = document.createElement('table');

		titleTable.style.width = "100%";
		titleTable.style.cellPadding = "0px"
		var tr = document.createElement('tr');
		var td1 = document.createElement('td');
		var td2 = document.createElement('td');
		td1.innerHTML = "INFORMATIONS";
		td1.style.textAlign = "left";
		td1.style.fontWeight = "bold";
		this.close = document.createElement('div');
		var closeWidth = 20;
		var closeHeight = 20;

		this.close.style.backgroundImage = "url(close.png)";
		this.close.style.width = closeWidth + "px";
		this.close.style.height = closeHeight + "px";
		this.close.style.position = "absolute";
		this.close.style.right = +"px";
		this.close.style.top = +"px";

		var header = document.createElement('div');

		header.style.padding = "5px 5px 5px 5px";
		header.style.textAlign = "left";
		header.style.fontWeight = "bold";
		header.style.borderBottom = "#CCCCCC 1px solid";

		header.innerHTML = "INFORMATIONS";

		this.close.style.right = 0 + "px";
		this.close.style.top = 5 + "px";
		header.appendChild(this.close);
		for (i in semanticArray) {
			var tr = document.createElement('tr');
			var th = document.createElement('th');
			th.innerHTML = i;
			th.style.verticalAlign = "top";

			var td1 = document.createElement('td');
			var td2 = document.createElement('td');
			td1.innerHTML = ":";
			td1.style.verticalAlign = "top"
			td2.innerHTML = semanticArray[i];
			td2.style.verticalAlign = "top";

			tr.appendChild(th);
			tr.appendChild(td1);
			tr.appendChild(td2);

			table.appendChild(tr);
		}
		var tableDiv = document.createElement('div');
		tableDiv.style.overflow = "auto";
		tableDiv.style.width = "100%";
		tableDiv.style.height = "100%";
		tableDiv.appendChild(table);

		infoDiv.appendChild(header);
		infoDiv.appendChild(tableDiv);
		infoDiv.style.top = "5%";
		infoDiv.style.left = "5%";
		infoDiv.style.width = "90%";
		infoDiv.style.height = "64%";
		header.style.height = "20px";

		this.html.appendChild(infoDiv);
		document.body.appendChild(this.html);

	}
}
