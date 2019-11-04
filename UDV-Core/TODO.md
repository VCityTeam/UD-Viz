* 3D Tiles debug semble bugué: les identifiants affichés semblent faux : 
  vient peut être de ma modification du tileIndex d'un dictionnaire 
  commençant à 1 à un array commencant du coup à 0
* Lorsqu'on ferme 3D Tiles debug, **tous** les styles appliqués 
  aux tuiles sont désappliqués alors qu'il faudrait seulement que
  ceux appliqués par ce module soient désappliqués. Pour cela il faudrait
  probablement introduire un attribut owner aux styles pour déterminer ceux
  qu'il faut désactiver quand on désactive un module donné.
* Dans l'extension temporelle: ajouter une fonction qui renvoit les informations
à afficher liées à l'extension pour un batch id / tile id donné par exemple. Ajouter
aussi des fonctions getTransactions() et getTransaction(idtransaction) par exemple.
