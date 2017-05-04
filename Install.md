## Platform general install
Retrieve [UDV sources from github](https://github.com/MEPP-team/UDV) and proceed with the following install:
 * Install [node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) (included in node)
 * Install the packages required by UDV (at the root of the sources) with the following commands:
   ````  
   npm install express
   npm install throttle
   ````
   This should create a `node_modules` sub-directory with the installed packages.
 * Download a set of data e.g. [Lyon (8Gb zip file)](http://liris.cnrs.fr/vcity/Data/UDV/GrandLyon.zip) and unzip it (31Gb once decompressed) within the `ressources` sub-directory.  

Launch the server:
  * linux : node index.js
  * on windows : node.exe index.js (or drag index.js over node.exe) or executes the [start.bat](https://github.com/MEPP-team/UDV/blob/master/start.bat) script

Launch the client: 
  * open `http://localhost:8080/` with your favorite web browser
  * select an available data set (by clicking on it)

### Building a stand alone USB key.
If you need to handle over (or take with you for offline demos) a stand alone USB key (or another removable media), the resulting installed directory as obtained with the above installation process is not completely autonomous. You will need to copy the node.js executable (`node.exe` on WIndows) within the UDV directory. Otherwise if you try to use the USB key version of UDV on a machine that hasn't `node.js` already installed, you will fail to launch the server...  

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

