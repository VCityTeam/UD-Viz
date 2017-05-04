## Platform general install
Retrieve [UDV sources from github](https://github.com/MEPP-team/UDV) and proceed with the following install:
 * Install [node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) (included in node)
 * Install the packages required by UDV (at the root of the sources) with the following commands:
   ````  
   npm install express
   npm install throttle
   ````
   This should create a `node_modules` sub-directory with the installed packages.
 * Download a set of data e.g. [Lyon's 6sth burrough](http://liris.cnrs.fr/vcity/Data/UDV/GrandLyon.zip) and unzip it within the `ressources` sub-directory.  

Launch the server:
  * linux : node index.js
  * on windows : node.exe index.js (or drag index.js over node.exe) or executes the [start.bat](https://github.com/MEPP-team/UDV/blob/master/start.bat) script

Launch the client: 
  * open `http://localhost:8080/` with your favorite web browser
  * select an available data set (by clicking on it)
  
Note: The resulting installed directory is autonomous. You can place it on a removable media (e.g. a 64Go USB key) and handle it over or used it for demos...

## OSX specific install
 - Install XCode and [Homebrew](https://brew.sh/)
 - `brew install node`
 - `git clone https://github.com/MEPP-team/UDV.git`
 - `cd UDV`
 - `more Install.md` # this is "this file"
 - `cd webgl/brav/`
 - `npm install express`
 - `npm install throttle`
 - `node index.js`
 - Open `http://localhost:8080/` with your favorite web browser

