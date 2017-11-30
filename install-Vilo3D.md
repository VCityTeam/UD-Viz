

# Vilod3D demo installation notes

**Note**: Vilo3d demo is configured by default such that the buildings come from locally encoded data (a tileset together with the geometry provided to the client as files). There is thus no requirement for a database server.

## Prerequisite: install nodejs and npm

* **Ubuntu**
  - Install and update npm
    ```
    sudo apt-get install npm    ## Will pull NodeJS
    sudo npm install -g n     
    sudo n latest
    ```
  - References: [how can I update Nodejs](https://askubuntu.com/questions/426750/how-can-i-update-my-nodejs-to-the-latest-version), and [install Ubuntu](http://www.hostingadvice.com/how-to/install-nodejs-ubuntu-14-04/#ubuntu-package-manager)

## Installation
```
  mkdir Vilo3D    # Not really needed but cleaner with a
                  # containment directory
  cd Vilo3d
  git clone https://github.com/MEPP-team/UDV.git
  pushd UDV
  git checkout Vilo3D-Demo-1.0
  popd
  git clone https://github.com/itowns/itowns.git
  cd itowns/
  git checkout v2.1.0
  Edit `itowns/node_modules/three/examples/js/loaders/ColladaLoader2.js`
     ---> insert the following line as first line
          `THREE = itowns.THREE;`
  npm install
```

## Running the demo
Open the `UDV/Vilo3D/index.html` file with your web browser.
