/**
 * Implements the transaction concept of the 3DTILES_temporal
 * extension. See the spec in
 * ./jsonSchemas/3DTILES_temporal.transaction.schema.json
 *
 * @class
 */
export class $3DTemporalTransaction {
  /**
   * The constructor function is a special function that is called when an object is created from a
   * class
   *
   * @param {object} json - The JSON object that is passed in from the server.
   * @param {number} json.id - id.
   * @param {any} json.startDate - startDate.
   * @param {any} json.endDate - endDate.
   * @param {any} json.source - source.
   * @param {string} json.destination - destination.
   * @param {string} json.tags - tags.
   */
  constructor(json) {
    /** @type {number} */
    this.id = json.id;
    /** @type {any} */
    this.startDate = json.startDate;
    /** @type {any} */
    this.endDate = json.endDate;
    /** @type {any} */
    this.source = json.source;
    /** @type {string} */
    this.destination = json.destination;
    /** @type {string} */
    this.tags = json.tags;
  }
}
