
function readCSVFile(file, onComplete)
{
    var result;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
                AllText = allText;
                result = processData(allText);
                onComplete(result);
            }
        }
    }
    rawFile.send(null);

}

// split data to an array : lines[row]
// we skip the first line (titles) and last line (empty)
function processData(csv) {
    var allTextLines = csv.split(/\r\n|\n/);
    var lines = [];
    for (var i=1; i<allTextLines.length-1; i++) {
        var data = allTextLines[i].split(',');
            var tarr = [];
            for (var j=0; j<data.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
    }
  return lines;
}
