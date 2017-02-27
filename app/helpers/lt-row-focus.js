import Helper from '@ember/component/helper';
import FocusBehavior from 'ember-light-table/behaviors/row-focus/helper';

export default Helper.extend({

  compute() {
    return FocusBehavior.create();
  }

});
