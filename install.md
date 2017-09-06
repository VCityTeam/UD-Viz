

TO DO : auto install (install all dependencies with npm)

# INSTALL NOTES

**Full install** : First, the framework (itowns + building server etc) must be installed : follow all steps from https://github.com/MEPP-team/RICT/blob/master/Install.md

Then we need to delete two buildings from the 'lyon 6ème' database (in psql) in order to make room for our handmade models (Îlot du Lac)
-> in psql :
```
(db_user)$ psql lyon
lyon=# delete from lyon where gid in (173,503);
```
The two building gid (173 and 503) were obtained with [this process](FindBuildingGID.md).

Then, clone the UDV repository alongside iTowns. UDV and iTowns must be in the same directory, unless you change the path to itowns in your index.html.

**Shorter install, no building geometry** : just clone UDV alongside iTowns, skipping the rest of the framework. Set "showBuildings" to false (line 4 in UDV/Vilo3D/Main.js).

**Launch** : open UDV/Vilo3D/index.html in Firefox
