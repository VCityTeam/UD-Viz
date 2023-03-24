/**
 * Implements the version concept of the 3DTILES_temporal
 * extension. See the spec in
 * ./jsonSchemas/3DTILES_temporal.version.schema.json
 *
 * @class
 */
export class $3DTemporalVersion {
  /**
   * It takes a JSON object as input, and returns a JSON object that can be used by the graph window
   *
   * @param {Array<object>} json - the json object containing the data
   * @param {string} json[].name - name
   * @param {number} json[].i - index
   * @param {string} json[].group - group
   * @param {string} json[].description - description
   */
  constructor(json) {
    /**
     * Assigning the value of the parameter `json` to the property `versions` of the object.
     *
     * @type {Array<{label:string,level:number,group:string,title:string}>}
     */
    this.versions = json;
    for (let i = 0; i < json.length; i++) {
      // Add the fields missing for the graph window
      this.versions[i].label = json[i].name;
      this.versions[i].level = i;
      this.versions[i].group = 'consensusScenario'; // Needs to be changed if one wants multiple scenario
      this.versions[i].title = json[i].description;
    }
  }
}
