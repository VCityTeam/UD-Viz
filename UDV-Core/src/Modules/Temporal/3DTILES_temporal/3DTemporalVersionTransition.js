export class $3DTemporalVersionTransition {
    constructor(json) {
        this.id = json.id;
        this.name = json.name;
        this.description = json.description;
        this.startDate = json.startDate;
        this.endDate = json.endDate;
        this.from = json.from;
        this.to = json.to;
        this.type = json.type;
        this.transactionsIds = json.transactionsIds;
    }
}