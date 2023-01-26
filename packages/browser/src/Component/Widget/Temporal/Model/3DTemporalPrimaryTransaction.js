import { $3DTemporalTransaction } from './3DTemporalTransaction.js';

/**
 * Implements the primary transaction of the 3DTILES_temporal
 * extension. See the spec in
 * ./jsonSchemas/3DTILES_temporal.primaryTransaction.schema.json
 *
 * @class
 */
export class $3DTemporalPrimaryTransaction extends $3DTemporalTransaction {
  constructor(json) {
    super(json);
    /**
     * Type testing is not reliable in javascript therefore we have to use`
     *
       @type {string} */
    this.type = json.type;

    /**
     * booleans to do so...
     *
       @type {boolean} */
    this.isPrimary = true;
  }
}
