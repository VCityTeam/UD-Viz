#Installation

##Linux
Après avoir ouvrir un terminal il suffit de taper les commandes suivantes :
 ```
sudo apt-get install nodejs
sudo apt-get install npm
sudo npm install -g n
sudo n latest
```

Ces commandes permettent d’installer la dernière version de npm. Après l’avoir installé placez vous dans le répertoire racine d’iTowns et lancer cette commande : ```npm install```
Exécutez ```npm start``` et vérifiez que le serveur fonctionne en ouvrant la page suivante : http://localhost:8080/examples/globe.html.
Pour arrêter le serveur il suffit d’effectuer la commande suivante : ```ctrl+c```

##Windows
Vérifier que Windows Powershell 3 est installé. Une fois que son installation est confirmé ouvrez le et exécutez la commande suivante : (s’il vous est demandé d’effectuer une commande supplémentaire via le terminal afin d'exécuter la commande précédente faites le)
```
iex (new-object net.webclient).downstring(‘https://get.scoop.sh’)
```
Cette commande permet l’installation de Scoop, un gestionnaire de paquets Windows. Ensuite il faut installer nodejs de à l’aide de cette commande.
```
scoop install nodejs
```
Après l’avoir installé placez vous dans le répertoire racine d’iTowns et lancer cette commande :``` npm install```
Exécutez ```npm start``` et vérifiez que le serveur fonctionne en ouvrant la page suivante : http://localhost:8080/examples/globe.html. (Opté pour Firefox ou Chrome comme navigateur)
Pour arrêter le serveur il suffit d’effectuer la commande suivante : ```ctrl+c```

##OSX
Installer le gestionnaire de paquet en ligne de commande Homebrew, ainsi que npm :
```
/usr/bin/ruby -e “$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)”
brew install node
```
Après l’avoir installé placez vous dans le répertoire racine d’iTowns et lancer cette commande : ```npm install```
Exécutez ```npm start``` et vérifiez que le serveur fonctionne en ouvrant la page suivante : http://localhost:8080/examples/globe.html. (Opté pour Firefox ou Chrome comme navigateur)
Pour arrêter le serveur il suffit d’effectuer la commande suivante : ```ctrl+c```
