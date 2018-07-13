This demo allows to search documents in a database whith or without filters.
It displays all documents in a browser
It gives the possiblity to visualize documents in a 3D scene (overlay mode).


This demo has been generated through the file consultDoc.json.

This is used to configure dependencies towards an external data server, as well as
following UDV (document-related) views:
 - Document browser
 - Document research

See how to set the configuration:
https://github.com/MEPP-team/VCity/wiki/Configuring-UDV

In this particular demo, a document is defined by following attributes:

Metadata:
  - title
  - description
  - referring date
  - publication date
  - type
  - subject

Visualization:
  - positionX, positionY, positionZ
  - quaternionX, quaternionY, quaternionZ, quaternionW

Attributes that have their "queryable" property set to "true" or "keyword" can be
queried.
