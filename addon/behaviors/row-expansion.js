import Behavior from 'ember-light-table/behaviors/behavior';

export default Behavior.extend({

  exclusionGroup: 'row-expansion',

  // passed in
  multiRow: true,
  expandOnClick: true,

  init() {
    this._super(...arguments);
    this.events.onToggleExpandedRow = ['rowClick:_none'];
  },

  onToggleExpandedRow(ltBody, row) {
    if (this.get('expandOnClick')) {
      let shouldExpand = !row.get('expanded');
      if (!this.get('multiRow')) {
        ltBody.get('table.expandedRows').setEach('expanded', false);
      }
      row.set('expanded', shouldExpand);
    }
  }

});
