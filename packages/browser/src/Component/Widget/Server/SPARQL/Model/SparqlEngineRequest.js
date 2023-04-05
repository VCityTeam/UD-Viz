
/** @class */
export class SparqlEngineRequest {
    config = {};

    constructor(config) {
        this.config = config;
    }

    get method() {
        switch (this.config.engine) {
            case 'strabon':
                return 'GET';
            case 'blazegraph':
            default:
                return 'POST';
        }
    }

    get fullUrl() {
        switch (this.config.engine) {
            case 'strabon':
                // http://localhost:8997/strabon/Query?handle=download&format=SPARQL/JSON&view=HTML&query=SELECT%20*%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D
                return this.config.url + 'strabon/Query' + '?handle=download&format=SPARQL/JSON&view=HTML&query=' + encodeURIComponent(this.config.query);
            case 'blazegraph':
                // http://localhost:8080/bigdata/sparql?query=SELECT%20*%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D
            default:
                return this.config.url + 'bigdata/sparql' + '?query=' + encodeURIComponent(this.config.query);
        }
    }

    get options() {
        return this.config.options;
    }
}
  