export class $3DTemporalBoundingVolume {
    constructor(json) {
        this.startDate = json.startDate;
        this.endDate = json.endDate;
    }

    culling(currentTime) {
        // Bounding volume culling
        if (this.startDate > currentTime || this.endDate < currentTime) {
            return true;
        }
    }
}
