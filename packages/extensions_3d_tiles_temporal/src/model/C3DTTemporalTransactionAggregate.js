import { C3DTTemporalTransaction } from './C3DTTemporalTransaction';

/**
 * Implements the aggregated transaction of the 3DTILES_temporal
 * extension. See the spec in
 * ./jsonSchemas/3DTILES_temporal.transactionAggregate.schema.json
 *
 * @class
 */
export class C3DTTemporalTransactionAggregate extends C3DTTemporalTransaction {
  /**
   * It's a constructor for the Aggregate class
   *
   * @param {object} json - The JSON object that is used to create the transaction.
   */
  constructor(json) {
    super(json);

    /**
     * Creating an empty object.
     *
     * @type {object}
     */
    this.transactions = {};
    // Type testing is not reliable in javascript therefore we have to use
    // booleans to do so...
    /**
     *  A boolean flag that is used to check if the object is an aggregate. 
     *
    @type {boolean}
     */
    this.isAggregate = true;
  }
}
