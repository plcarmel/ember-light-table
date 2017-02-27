import Behavior from 'ember-light-table/behaviors/behavior';
import { keyDown } from 'ember-keyboard';

export default Behavior.extend({

  exclusionGroup: 'row-focus',

  init() {
    this._super(...arguments);
    this.events.onFocusToRow = ['rowMouseDown:_none', 'rowMouseDown:ctrl'];
    this.events.onGoDown = [keyDown('ArrowDown')];
    this.events.onGoUp = [keyDown('ArrowUp')];
  },

  onFocusToRow(ltBody, ltRow) {
    let row = ltRow.get('row');
    ltBody.set('table.focusedRow', row);
  },

  onGoDown(ltBody) {
    ltBody.set('table.focusIndex', ltBody.get('table.focusIndex') + 1);
  },

  onGoUp(ltBody) {
    ltBody.set('table.focusIndex', ltBody.get('table.focusIndex') - 1);
  }

});
