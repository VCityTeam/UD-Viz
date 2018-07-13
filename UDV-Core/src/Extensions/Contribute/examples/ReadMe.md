### About the demo

The document-related functionalities of this demo have been generated through the file 'contriubteuConfig.json'.

It is used to configure dependencies towards an external data server, as well as
following UDV (document-related) views:
 - Document browser
 - Document creation
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

In this demo, all are mandatory, they have to be set by the user when he wiches to create
a new document. This is a choice of configuration for this demo. It is possible to
have optional attributes.

All attributes in 'metadata' are displayed in the browser.

Attributes that have their "queryable" property set to "true" or "keyword" can be
queried.
