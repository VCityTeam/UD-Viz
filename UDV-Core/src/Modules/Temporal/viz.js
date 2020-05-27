import * as vis from 'vis-network';

import { get_data, get_list_options } from "./Utils/json_parser";

export class NetworkManagerSingleton {
    constructor(start_mode="default", id_network="mynetwork", id_button_location="mybuttons", hidden_button="mode"){
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
            this.data_ok = false;
            this.list_options_ok = false;
            this.list_option = null;
            this.has_changed = true;
            this.current_mode = start_mode;
            this.id_network = id_network;
            this.id_button_location = id_button_location;
            this.hidden_button = hidden_button

            this.constructor.instance = this;
        }

    }

    destroy() {
    /**
     * Kill the simulation network  
     */
        if (this.network !== null) {
            console.info("Network destroyed");
          this.network.destroy();
          this.network = null;
        }
    }

    init(url_data="http://localhost:5000/data.json", url_option="http://localhost:5000/options.json"){
        console.log("NetworkManager init from url data: %s || options: %s", url_data, url_option);
        this.prepare_html_pages(url_data, url_option);
    }

    get_option(mode){
    /**
     * Extract the matching options to a specific mode from the list_option
     * /!\ Working specificaly with vis.network
     * @param mode specific mode correspondong to a specific view
     * @return ready to used json for vis-network
     */
        console.log("Get option : %s", mode);
        var test = mode;
        if (mode === "default"){
            test = undefined
        }
        for (const key in this.list_option) {
            if (this.list_option.hasOwnProperty(key)) {
                const element = this.list_option[key];
                console.log("olala %o %o", test, element);
                if (test === element.label){
                    console.log("match");
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
        console.log("Try to add %s button(s)", this.list_option.length.toString());
        if (this.has_changed){
            for (const key in this.list_option) {
                if (this.list_option.hasOwnProperty(key)) {
                    const option = this.list_option[key];

                    

                    var button = document.createElement("button");

                    const new_label = option.label === undefined ? "default" : option.label;
                    console.log("Creating button with label : %s", new_label.toString());
                    var label = document.createTextNode(new_label.toString());
                    button.setAttribute("id", label);
                    button.setAttribute("class", "viewButton");

                    button.appendChild(label);

                    button.onclick = function (param) {
                        console.log("Button %s clicked : %o", param.target.innerText, param);
                        var n = new NetworkManagerSingleton ();
                        n.draw(param.target.innerText);
                    };

                    var element = document.getElementById(this.id_button_location);
                    const hidden_button = document.getElementById(this.hidden_button);
                    element.insertBefore(button, hidden_button);

                    console.info("Button added : %o", button.innerText);
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
        console.log("Drawing [ Mode : %s | Container : %o | Data : %o | Options : %o", this.current_mode, container, this.data, options);
        this.network = new vis.Network(container, this.data, options);
        console.info("Network drawn");
        console.log(this.network);

        this.has_changed = false;
    }

    prepare_html_pages(data_url, data_option) {
        //var button_load = document.getElementById("getData");
        //button_load.onclick = function(param) {
        
        var n = new NetworkManagerSingleton();
/*
            var request_d = new XMLHttpRequest();
            var result_d = null;
            request_d.open("GET", data_url);
            console.log("GET Request to %s", data_url.toString());
            request_d.onreadystatechange = function() {
                if(this.readyState === 4 && this.status === 200) {
                    result_d = JSON.parse(this.responseText);
                    console.log("result data: %o", result_d);
                    n.data = get_data(result_d);
                    if(n.data !== null){
                        n.data_ok = true;
                        if (n.list_options_ok){
                            n.add_button_to_view();
                            n.draw();
                        }
                    }
                }
            };
            request_d.send();

            var request_o = new XMLHttpRequest();
            var result_o = null;
            request_o.open("GET", data_option);
            console.log("GET Request to %s", data_option.toString());
            request_o.onreadystatechange = function() {
                if(this.readyState === 4 && this.status === 200) {
                    result_o = JSON.parse(this.responseText);
                    console.log("result option: %o", result_o);
                    n.list_option = get_list_options(result_o);
                    if(n.list_option !== null){
                        n.list_options_ok = true;
                        if (n.data_ok){
                            n.add_button_to_view();
                            n.draw();
                        }
                    }
                }
            };
            request_o.send();
*/

        //}
        // mode dégradé
        
        var data_received = {
            "nodes": [
                  {
                    "id": 0,
                    "label": "2009",
                    "level": 0,
                    "group": 0
                },
                {
                    "id": 1,
                    "label": "2012",
                    "level": 1,
                    "group": 0
                },
                {
                    "id": 2,
                    "label": "2015",
                    "level": 2,
                    "group": 0
                },
                {
                    "id": 3,
                    "label": "Limonest 2009",
                    "level": 0,
                    "group": 1,
                    "title": "2009"
                },
                {
                    "id": 4,
                    "label": "Limonest 2012",
                    "level": 1,
                    "group": 1,
                    "title": "2012"
                },
                {
                    "id": 5,
                    "label": "Limonest 2015",
                    "level": 2,
                    "group": 1,
                    "title": "2015"
                }
            ],
            "edges": [
                  {
                    "from": 0,
                    "to": 1
                },
                {
                    "from": 1,
                    "to": 2
                },
                {
                    "from": 3,
                    "to": 4
                },
                {
                    "from": 4,
                    "to": 5
                }
            ],
            "groups":[
                {
                    "id":0,
                    "label": "timeFrame"
                },
                {
                    "id":1,
                    "label": "consensusScenario"
                }
            ]
        };

        var options_received = {
            "options":
            [
              {
                    "visNetwork":{
                        "edges": 
                        {
                            "smooth": 
                            {
                            "type": "cubicBezier"
                            },
                            "arrows": { "to": true },
                            "font":{ "align": "middle",
                                    "size": 25,
                                    "color": '#FFFFFF',
                                    "strokeWidth": 0 // px
                                },
                            "length":200
                        },
                        "nodes":{
                            "font":{
                                "size":25
                            }

                        },
                        "groups":
                        {
                            "useDefaultGroups": true,
                            "timeFrame":{
                                "color":"white",
                                "hidden": false,
                            },
                            "consensusScenario":{
                                "color": "green"
                            }
                        },
                        "layout": 
                        {
                            "hierarchical": 
                            {
                                "direction": "LR",
                                "sortMethod": "directed",
                                "treeSpacing": 100,
                                "levelSeparation": 250,
                                "nodeSpacing": 100,
                            }
                        },
                        "interaction": { "dragNodes": false },
                        "physics": 
                        {
                        "enabled": false
                        }
                    }
                }
            ]
        };

        var result_d = data_received;
        console.log("result data: %o", result_d);
        n.data = get_data(result_d);
        n.data_ok = true;

        var result_o = options_received;
        console.log("result option: %o", result_o);
        n.list_option = get_list_options(result_o);
        n.list_options_ok = true;

        //n.add_button_to_view();
        n.draw();
    }


    add_event(callback){
        this.network.on("click", function (params) {
            let nodeId = this.getNodeAt(params.pointer.DOM);
            let node = this.body.nodes[nodeId];
            let time = node.options.title;
                console.log("node : %o",time);
                callback(time);
            });
    }
}
/*
// test
window.addEventListener("load", () => {
    console.log("Start");
    var n = new NetworkManagerSingleton();
    n.init();
    });
*/
