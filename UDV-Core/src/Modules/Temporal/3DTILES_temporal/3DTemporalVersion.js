export class $3DTemporalVersion {
    constructor(json) {
        this.id = json.id;
        this.name = json.name;
        this.description = json.description;
        this.startDate = json.startDate;
        this.endDate = json.endDate;
        this.tags = json.tags;
        this.featuresIds = json.featuresIds;
    }
}