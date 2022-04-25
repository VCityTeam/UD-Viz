import * as d3 from 'd3';
import { SparqlQueryWindow } from '../View/SparqlQueryWindow';

export class Table {
  /**
   * Create a new Table using D3.
   * @param {SparqlQueryWindow} window The window the table is attached to.
   */
  constructor(window) {
    this.window = window;
    this.data = undefined;
    this.columns = [];
    this.sortAscending = undefined;
    this.table = undefined;
    this.thead = undefined;
    this.tbody = undefined;
    this.rows = undefined;
  }

  /**
   * Render the table.
   * @param {Object} data The data to render.
   * @param {Array} columns The columns to render.
   */
  dataAsTable(data, columns) {
    this.data = data;
    this.columns = columns;
    this.filter_div = document.createElement('div');
    this.filter_div.id = this.filterId;
    this.filter_div.innerHTML = this.filterHtml;
    this.window.dataView.appendChild(this.filter_div);
    this.columns.forEach((c) => {
      let option = document.createElement('option');
      option.value = c;
      option.text = c;
      this.filterSelect.append(option);
    });

    this.sortAscending = true;
    this.table = d3.select('#' + this.window.dataViewId).append('table');
    this.thead = this.table.append('thead');
    this.tbody = this.table.append('tbody');

    Table.update(this, []);
  }
  /**
   * Update the table with new data.
   * @param {Table} table The table object to update.
   * @param {Event} event The event passed to the update function.
   */
  static update(table, event) {
    table.clearTable();
    let filterValue = table.filterInput.value;

    let column;
    //check if element filter input is changed
    if (event.target) {
      filterValue = event.target.value;
      column = table.filterSelect.value;
    }
    //filter data by filtertype
    let dataFilter;
    if (filterValue && filterValue !== '') {
      dataFilter = table.data.filter(function (d, i) {
        if (
          typeof d[column].value === 'string' &&
          d[column].value.includes(filterValue)
        ) {
          return d;
        } else if (
          typeof d[column].value === 'number' &&
          d[column].value == filterValue
        ) {
          return d;
        }
      });
    } else {
      dataFilter = table.data;
    }
    //append the header row and click event on column to sort table by table column
    const headers = table.thead
      .append('tr')
      .selectAll('th')
      .data(table.columns)
      .enter()
      .append('th')
      .text(function (column) {
        return column;
      })
      .style('cursor', 'pointer')
      .on('click', function (d) {
        headers.attr('class', 'header');

        if (table.sortAscending) {
          //sort tables rows data
          table.rows._groups[0].sort(function (a, b) {
            return d3.ascending(
              a.__data__[d.srcElement.__data__].value,
              b.__data__[d.srcElement.__data__].value
            );
          });
          //update rows in table
          table.rows.sort(function (a, b) {
            return d3.descending(b[d], a[d]);
          });
          table.sortAscending = false;
          this.className = 'aes';
        } else {
          table.rows._groups[0].sort(function (a, b) {
            return d3.descending(
              a.__data__[d.srcElement.__data__].value,
              b.__data__[d.srcElement.__data__].value
            );
          });
          table.rows.sort(function (a, b) {
            return d3.descending(b[d], a[d]);
          });
          table.sortAscending = true;
          this.className = 'des';
        }
      });
    headers.append('title').text('click to sort');
    if (dataFilter.length == 0) {
      const noResultDiv = document.createElement('div');
      noResultDiv.id = 'no_result';
      noResultDiv.innerHTML = 'No result found, try again!';
      document
        .getElementById('_window_sparqlQueryWindow_data_view')
        .appendChild(noResultDiv);
    } else {
      // create a row for each object in the data
      table.rows = table.tbody
        .selectAll('tr')
        .data(dataFilter)
        .enter()
        .append('tr');
      table.rows.exit().remove();
      let columns = table.columns;
      table.rows
        .selectAll('td')
        .data(function (d) {
          return columns.map(function (k) {
            return {
              col: k,
              row: d,
            };
          });
        })
        .enter()
        .append('td')
        .attr('data-th', function (d) {
          return d.col;
        })
        .text(function (d) {
          return d.row[d.col].value;
        })
        .on('click', (d) => {
          let col = d.target.__data__.col;
          let row = d.target.__data__.row;
          table.window.sendEvent(Table.EVENT_CELL_CLICKED, row[col].value);
        });
    }
  }

  /**
   * Clear table.
   */
  clearTable() {
    this.table.selectAll('tr').remove();
    this.table.selectAll('td').remove();
    const element = document.getElementById('no_result');
    if (element) element.parentNode.removeChild(element);
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
    return `${this.window.windowId}_filter`;
  }

  get filterSelectId() {
    return `${this.window.windowId}_filter_select`;
  }

  get filterSelect() {
    return document.getElementById(this.filterSelectId);
  }

  get filterInputId() {
    return `${this.window.windowId}_filter_input`;
  }

  get filterInput() {
    return document.getElementById(this.filterInputId);
  }

  /// EVENTS

  static get EVENT_CELL_CLICKED() {
    return 'EVENT_CELL_CLICKED';
  }

  static get EVENT_CELL_MOUSEOVER() {
    return 'EVENT_CELL_MOUSEOVER';
  }
}
