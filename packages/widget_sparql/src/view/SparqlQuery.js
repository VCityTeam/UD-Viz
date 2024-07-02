/** @class */
export class SparqlQuery {
  constructor() {
    this.select_variable = [];
    this.where_conditions = []; // "?subject ?predicate ?object ; a ?subjectType."
    this.options = []; // ["FILTER","?subject a bldg Building"] or ["OPTIONAL","?object a ?objectType"]
    this.prefix = []; // ["bldg", "https://dataset-dl.liris.cnrs.fr/rdf-owl-urban-data-ontologies/Ontologies/CityGML/3.0/building#"]
  }

  /**
   * Generate the SPARQL query
   *
   * @returns {string} the query
   */
  generateQuery() {
    let strQuery = '';
    if (this.prefix.length) {
      for (const prefix of this.prefix) {
        strQuery += 'PREFIX ' + prefix[0] + ': <' + prefix[1] + '>\n';
      }
      strQuery += '\n';
    }
    if (this.select_variable.length) {
      strQuery += 'SELECT';
      for (const variable of this.select_variable) {
        strQuery += ' ?' + variable;
      }
      strQuery += '\nWHERE {\n';
      const n = this.where_conditions.length;
      if (n) {
        for (let i = 0; i < n; i++) {
          if (i != 0) strQuery += ' UNION';
          strQuery += '\t{';
          for (const line of this.where_conditions[i]) {
            strQuery += '\n\t\t' + line;
          }
          strQuery += '\n\t}';
        }
      }
      strQuery += '\n';
      if (this.options.length) {
        for (const option of this.options) {
          if (option[0] == 'FILTER')
            strQuery += '\t' + option[0] + ' (' + option[1] + ')\n';
          if (option[0] == 'OPTIONAL')
            strQuery += '\t' + option[0] + ' {' + option[1] + '}\n';
        }
      }
      strQuery += '}';
    }
    return strQuery;
  }
}
