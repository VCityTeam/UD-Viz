import * as vis from 'vis-network';

import { get_data, get_list_options } from "./Utils/json_parser";

export class NetworkManagerSingleton {
    constructor(start_mode="default",
                id_network="mynetwork",
                id_button_location="mybuttons",
                hidden_button="mode"){
    /**
     * Constructor for singleton
     */
        const instance = this.constructor.instance;
        if(instance){
            return instance;
        }
        else{
            this.network = null;
            this.data = null;
            this.list_option = null;
            this.has_changed = true;
            this.current_mode = start_mode;
            this.id_network = id_network;
            this.id_button_location = id_button_location;
            this.hidden_button = hidden_button;

            this.constructor.instance = this;
        }

    }

    destroy() {
    /**
     * Kill the simulation network  
     */
        if (this.network !== null) {
          this.network.destroy();
          this.network = null;
        }
    }

    init(){
        this.prepare_html_pages();
    }

    get_option(mode){
    /**
     * Extract the matching options to a specific mode from the list_option
     * /!\ Working specificaly with vis.network
     * @param mode specific mode correspondong to a specific view
     * @return ready to used json for vis-network
     */
        var test = mode;
        if (mode === "default"){
            test = undefined
        }
        for (const key in this.list_option) {
            if (this.list_option.hasOwnProperty(key)) {
                const element = this.list_option[key];
                if (test === element.label){
                    return element.option.visNetwork;
                }
            }
        }
        return this.list_option[0].option.visNetwork;
    }

    add_button_to_view(){
    /**
     * Add button to navigate between view. There will be one button by options present in list_option
     * onClick will be a draw()
     */
        if (this.has_changed){
            for (const key in this.list_option) {
                if (this.list_option.hasOwnProperty(key)) {
                    const option = this.list_option[key];

                    

                    var button = document.createElement("button");

                    const new_label = option.label === undefined ? "default" : option.label;
                    var label = document.createTextNode(new_label.toString());
                    button.setAttribute("id", label);
                    button.setAttribute("class", "viewButton");

                    button.appendChild(label);

                    button.onclick = function (param) {
                        var n = new NetworkManagerSingleton ();
                        n.draw(param.target.innerText);
                    };

                    var element = document.getElementById(this.id_button_location);
                    const hidden_button = document.getElementById(this.hidden_button);
                    element.insertBefore(button, hidden_button);
                }
            }
        }
    }

    draw(mode="default") {
    /**
     * Draw the network inside the client page
     */
        this.current_mode = mode;
        this.destroy();  
    
        const options = this.get_option(this.current_mode);
        const container = document.getElementById(this.id_network);
        this.network = new vis.Network(container, this.data, options);

        this.has_changed = false;
    }

    prepare_html_pages() {
        
        var n = new NetworkManagerSingleton();
        var result_d = n.data;
        n.data = get_data(result_d);

        var result_o = n.list_option;
        n.list_option = get_list_options(result_o);

        n.draw();
    }


    add_event(callback){
        this.network.on("selectNode", function (params) {
            let nodeId = this.getNodeAt(params.pointer.DOM);
            let node = this.body.nodes[nodeId];
            let time = node.options.title;
            callback(time);
            });

        this.network.on("selectEdge", function (params) {
            let edgeId = this.getEdgeAt(params.pointer.DOM);
            let connectedNodesId = this.getConnectedNodes(edgeId);
            let from_time = this.body.nodes[connectedNodesId[0]].options.title
            let to_time = this.body.nodes[connectedNodesId[1]].options.title
            let time = (from_time/1 + to_time/1) / 2 ;
            callback(time);
            });
    }
}
