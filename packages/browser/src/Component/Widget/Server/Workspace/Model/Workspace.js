import { getUriLocalname } from '../../SPARQL/Model/URI';
import { SparqlQueryWindow } from '../../SPARQL/View/SparqlQueryWindow';
import { LayerManager } from '../../../../Itowns/LayerManager/LayerManager';
import { Graph } from '../../SPARQL/Model/Graph';

export class Workspace extends Graph {
  /**
   * Create a new D3 workspace graph from an RDF JSON object.
   *
   * @param {SparqlQueryWindow} window the window this graph is attached to.
   * @param {object} configSparqlWidget The sparqlModule configuration.
   * @param {number} configSparqlWidget.height The SVG canvas height.
   * @param {number} configSparqlWidget.width The SVG canvas width.
   * @param {number} configSparqlWidget.fontSize The font size to use for node and link labels.
   * @param {object} configSparqlWidget.namespaceLabels Prefix declarations which will replace text labels in the Legend.
   *                                                    This doesn't (yet) affect the legend font size.
   */
  constructor() {
    super();
  }

  /**
   * Given the index of a node (of type Version), return the node of the first Scenario links to it using Scenario.versionMember.
   *
   * @param {number} d the index of the Version node
   * @returns {object|undefined} return the object that represents the datum of a Scenario
   */
  getVersionScenarioByIndex(d) {
    const uri = this.getNodeByIndex(d).id;
    return this.getVersionScenarioByUri(uri);
  }

  /**
   * Given the index of a node (of type VersionTransition), return the node of the first Scenario links to it using Scenario.versionTransitionMember.
   *
   * @param {number} d the index of the Version node
   * @returns {object|undefined} return the object that represents the datum of a Scenario
   */
  getVersionTransitionScenarioByIndex(d) {
    const uri = this.getNodeByIndex(d).id;
    return this.getVersionTransitionScenarioByUri(uri);
  }

  /**
   * Given the uri of a node, return the node of the first Scenario links to it using Scenario.versionMember.
   * The uri should belong to a node of type Version.
   *
   * @param {string} uri the URI of the Version node
   * @returns {object|undefined} return the object that represents the datum of a Scenario
   */
  getVersionScenarioByUri(uri) {
    const memberLink = this.links.find((element) => {
      return (
        getUriLocalname(element.label) == 'Scenario.versionMember' &&
        element.target == uri
      );
    });
    if (memberLink) {
      return this.getNodeByUri(memberLink.source);
    }
    console.warn(`No Scenario found for version with uri: ${uri}`);
    return undefined;
  }

  /**
   * Given the uri of a node, return the node of the first Scenario links to it using Scenario.versionTransitionMember.
   * The uri should belong to a node of type VersionTransition.
   *
   * @param {string} uri the URI of the Version node
   * @returns {object|undefined} return the object that represents the datum of a Scenario
   */
  getVersionTransitionScenarioByUri(uri) {
    const memberLink = this.links.find((element) => {
      return (
        getUriLocalname(element.label) == 'Scenario.versionTransitionMember' &&
        element.target == uri
      );
    });
    if (memberLink) {
      return this.getNodeByUri(memberLink.source);
    }
    console.warn(`No Scenario found for versionTransition with uri: ${uri}`);
    return undefined;
  }

  /**
   * Given the index of a node (of type Version or VersionTransition) and a layerManager,
   * find the first Scenario that links to it and return the first layer that matches
   * the layer.name of the Scenario's localname.
   *
   * @param {number} d the index of the Version or VersionTransition node
   * @param {LayerManager} layerManager the layerManager
   * @returns {C3DTilesLayer|undefined} return the a matching geometryLayer
   */
  getScenarioLayerByIndex(d, layerManager) {
    const node = this.getNodeByIndex(d);
    let scenarioLayer = undefined;
    switch (
      getUriLocalname(node.type) // behavior changes based on the node type
    ) {
      case 'Version': {
        const versionScenarioName = getUriLocalname(
          this.getVersionScenarioByIndex(d).id
        );
        scenarioLayer = layerManager
          .getGeometryLayersWithoutPlanar()
          .find((layer) => {
            return layer.name == versionScenarioName;
          });
        break;
      }
      case 'VersionTransition': {
        const transitionScenarioName = getUriLocalname(
          this.getVersionTransitionScenarioByIndex(d).id
        );
        scenarioLayer = layerManager
          .getGeometryLayersWithoutPlanar()
          .find((layer) => {
            return layer.name == transitionScenarioName;
          });
        break;
      }
      default:
        console.warn(
          `Cannot find scenario associated with node, ${getUriLocalname(
            node.id
          )}; Unknown node type: ${getUriLocalname(node.type)}`
        );
        return undefined;
    }
    return scenarioLayer;
  }

  /**
   * Given the uri of a node (of type Version or VersionTransition) and a layerManager,
   * find the first Scenario that links to it and return the first layer that matches
   * the layer.name of the Scenario's localname.
   *
   * @param {string} uri the uri of the Version or VersionTransition node
   * @param {LayerManager} layerManager the layerManager
   * @returns {C3DTilesLayer|undefined} return the a matching geometryLayer
   */
  getScenarioLayerByUri(uri, layerManager) {
    const node = this.getNodeByUri(uri);
    let scenarioLayer = undefined;
    switch (
      getUriLocalname(node.type) // behavior changes based on the node type
    ) {
      case 'Version': {
        const versionScenarioName = getUriLocalname(
          this.getVersionScenarioByUri(uri).id
        );
        scenarioLayer = layerManager
          .getGeometryLayersWithoutPlanar()
          .find((layer) => {
            return layer.name == versionScenarioName;
          });
        break;
      }
      case 'VersionTransition': {
        const transitionScenarioName = getUriLocalname(
          this.getVersionTransitionScenarioByUri(uri).id
        );
        scenarioLayer = layerManager
          .getGeometryLayersWithoutPlanar()
          .find((layer) => {
            return layer.name == transitionScenarioName;
          });
        break;
      }
      default:
        console.warn(
          `Cannot find scenario associated with node, ${getUriLocalname(
            node.id
          )}; Unknown node type: ${getUriLocalname(node.type)}`
        );
        return undefined;
    }
    return scenarioLayer;
  }

  /**
   * Given the index of a node, find the bitemporal timestamps that
   * that link to it (with the properties AbstractFeatureWithLifespan.validFrom and
   * AbstractFeatureWithLifespan.validTo) and return them as an object of Dates
   *
   * @param {number} d the index of the node
   * @returns {{validFrom:Date,validTo:Date}|undefined} return the object that represents the datum of a node
   */
  getBitemporalTimestampsByIndex(d) {
    const links = this.getLinksByIndex(d);
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
        `could not find bitemporal timestamps for ${this.getNodeByIndex(d).id}`
      );
      return;
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

  // / EVENTS

  static get EVENT_WORKSPACE_NODE_CLICKED() {
    return 'EVENT_WORKSPACE_NODE_CLICKED';
  }

  static get EVENT_WORKSPACE_NODE_MOUSEOVER() {
    return 'EVENT_WORKSPACE_NODE_MOUSEOVER';
  }

  static get EVENT_WORKSPACE_NODE_MOUSEOUT() {
    return 'EVENT_WORKSPACE_NODE_MOUSEOUT';
  }
}
