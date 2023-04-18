import { $3DTemporalPrimaryTransaction } from '../Model/3DTemporalPrimaryTransaction.js';
import { $3DTemporalTransactionAggregate } from '../Model/3DTemporalTransactionAggregate.js';
import { $3DTemporalVersion } from './3DTemporalVersion.js';

/**
 * Implements the tileset part of the 3DTILES_temporal
 * extension. See the spec in
 * ./jsonSchemas/3DTILES_temporal.tileset.schema.json
 *
 * @class
 */
export class $3DTemporalTileset {
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

    /** @type {$3DTemporalVersion} */
    this.temporalVersions = new $3DTemporalVersion(json.versions);
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
        parsedTransac = new $3DTemporalPrimaryTransaction(transactions[i]);
      } else if (transactions[i].transactions) {
        // Primary transactions don't have a transactions attribute
        parsedTransac = new $3DTemporalTransactionAggregate(transactions[i]);
        // Recursively parse the aggregated transactions.
        parsedTransac.transactions = this.parseTransactions(
          transactions[i].transactions
        );
      }
      this.transactions.push(parsedTransac);
    }
  }
}
