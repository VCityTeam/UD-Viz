import { $3DTemporalTransaction } from './3DTemporalTransaction.js';

export class $3DTemporalTransactionAggregate extends $3DTemporalTransaction {
    constructor(json) {
        super(json);

        // TODO: pas top top que ce soit rempli par le transactionmanager
        this.transactions = {};

        this.isAggregate = true;
    }
}
