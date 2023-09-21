import { C3DTTemporalPrimaryTransaction } from './C3DTTemporalPrimaryTransaction.js';
import { C3DTTemporalTransactionAggregate } from './C3DTTemporalTransactionAggregate.js';
import { C3DTTemporalVersion } from './C3DTTemporalVersion.js';

/**
 * Implements the tileset part of the 3DTILES_temporal
 * extension. See the spec in
 * ./jsonSchemas/3DTILES_temporal.tileset.schema.json
 *
 * @class
 */
export class C3DTTemporalTileset {
  /**
   * A constructor function that creates a new object.
   *
   * @param {object} json - The JSON object that was returned from the server.
   * @param {string} json.startDate - startDate
   * @param {string} json.endDate - endDate
   * @param {object} json.transactions - transactions
   * @param {object} json.versions - versions
   */
  constructor(json) {
    /** @type {string} */
    this.startDate = json.startDate;
    /** @type {string} */
    this.endDate = json.endDate;

    /** @type {Array<object>} */
    this.transactions = [];
    /** Fill this.transactions */
    this.parseTransactions(json.transactions);

    /** @type {C3DTTemporalVersion} */
    this.temporalVersions = new C3DTTemporalVersion(json.versions);
    /** @type {object} */
    this.versionTransitions = json.versionTransitions;
  }

  /**
   * Parses transactions from a json file and creates primary and aggregated
   * transactions.
   *
   * @param {object} transactions The json holding the transactions.
   */
  parseTransactions(transactions) {
    for (let i = 0; i < transactions.length; i++) {
      let parsedTransac;
      if (transactions[i].type) {
        // Transactions aggregates don't have a type attribute
        parsedTransac = new C3DTTemporalPrimaryTransaction(transactions[i]);
      } else if (transactions[i].transactions) {
        // Primary transactions don't have a transactions attribute
        parsedTransac = new C3DTTemporalTransactionAggregate(transactions[i]);
        // Recursively parse the aggregated transactions.
        parsedTransac.transactions = this.parseTransactions(
          transactions[i].transactions
        );
      }
      this.transactions.push(parsedTransac);
    }
  }
}
