# INSTALL NOTES

## Prerequisite: install nodejs and npm

* **Ubuntu**
  - Install and update npm
    ```
    sudo apt-get install npm    ## Will pull NodeJS
    sudo npm install -g n     
    sudo n latest
    ```
  - References: [how can I update Nodejs](https://askubuntu.com/questions/426750/how-can-i-update-my-nodejs-to-the-latest-version), and [install Ubuntu](http://www.hostingadvice.com/how-to/install-nodejs-ubuntu-14-04/#ubuntu-package-manager)

## Installation of the client side (with a developer use case)
```
  git clone https://github.com/MEPP-team/UDV.git
  cd UDV/UDV-Core
  npm install
  npm start
```

## Running a demo

Use your web browser to open
`http://localhost:8080/`.

If the server-side component is not installed on your computer, you will not be able to run the **full** module demo of Urban Data Viewer.

Thus, you can choose one of those solutions to do so:

  * Either you just need a view of 3D objects, in which case there is nothing more to do
  
  * Or you want to have an insight of all UDV features (including handling of documents), then you need install all the tools necessary for the server-side [here](https://github.com/MEPP-team/RICT/blob/master/Install.md) in order to be able to run it locally;

  * Or you can also modify the attribute _server.url_ of the file `<path-to-UDV>/UDV-Core/examples/data/config/generalDemoConfig.json` as described below:
```
"url":"http://rict.liris.cnrs.fr:1525/",
```
You will then be able to run the full module demo of UDV.

## Notes

* For an install of the full pipeline of our application refer to
[these install notes](https://github.com/MEPP-team/RICT/blob/master/Install.md).

* **Windows**
  - Install and update npm which Windows Powershell
    ```
    iex (new-object net.webclient).downstring(‘https://get.scoop.sh’)
    scoop install nodejs
    cd UDV/UDV-Core
    npm install
    npm start
    ```
