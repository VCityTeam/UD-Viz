import { $3DTemporalVersionTransition } from '../3DTILES_temporal/3DTemporalVersionTransition';


export class VersionTransitionsManager {
    constructor(versionTransitions) {
        this.versionTransitions = this.parseVersionTransition(versionTransitions);
    }

    parseVersionTransition(versionTransitions){

        const parsedVersionTransition = [];

        let versionTransition;
        let item;
        for (let i = 0; i < versionTransitions.length; i++) {
            item = versionTransitions[i];
            console.log(item)
            versionTransition = new $3DTemporalVersionTransition(item);
            parsedVersionTransition.push(versionTransition);

        }
        return parsedVersionTransition
    }
}

