import { $3DTemporalVersionTransition } from '../3DTILES_temporal/3DTemporalVersionTransition';

/**
Manage the version transitions found in the tileset.json
Only do parsing
*/
export class VersionTransitionsManager {
    constructor(versionTransitions) {
        this.versionTransitions = this.parseVersionTransition(versionTransitions);
    }

    /**
    * Parse the version transitions coming from the tileset.json
    * @params : versions transitions (list of dict)
    * @return : [$3DTemporalVersion]
    */
    parseVersionTransition(versionTransitions){

        const parsedVersionTransition = [];

        let versionTransition;
        let item;
        for (let i = 0; i < versionTransitions.length; i++) {
            item = versionTransitions[i];
            versionTransition = new $3DTemporalVersionTransition(item);
            parsedVersionTransition.push(versionTransition);

        }
        return parsedVersionTransition
    }
}

