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

Use your web browser to open
`http://localhost:8080/`.

## Notes

* For an install of the full pipeline of our application refer to
[these install notes](https://github.com/MEPP-team/RICT/blob/master/Install.md)

* **Windows**
  - Install and update npm which Windows Powershell
    ```
    iex (new-object net.webclient).downstring(‘https://get.scoop.sh’)
    scoop install nodejs
    cd UDV/UDV-Core
    npm install
    npm start
    ```
