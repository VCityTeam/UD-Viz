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
  ./install.sh   # Pulls the temporal branch of iTowns and install UDV
  npm start
```

Use your web browser to open
`http://localhost:8080/examples/Demo.html`.

## Notes

* this demo is configured by default to use a data base server accessed
through ad-hoc web-services. Configuration of the accessed database is done
within the `Main.js` file through the `buildingServerRequest` variable.
* For an install of the full pipeline of our application refer to
[these install notes](https://github.com/MEPP-team/RICT/blob/master/Install.md)
