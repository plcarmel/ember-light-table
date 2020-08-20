// BEGIN-SNIPPET table-common
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import Table from 'ember-light-table';
import { task } from 'ember-concurrency';

export default Mixin.create({
  store: service(),

  page: 0,
  limit: 10,
  dir: 'asc',
  sort: 'firstName',

  isLoading: computed.oneWay('fetchRecords.isRunning'),
  canLoadMore: true,
  enableSync: true,

  model: null,
  meta: null,
  columns: null,
  table: null,

  init() {
    this._super(...arguments);

    let table = Table.create({ columns: this.columns, rows: this.model, enableSync: this.enableSync });
    let sortColumn = table.get('allColumns').findBy('valuePath', this.sort);

    // Setup initial sort column
    if (sortColumn) {
      sortColumn.set('sorted', true);
    }

    this.set('table', table);
  },

  fetchRecords: task(function*() {
    let records = yield this.store.query('user', { page: this.page, limit: this.limit, sort: this.sort, dir: this.dir });
    this.model.pushObjects(records.toArray());
    this.set('meta', records.get('meta'));
    this.set('canLoadMore', !isEmpty(records));
  }).restartable(),

  actions: {
    onScrolledToBottom() {
      if (this.canLoadMore) {
        this.incrementProperty('page');
        this.fetchRecords.perform();
      }
    },

    onColumnClick(column) {
      if (column.sorted) {
        this.setProperties({
          dir: column.ascending ? 'asc' : 'desc',
          sort: column.get('valuePath'),
          canLoadMore: true,
          page: 0
        });
        this.model.clear();
      }
    }
  }
});
// END-SNIPPET
