

TO DO : auto install (install all dependencies with npm)

# INSTALL NOTES

FIXME EBO: isntall nodejs and npm on Ubuntu
sudo npm install -g n
sudo n latest

## Ligh install (without building geometry)

Just (git) clone UDV and iTowns alongside (the two directories must be siblings):
```
  mkdir Vilo3D    # Not really needed but cleaner with a containment directory
  cd Vilo3d
  git clone https://github.com/MEPP-team/UDV.git
  git clone https://github.com/itowns/itowns.git
  cd itowns/
  npm install   # Might require some "sudo apt-get install npm"
```
Edit `UDV/Vilo3D/Main.js` and set the "showBuildings" to false on line 4.

Open UDV/Vilo3D/index.html in Firefox (will fail for Chrome).


## Installation with geometry of the buildings and hand made textured historical buildings 

### (1) Install the database. 
The following instructions are an adaptation of [JIGA adhoc building database](https://github.com/MEPP-team/RICT/blob/master/Install.md) (within the context of Ubuntu version as given by `lsb_release -a` yields `Description: Debian GNU/Linux 8.8 (jessie)`):
```
  sudo su citydb_user
  (citydb_user)$ createdb -O citydb_user lyon6_buildings
  (citydb_user)$ psql lyon6_buildings -c "create extension postgis;"
  (citydb_user)$ psql lyon6_buildings -c "create table lyon(gid serial primary key, geom GEOMETRY('POLYHEDRALSURFACEZ', 3946));"
```
Proceed with feeding the DB:
```
  (citydb_user)$ cd
  (citydb_user)$ mkdir Vilo3d
  (citydb_user)$ cd Vilo3d
  (citydb_user)$ git clone https://github.com/Oslandia/citygml2pgsql
  (citydb_user)$ mv citygml2pgsql citygml2pgsql.git && cd citygml2pgsql.git
  (citydb_user)$ wget http://liris.cnrs.fr/vcity/Data/iTowns2/LYON_6EME_BATI_2012_SplitBuildings.gml
  (citydb_user)$ pip --version         # sudo apt-get install python-pip in case you miss pip on python2 !
  (citydb_user)$ sudo pip install lxml # Refer below in case of failure on Python.h, libxml.h...
  python ./citygml2pgsql.py -l LYON_6EME_BATI_2012_SplitBuildings.gml
  python ./citygml2pgsql.py LYON_6EME_BATI_2012_SplitBuildings.gml 2 3946 geom lyon |  psql lyon6_buildings
```

Note: in case of trouble when install lxml python package with pip:
```
  # The following package install were required for pip install lxml to get through
  (citydb_user)$ sudo apt-get install libxml2-dev libxslt1-dev python-dev
  (citydb_user)$ sudo apt-get install zlib1g-dev    # because on 64 bit (uname-a)
```

Assert some content was indeed fed to the DB
```
  psql lyon6_buildings -c "select count(*) from lyon;"
```
which should return 511 buildings.

### (2) Manual edit of database
Then we need to delete two buildings from the 'lyon 6ème' database (in psql) in order to make room for our handmade models (of so called "Îlot du Lac").

Identifying the gid (`173` and `503`) of the buildings to be removed is achieved [through those geographical requests](FindBuildingGID.md).

Delete those tow buildings from the DB:
```
  (db_user)$ psql lyon6_buildings -c "delete from lyon where gid in (173,503);"
```

### (3) Install UDV and iTowns
Refer above to the light install version.

If using ColladaLoader to import handmade buildings : add the following line at the start of itowns/node_modules/three/examples/js/loaders/ColladaLoader2.js :
```
THREE = itowns.THREE;
```

### (4) Install an http server
```
  sudo apt install apache2
  sudo cp /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/rict.liris.cnrs.fr.conf
```
Edit the newly copied configuration file `/etc/apache2/sites-available/rict.liris.cnrs.fr.conf`: the following ad-hoc configuration should make it
```
<VirtualHost *:80>
	ServerName rict.liris.cnrs.fr
	ServerAlias www.rict.liris.cnrs.fr
	ServerAdmin webmaster@localhost
	DocumentRoot /home/citydb_user/Vilo3d
  <Directory /home/citydb_user/Vilo3d>
     Options Indexes FollowSymLinks MultiViews
     AllowOverride all
     Require all granted
  </Directory>
  ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Remove the default server (to avoid collisions):
```
  sudo rm /etc/apache2/sites-enabled/000-default.conf   ## which is a symlink anyhow
```
```
  sudo a2ensite rict.liris.cnrs.fr.conf   ## To enable the virtual site
  sudo service apache2 restart            ## Relaunch the service 
```
Use Firefox to pop some requests on `http://rict.liris.cnrs.fr/UDV/Vilo3D/index.html`.

Trouble shoot by looking at server's error and log files:
  - `tail -f /var/log/apache2/error.log`
  - `tail -f /var/log/apache2/access.log`

Notes and references: 
 * JGA discourages (within this context) the [usage of uWSGI](http://uwsgi-docs.readthedocs.io/en/latest/StaticFiles.html) as simple http server
 * [Ubuntu Apache2 configuration](https://www.digitalocean.com/community/tutorials/how-to-set-up-apache-virtual-hosts-on-ubuntu-14-04-lts)
 * [Ubuntu Apache2 install](https://help.ubuntu.com/lts/serverguide/httpd.html)

### (5) Usage
 * When on the http server, open `UDV/Vilo3D/index.html` in Firefox (Chrome not supported)
