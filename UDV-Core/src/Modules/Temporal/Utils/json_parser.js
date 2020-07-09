export function get_data(json_object) {
/**
 * Get the data for vis.Network
 * @param: json object that contains nodes and edges
 * @returns: data, a dictionnary ready for vis.Netowrk
 */
    var nodes  = get_nodes(json_object);
    const dict_group = json_object.groups;
    for (const key in nodes) {
        if (nodes.hasOwnProperty(key)) {
            const node = nodes[key];

            for (const key1 in dict_group) {
                if (dict_group.hasOwnProperty(key1)) {
                    const group = dict_group[key1];

                    if (node.group === group.id){
                        node.group = group.label;
                    }
                    
                }
            }
        }
    }
    const data = {
        nodes: get_nodes(json_object),
        edges: get_edges(json_object)
      };
    return data;
}

function get_nodes(json_object) {
/**
 * Extract nodes from json object
 * @param: json_object with nodes
 * @returns: list of nodes as : [
 *        { id: 0, label: "2000", level: 0, group:0},
 *        { id: 1, label: "2001", level: 1, group:0},
 *        ]
 */
    var ret = json_object.nodes;
    //TODO verification for key
    return ret;
    
}

function get_edges(json_object) {
/**
 * Extract edges from json object
 * @param: json_object with edges
 * @returns: list of edges as : [
 *       { from: 4, to: 5},
 *       { from: 6, to: 7, color: "black", label:"split"},
 *        ]
 */
    var ret = json_object.edges;
    //TODO verification for key
    return ret;
    
}

function get_modes(json_object){
/**
 * Get all the mode specified in the json object. 
 * !!! They sould be found only in json.options.mode
 * @param: json object with json.options
 * @return: list[str] with unicity
 */
    var ret = [undefined]; // if mode is not present inside the json. The default value will be undifined
    var list_option = json_object.options;
    for (const option in list_option) {               // -\
        if (list_option.hasOwnProperty(option)) {     // - > = for in
            const element = list_option[option];      // -/
            if (element.mode !== undefined){
                ret.push(element.mode);
            }
        }
    }
    return ret;
}

function get_option_by_mode(json_object, mode){
/**
 * Get option for vis.Network from json config.
 * !!! No default filling or any smart thing. All options will come from the json
 * @param json_object with json.options
 * @param mode : string to match options or "undefined" for default 
 * @returns json object if option found if not null
 */
    var ret = null;
     
    var list_options = json_object.options;
    if (list_options === undefined){
        return ret;
    }

    for (const key in list_options) {
        if (list_options.hasOwnProperty(key)) {
            const option = list_options[key];
            
            if (mode === option.mode){
                ret = option;
                return ret;
            }
        }
    }
    return ret;


}

export function get_list_options(json_object) {
/**
 * Get all options for all view
 * @param json_object json object for vis.Network
 * @returns list of json object with complete and ready options for vis.Network
 */    
    var ret = [];
    var list_mode = get_modes(json_object);

    for (const option in list_mode) {
        if (list_mode.hasOwnProperty(option)) {
            const mode = list_mode[option];

            ret.push({
                "label": mode,
                "option": get_option_by_mode(json_object, mode)
            });
            
        }
    }

    return ret;
    
}
