import * as d3 from 'd3';
import { SparqlQueryWindow } from '../View/SparqlQueryWindow';

export class Table {
  /**
   * Create a new Table using D3.
   * @param {SparqlQueryWindow} parentWindow The SparqlQueryWindow the table is attached to.
   */
  constructor(parentWindow) {
    this.parentWindow = parentWindow;
  }

  /**
   * Render the table.
   * @param {Object} data The data to render.
   * @param {Array} columns The columns to render.
   */
  dataAsTable(data, columns) {
    this.filter_div = document.createElement('div');
    this.filter_div.id = this.filterId;
    this.filter_div.innerHTML = this.filterHtml;
    this.parentWindow.dataView.appendChild(this.filter_div);
    columns.forEach(c => {
      let option = document.createElement('option');
      option.value = c;
      option.text = c;
      this.filterSelect.append(option);
    });
    
    var sortAscending = true;
    var table = d3.select('#' + this.parentWindow.dataViewId).append('table')
    var thead = table.append('thead');
    var tbody = table.append('tbody');
    // var filter = this.filterInput;
    var filterValue = this.filterInputId.value;
    //Add event listener on input field to update table
    // this.parentWindow.addEventListener(Table.FILTER_CHANGED, updates);

    updates([])
    function updates(e){
      //clear old table
      table.selectAll("tr").remove()
      table.selectAll("td").remove()
      var element = document.getElementById("no_result");
      if(element)
        element.parentNode.removeChild(element);
      //check if element filter input is changed
      if (e.target) {
        filterValue = e.target.value
        var column = filterSelect.value;
      }
      //filter data by filtertype
      if (filterValue && filterValue !== ""){
        var dataFilter = data.filter(function(d,i){
          if ((typeof d[column] === "string"  && d[column].includes(filterValue)) || (typeof d[column] === "number" && d[column] == filterValue))
          {
            return d;
          };
        });
      }else {
        var dataFilter=data
      }

      //append the header row and click event on column to sort table by this column
      var headers = thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
      .text(function (column) { return column; })
      .style('cursor','pointer')
      .on('click', function (d) {
        headers.attr('class', 'header');

        if (sortAscending) {
          //sort tables rows data
          rows._groups[0].sort(function(a, b) {
            return d3.ascending(a.__data__[d.srcElement.__data__], b.__data__[d.srcElement.__data__]);
          });
          //update rows in table
          rows.sort(function(a, b) {
            return d3.descending(b[d], a[d]);
          });
          sortAscending = false;
          this.className = 'aes';
          }
        else {
          rows._groups[0].sort(function(a, b) {
            return d3.descending(a.__data__[d.srcElement.__data__], b.__data__[d.srcElement.__data__]);
          });
          rows.sort(function(a, b) {
            return d3.descending(b[d], a[d]);
          });
          sortAscending = true;
          this.className = 'des';
        }
      });
      headers.append("title").text("click to sort");
      if (dataFilter.length == 0) {
        var noResultDiv = document.createElement('div');
        noResultDiv.id = "no_result";
        noResultDiv.innerHTML = "No result found, try again!";
        document.getElementById('_window_sparqlQueryWindow_data_view').appendChild(noResultDiv);
      }

      else {
        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
                      .data(dataFilter).enter()
                      .append('tr');
        rows.exit().remove();
        rows.selectAll('td')
          .data(function (d) {
              return columns.map(function (k) {
                  return {
                    'col': k,
                    'row': d
                  };
              });
          }).enter()
          .append('td')
          .attr('data-th', function (d) {
              return d.col;
          })
          .text(function (d) {
              return d.row[d.col]['value'];
          });
      }


    }
  }

  // Table getters //
  get filterHtml() {
    return /*html*/ `
      <label>Select filter: </label>
      <select id="${this.filterSelectId}"/>
      <label>Type filter value: </label>
      <input id="${this.filterInputId}" type="text" value=""/>`;
  }

  get filterId() {
    return `${this.parentWindow.windowId}_filter`;
  }

  get filterSelectId() {
    return `${this.parentWindow.windowId}_filter_select`;
  }

  get filterSelect() {
    return document.getElementById(this.filterSelectId);
  }

  get filterInputId() {
    return `${this.parentWindow.windowId}_filter_input`;
  }

  get filterInput() {
    return document.getElementById(this.filterInputId);
  }

  static get FILTER_CHANGED() {
    return 'FILTER_CHANGED';
  }
}
