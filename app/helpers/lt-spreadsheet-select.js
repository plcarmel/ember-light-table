import Helper from '@ember/component/helper';
import SpreadsheetSelectBehavior from 'ember-light-table/behaviors/spreadsheet-select/helper';

export default Helper.extend({

  compute() {
    return SpreadsheetSelectBehavior.create();
  }

});
