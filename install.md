

TO DO : auto install (install all dependencies with npm)

# INSTALL NOTES

**Full install** : First, the framework (itowns + building server etc) must be installed : https://github.com/MEPP-team/RICT/blob/master/Install.md

To delete buildings from the building database in order to include another object :
Example for Ilot du Lac :
- open database in psql
- open QGIS
- start a PostGIS connection to the database (same login as for the database)
- now you should see the city building geometry in QGIS
- find x,y coordinate of a building, then :
- in psql : lyon=# select gid from lyon where st_intersects(Box2D(geom), ST_MakePoint(1843963, 5175772));
(database name is lyon in this example, and x,y coord are 1844063, 5175772)
- psql will return the gid (173 in this case)
- in psql : lyon=# select gid from lyon where st_intersects(Box2D(geom), ST_MakePoint(1844063, 5175772));
- psql will return the gid (503 in this case)
- in psql : lyon=# delete from lyon where gid in (173,503);
- two buildings are now deleted from the database

Then, clone UDV alongside iTowns. UDV and iTowns must be in the same directory, unless you change the path to itowns in your index.html.

**Shorter install, no building geometry** : just clone UDV alongside iTowns, skipping the rest of the framework. Set "showBuildings" to false (line 4 in UDV/Vilo3D/Main.js).

**Launch** : open UDV/Vilo3D/index.html

**Use the Camera Controls for your project** : TO DO
