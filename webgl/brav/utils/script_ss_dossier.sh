#!/bin/bash
ListeRep=($(find * -type d -prune))
nbRep=${#ListeRep[@]}
i=0
for Rep in ${ListeRep[@]}
do
	i=$(($i+1))
#	echo $Rep
	echo in Rep :$Rep curnetly $i of $nbRep
	cd $Rep/export-CityGML
	rm *.gml
	mv ZoneAExporter_IMA ..
	cd ../..
	rmdir $Rep/export-CityGML
done


