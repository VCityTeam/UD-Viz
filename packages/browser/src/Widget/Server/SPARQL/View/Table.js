import * as d3 from 'd3';
import * as THREE from 'three';

/** @class */
export class Table extends THREE.EventDispatcher {
  /**
   * Create a new Table using D3.
   *
   */
  constructor() {
    super();
    /** @type {HTMLElement} */
    this.domElement = null;

    /** @type {HTMLElement} */
    this.filterSelect = null;

    /** @type {HTMLElement} */
    this.noResultDiv = null;

    this.initHtml();

    this.data = null;
    this.columns = [];
    this.sortAscending = null;
    this.thead = null;
    this.tbody = null;
    this.rows = null;
    this.table = d3
      .select(this.domElement)
      .append('table')
      .style('overflow', 'scroll');
  }

  /**
   * Format and update the data in the table with data.
   *
   * @param {object} data The data to render.
   * @param {Array} columns The columns to render.
   */
  dataAsTable(data, columns) {
    this.data = data;
    this.columns = columns;
    const options = this.filterSelect.getElementsByTagName('option');
    for (let i = options.length; i > 0; i--) {
      this.filterSelect.remove(options.item(i));
    }
    this.columns.forEach((c) => {
      const option = document.createElement('option');
      option.value = c;
      option.text = c;
      this.filterSelect.append(option);
    });

    this.sortAscending = true;

    Table.update(this, []);
  }
  /**
   * Update the table with new data.
   *
   * @param {Table} table The table object to update.
   * @param {Event} event The event passed to the update function.
   */
  static update(table, event) {
    table.clearTable();
    table.thead = table.table.append('thead');
    table.tbody = table.table.append('tbody');
    let filterValue = table.filterInput.value;

    let column;
    // Check if element filter input is changed
    if (event.target) {
      filterValue = event.target.value;
      column = table.filterSelect.value;
    }
    // Filter data by filtertype
    let dataFilter;
    if (filterValue && filterValue !== '') {
      dataFilter = table.data.filter(function (d) {
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
    // Append the header row and click event on column to sort table by table column
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
          // Sort tables rows data
          table.rows._groups[0].sort(function (a, b) {
            return d3.ascending(
              a.__data__[d.srcElement.__data__].value,
              b.__data__[d.srcElement.__data__].value
            );
          });
          // Update rows in table
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
      table.noResultDiv.style['display'] = 'block';
    } else {
      table.noResultDiv.style['display'] = 'none';
      // Create a row for each object in the data
      table.rows = table.tbody
        .selectAll('tr')
        .data(dataFilter)
        .enter()
        .append('tr');
      table.rows.exit().remove();
      const columns = table.columns;
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
          if (d.row[d.col] && d.row[d.col].value) {
            return d.row[d.col].value;
          }
          return '';
        })
        .on('click', (event, datum) => {
          table.dispatchEvent({
            type: 'click',
            message: 'cell click event',
            event: event,
            datum: datum,
          });
        })
        .on('mouseover', (event, datum) => {
          table.dispatchEvent({
            type: 'mouseover',
            message: 'cell mouseover event',
            event: event,
            datum: datum,
          });
        })
        .on('mouseout', (event, datum) => {
          table.dispatchEvent({
            type: 'mouseout',
            message: 'cell mouseout event',
            event: event,
            datum: datum,
          });
        });
    }
  }

  /**
   * Clear table.
   */
  clearTable() {
    if (this.table) {
      this.table.selectAll('thead').remove();
      this.table.selectAll('tbody').remove();
    }
    this.noResultDiv.style['display'] = 'none';
  }

  /**
   * Initialize the html of the view
   */
  initHtml() {
    this.domElement = document.createElement('div');
    const filterDiv = document.createElement('div');
    this.domElement.appendChild(filterDiv);
    const filterLabel = document.createElement('label');
    filterLabel.innerText = 'Select filter: ';
    filterDiv.appendChild(filterLabel);
    this.filterSelect = document.createElement('select');
    filterDiv.appendChild(this.filterSelect);
    const typeLabel = document.createElement('label');
    filterLabel.innerText = 'Type filter value: ';
    filterDiv.appendChild(typeLabel);
    this.filterInput = document.createElement('input');
    this.filterInput.type = 'text';
    this.filterInput.value = '';
    filterDiv.appendChild(this.filterInput);
    this.noResultDiv = document.createElement('div');
    this.noResultDiv.innerHTML = 'No result found, try again!';
    this.noResultDiv.style['display'] = 'none';
    this.domElement.appendChild(this.noResultDiv);
  }
}
