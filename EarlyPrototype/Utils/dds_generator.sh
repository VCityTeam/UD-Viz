#!/bin/bash

ListeRep=($(find * -type d -prune))
nbRep=${#ListeRep[@]}
i=0

for Rep in ${ListeRep[@]}
do
	i=$(($i+1))
	cd $Rep/ZoneAExporter_IMA
	echo in Rep :$Rep curnetly $i of $nbRep

	find . -name '*.TIF' | parallel --gnu convert {} -define dds:compression=dxt1 -define dds:cluster-fit=true -define dds:mipmaps=0 -flip -resize 1024x1024\! {.}.dds
	mkdir -p ../../../DDS/1024/$Rep/ZoneAExporter_IMA
	mv *.dds ../../../DDS/1024/$Rep/ZoneAExporter_IMA
	find . -name '*.TIF' | parallel --gnu convert {} -define dds:compression=dxt1 -define dds:cluster-fit=true -define dds:mipmaps=0 -flip -resize 512x512\! {.}.dds

	mkdir -p ../../../DDS/512/$Rep/ZoneAExporter_IMA
	mv *.dds ../../../DDS/512/$Rep/ZoneAExporter_IMA

	find . -name '*.TIF' | parallel --gnu convert {} -define dds:compression=dxt1 -define dds:cluster-fit=true -define dds:mipmaps=0 -flip -resize 256x256\! {.}.dds
	mkdir -p ../../../DDS/256/$Rep/ZoneAExporter_IMA
	mv *.dds ../../../DDS/256/$Rep/ZoneAExporter_IMA
	
	find . -name '*.TIF' | parallel --gnu convert {} -define dds:compression=dxt1 -define dds:cluster-fit=true -flip -resize 128x128\! {.}.dds
	mkdir -p ../../../DDS/128/$Rep/ZoneAExporter_IMA
	mv *.dds ../../../DDS/128/$Rep/ZoneAExporter_IMA
	cd ../..

done
