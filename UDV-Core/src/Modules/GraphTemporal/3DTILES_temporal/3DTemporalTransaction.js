export class $3DTemporalTransaction {
    constructor(json) {
        this.id = json.id;
        this.startDate = json.startDate;
        this.endDate = json.endDate;
        this.source = json.source;
        this.destination = json.destination;
        this.tags = json.tags;
    }
}
