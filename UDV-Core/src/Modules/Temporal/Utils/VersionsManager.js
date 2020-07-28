import { $3DTemporalVersion } from '../3DTILES_temporal/3DTemporalVersion';

/**
Manage the version found in the tileset.json
Only do parsing
*/
export class VersionsManager {

    constructor(versions) {
        this.versions = this.parseVersion(versions);
    }
    /**
    * Parse the version coming from the tileset.json
    * @params : versions (list of dict)
    * @return : [$3DTemporalVersion]
    */
    parseVersion(versions){

        const parsedVersion = [];

        let version;
        let item;
        for (let i = 0; i < versions.length; i++) {
            item = versions[i];
            version = new $3DTemporalVersion(item);
            parsedVersion.push(version);

        }
        return parsedVersion
    }
}

