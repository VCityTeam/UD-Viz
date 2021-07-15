# Documentation for View3D.js

* Encapsulé la view 3D d'itowns pour y ajouter des fonctionnalitées. 
* Cet objet est utilisé pour créer une vue 3D pour UD-Viz.

* Screen des différentes couches d'HTML + à quoi chaque couche correspond. + une couche d'UI.
* lien vers le sensei pour la sources d'inspiration 
* CSS3DRenderer : seulement initialiser lors de l'ajout du premier élément + Il crée un nouveau renderer (CSS3DRenderer) + Il crée sa propre scène + il ajoute le masque à la scène de WebGL + Pour le rendu il utilise la caméra d'itowns.

* Couche de CSS : une boucle de rendu qui lui est associée + marche avec le THREEjs renderer (lien)
* Couche WebGL qui est devant : dès qu'il y a un element HTML il ajoute un quad transparent qui permet de visionner l'élément HTML CSS 3D qui lui est rendu derrière. Les deux canvas de rendu sont parfaitement superposés, les CSS3DObject et leur masque associé (Quad) sont positionés à l'identique dans leur scène respective + ol partage la même caméra ce qui permet de les voir.

* config =  surement de la doc déjà dispo.
Le fichier config est très light (juste la caméra d'itowns).

## Amélioration 
* InputManager fonctionnel. add mouse input 
* OnResize fonctionnel pour top & left. 
* Bug d'itowns. Problème du resize d'itowns qui ne prend pas en compte le resize de la fenêtre (si il y a un UI casse le resize de l'objet).
* Le WebGL est devant le CSS3D et catch tout les events + la propagation des events est propagé de manière ascendante + Dans la hiérarchie du DOM le WebGL et le CSS3D sont au même niveau ducoup le CSS3 ne peut pas récuperer les events. Solution : désactiver le catch  des events sur le WebGL pour que le CSS prenne la main. 

Comment désactiver at run time.
- Avec un raycaster lance un rayon dans la scène WebGL. Si celui si intersect un Quad pour le CSS3DRenderer change de mode et prend le focus sur celui-ci. Input esc pour reprendre la main sur la scène WebGL.


