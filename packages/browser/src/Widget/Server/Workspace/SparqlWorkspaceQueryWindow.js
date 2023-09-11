import { SparqlEndpointResponseProvider } from '../SPARQL/Service/SparqlEndpointResponseProvider';
import { SparqlQueryWindow } from '../SPARQL/View/SparqlQueryWindow';
import { getUriLocalname } from '../../../URLUtil';

/**
 * The SPARQL query window class which provides the user interface for querying
 * a SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlWorkspaceQueryWindow extends SparqlQueryWindow {
  /**
   * Creates a SPARQL query window.
   *
   * @param {SparqlEndpointResponseProvider} sparqlProvider The SPARQL Endpoint Response Provider.
   * @param {object} configSparqlWidget The sparqlModule view configuration.
   * @param {object} configSparqlWidget.queries Query configurations
   * @param {object} configSparqlWidget.queries.title The query title
   * @param {object} configSparqlWidget.queries.filepath The path to the file which contains the query text
   * @param {object} configSparqlWidget.queries.formats Configuration for which visualizations are allowed
   *                                                    with this query. Should be an object of key, value
   *                                                    pairs. The keys of these pairs should correspond
   *                                                    with the cases in the updateDataView() function.
   */
  constructor(sparqlProvider, configSparqlWidget) {
    super(sparqlProvider, configSparqlWidget);
  }

  /**
   *
   * @param {string} id an identifier
   * @returns {Array<Array<string>>} - transaction chain
   */
  getTransactionChain(id) {
    const result = this.sparqlProvider.querySparqlEndpointService(
      this.transactionChainQuery(id)
    );
    return result;
  }

  /**
   * Get the CityGML 3.0 transaction chain query for as a string
   *
   * @param {string} gml_id a gml_id identifier linked to a feature
   * @returns {string} - query plain text
   */
  transactionChainQuery(gml_id) {
    return /* SPARQL */ `
# Workspace prefixes
PREFIX vers: <https://dataset-dl.liris.cnrs.fr/rdf-owl-urban-data-ontologies/Ontologies/CityGML/3.0/versioning#>

# return a the transactions connected to a city objects URI through a distance of 4

#SELECT DISTINCT ?transition ?transaction ?sourceGmlId ?sourceVersion ?targetGmlId ?targetVersion
SELECT ?gmlID ?gmlID_future_1 ?gmlID_future_2 ?gmlID_future_3 ?gmlID_future_4
WHERE {
  ?gmlID ^vers:Transaction.oldFeature|^vers:Transaction.newFeature ?transaction .
  # search forward in time
  OPTIONAL {
    ?transaction vers:Transaction.newFeature ?gmlID_future_1 .
  } OPTIONAL {
    ?transaction vers:Transaction.newFeature/^vers:Transaction.oldFeature/vers:Transaction.newFeature ?gmlID_future_2 .
  } OPTIONAL {
    ?transaction vers:Transaction.newFeature/^vers:Transaction.oldFeature/vers:Transaction.newFeature/^vers:Transaction.oldFeature/vers:Transaction.newFeature ?gmlID_future_3 .
  } OPTIONAL {
    ?transaction vers:Transaction.newFeature/^vers:Transaction.oldFeature/vers:Transaction.newFeature/^vers:Transaction.oldFeature/vers:Transaction.newFeature/^vers:Transaction.oldFeature/vers:Transaction.newFeature ?gmlID_future_4 .
  }

  FILTER REGEX( str(?gmlID), ".*${gml_id}" ) 
}
      `;
  }

  /**
   * Given the index of a node (of type Version), return the node of the first Scenario links to it using Scenario.versionMember.
   *
   * @param {number} d the index of the Version node
   * @returns {object|null} return the object that represents the datum of a Scenario
   */
  getVersionScenarioByIndex(d) {
    const uri = this.d3Graph.data.getNodeByIndex(d).id;
    return this.getVersionScenarioByUri(uri);
  }

  /**
   * Given the index of a node (of type VersionTransition), return the node of the first Scenario links to it using Scenario.versionTransitionMember.
   *
   * @param {number} d the index of the Version node
   * @returns {object|null} return the object that represents the datum of a Scenario
   */
  getVersionTransitionScenarioByIndex(d) {
    const uri = this.d3Graph.data.getNodeByIndex(d).id;
    return this.getVersionTransitionScenarioByUri(uri);
  }

  /**
   * Given the uri of a node, return the node of the first Scenario links to it using Scenario.versionMember.
   * The uri should belong to a node of type Version.
   *
   * @param {string} uri the URI of the Version node
   * @returns {object|null} return the object that represents the datum of a Scenario
   */
  getVersionScenarioByUri(uri) {
    const memberLink = this.d3Graph.data.links.find((element) => {
      return (
        getUriLocalname(element.label) == 'Scenario.versionMember' &&
        element.target == uri
      );
    });
    if (memberLink) {
      return this.d3Graph.data.getNodeByUri(memberLink.source);
    }
    console.warn(`No Scenario found for version with uri: ${uri}`);
    return null;
  }

  /**
   * Given the uri of a node, return the node of the first Scenario links to it using Scenario.versionTransitionMember.
   * The uri should belong to a node of type VersionTransition.
   *
   * @param {string} uri the URI of the Version node
   * @returns {object|null} return the object that represents the datum of a Scenario
   */
  getVersionTransitionScenarioByUri(uri) {
    const memberLink = this.d3Graph.data.links.find((element) => {
      return (
        getUriLocalname(element.label) == 'Scenario.versionTransitionMember' &&
        element.target == uri
      );
    });
    if (memberLink) {
      return this.d3Graph.data.getNodeByUri(memberLink.source);
    }
    console.warn(`No Scenario found for versionTransition with uri: ${uri}`);
    return null;
  }

  /**
   * Given the index of a node (of type Version or VersionTransition) and a layerManager,
   * find the first Scenario that links to it and return the first layer that matches
   * the layer.name of the Scenario's localname.
   *
   * @param {number} d the index of the Version or VersionTransition node
   * @returns {string|null} return the name of a matching geometryLayer
   */
  getScenarioLayerNameByIndex(d) {
    const node = this.d3Graph.data.getNodeByIndex(d);
    switch (
      getUriLocalname(node.type) // behavior changes based on the node type
    ) {
      case 'Version': {
        const versionScenarioByIndex = this.getVersionScenarioByIndex(d);

        if (versionScenarioByIndex) {
          return getUriLocalname(versionScenarioByIndex.id);
        }

        break;
      }
      case 'VersionTransition': {
        const versionTransitionScenarioByIndex =
          this.getVersionTransitionScenarioByIndex(d);

        if (versionTransitionScenarioByIndex) {
          return getUriLocalname(versionTransitionScenarioByIndex.id);
        }
        break;
      }
      default:
        console.warn(
          `Cannot find scenario associated with node, ${getUriLocalname(
            node.id
          )}; Unknown node type: ${getUriLocalname(node.type)}`
        );
        return null;
    }
    return null;
  }

  /**
   * Given the uri of a node (of type Version or VersionTransition) and a layerManager,
   * find the first Scenario that links to it and return the first layer that matches
   * the layer.name of the Scenario's localname.
   *
   * @param {string} uri the uri of the Version or VersionTransition node
   * @returns {string|null} return the a matching geometryLayer name
   */
  getScenarioLayerNameByUri(uri) {
    const node = this.d3Graph.data.getNodeByUri(uri);
    switch (
      getUriLocalname(node.type) // behavior changes based on the node type
    ) {
      case 'Version': {
        return getUriLocalname(this.getVersionScenarioByUri(uri).id);
      }
      case 'VersionTransition': {
        return getUriLocalname(this.getVersionTransitionScenarioByUri(uri).id);
      }
      default:
        console.warn(
          `Cannot find scenario associated with node, ${getUriLocalname(
            node.id
          )}; Unknown node type: ${getUriLocalname(node.type)}`
        );
        return null;
    }
  }

  /**
   * Given the index of a node, find the bitemporal timestamps that
   * that link to it (with the properties AbstractFeatureWithLifespan.validFrom and
   * AbstractFeatureWithLifespan.validTo) and return them as an object of Dates
   *
   * @param {number} d the index of the node
   * @returns {{validFrom:Date,validTo:Date}|null} return the object that represents the datum of a node
   */
  getBitemporalTimestampsByIndex(d) {
    const links = this.d3Graph.data.getLinksByIndex(d);
    const validFrom = links.find((link) => {
      return (
        getUriLocalname(link.label) == 'AbstractFeatureWithLifespan.validFrom'
      );
    });
    const validTo = links.find((link) => {
      return (
        getUriLocalname(link.label) == 'AbstractFeatureWithLifespan.validTo'
      );
    });

    if (!validFrom || !validTo) {
      console.warn(
        `could not find bitemporal timestamps for ${
          this.d3Graph.data.getNodeByIndex(d).id
        }`
      );
      return null;
    }
    const timestamp1 = new Date(String(validFrom.target)).getFullYear();
    const timestamp2 = new Date(String(validTo.target)).getFullYear();

    console.debug(
      `bitemporal timestamps found: ${validFrom.target} and ${validTo.target}`
    );
    return {
      validFrom: timestamp1,
      validTo: timestamp2,
    };
  }
}
