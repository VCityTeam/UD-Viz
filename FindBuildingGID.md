# How to find a building GID in the database

Example for Ilot du Lac :

Open database in psql
Open QGIS
Start a PostGIS connection to the database (same login as for the database)
Now you should see the city building geometry in QGIS
Find x,y coordinate of a building, then :
In psql :
```
lyon=# select gid from lyon where st_intersects(Box2D(geom), ST_MakePoint(1843963, 5175772));
```
(database name is lyon in this example, and x,y coord are 1844063, 5175772)

psql will return the gid (173 in this case)

In psql :
```
lyon=# select gid from lyon where st_intersects(Box2D(geom), ST_MakePoint(1844063, 5175772));
```
psql will return the gid (503 in this case)
    
If you want to delete these buildings :
    
In psql :

```
lyon=# delete from lyon where gid in (173,503);
```

Two buildings are now deleted from the database
