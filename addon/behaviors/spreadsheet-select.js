import { A as emberArray } from '@ember/array';
import { run } from '@ember/runloop';
import { keyDown, keyUp } from 'ember-keyboard';
import withBackingField from 'ember-light-table/utils/with-backing-field';
import SelectAll from './select-all';
import RowRange from './common/row-range';

export default SelectAll.extend({

  init() {
    this._super(...arguments);
    this.events.onExtendRange = ['rowMouseDown:shift'];
    this.events.onRangeDown = [keyDown('ArrowDown+shift')];
    this.events.onRangeUp = [keyDown('ArrowUp+shift')];
    this.events.onSelectNone = ['rowMouseDown:_none', keyDown('ArrowDown'), keyDown('ArrowUp'), keyDown('Escape')];
    this.events.onStopRangeUpDown = [keyUp('ShiftLeft')];
    this.events.onRowMouseStartNewSelection = ['rowMouseDown:_none'];
    this.events.onRowMouseStartAddRange = ['rowMouseDown:ctrl'];
    this.events.onRowMouseEndNewSelection = ['rowMouseUp:_all'];
    this.events.onRowMouseEndAddRange = ['rowMouseUp:_all'];
    this.events.onRowMouseNewSelectionMove = ['rowMouseMove:_all'];
    this.events.onRowMouseAddRangeMove = ['rowMouseMove:_all'];
  },

  /*
   * A cell is selected if it is inside an odd number of ranges.
   */
  ranges: withBackingField('_ranges', () => emberArray()),

  _rangeUpDownActive: false,
  _mouseNewSelectionAnchor: null,
  _mouseNewSelectionActive: false,
  _mouseAddRangeActive: false,

  _createNewRange(a, b = a) {
    let rn = RowRange.create({ a, b });
    rn.on('handleMove', this, this.onHandleMove);
    rn.on('handleDrop', this, this.onHandleDrop);
    return rn;
  },

  _simplifyRanges() {
    let ranges = this.get('ranges');
    let max
      = Math.max(
        ranges.mapBy('a').reduce((x, y) => Math.max(x, y), -1),
        ranges.mapBy('b').reduce((x, y) => Math.max(x, y), -1)
      );
    let isSelected = emberArray();
    for (let i = 0; i <= max; i++) {
      isSelected.pushObject(this.findRanges(i).get('length') % 2 === 1);
    }
    let anchor;
    if (ranges.get('length')) {
      anchor = ranges.objectAt(0).get('a');
      this._clearRanges();
      let rn = null;
      for (let i = 0; i <= max; i++) {
        let isSel = isSelected.objectAt(i);
        if (rn && !isSel) {
          rn.set('b', i - 1);
          ranges.pushObject(rn);
          rn = null;
        } else if (!rn && isSel) {
          rn = this._createNewRange(i);
        }
      }
      if (rn) {
        rn.set('b', max);
        ranges.pushObject(rn);
      }
    }
    let rn0 = ranges.find((rn) => rn.get('a') === anchor || rn.get('b') === anchor);
    if (rn0) {
      let a = rn0.get('a');
      let b = rn0.get('b');
      if (a !== anchor) {
        rn0.setProperties({ a: b, b: a });
      }
      ranges.removeObject(rn0);
      ranges.insertAt(0, rn0);
    }
  },

  _applyDomModifications(ltBody) {
    this.get('ranges').forEach((r) => r.applyDomModifications(ltBody));
  },

  _revertDomModifications(ltBody) {
    this.get('ranges').forEach((r) => r.revertDomModifications(ltBody));
  },

  syncSelection(table) {
    table
      .get('rows')
      .forEach((r, i) => r.set('selected', this.findRanges(i).get('length') % 2 === 1));
  },

  _thenSimplify(ltBody) {
    this._revertDomModifications(ltBody);
    this._simplifyRanges();
    this._applyDomModifications(ltBody);
  },

  _noSimplification(ltBody) {
    this.syncSelection(ltBody.get('table'));
    this._applyDomModifications(ltBody);
  },

  _immediateSimplification(ltBody) {
    this.syncSelection(ltBody.get('table'));
    this._simplifyRanges();
    this._applyDomModifications(ltBody);
  },

  findRanges(i) {
    return emberArray(
      this
        .get('ranges')
        .filter((rn) => rn.get('realFirst') <= i && i <= rn.get('realLast'))
    );
  },

  _clearRanges() {
    this.get('ranges').clear();
  },

  _startNewRange(i) {
    let rn = this._createNewRange(i);
    this.get('ranges').insertAt(0, rn);
  },

  _extendRangeTo(ltBody, b) {
    let table = ltBody.get('table');
    b = Math.max(0, Math.min(table.get('rows.length') - 1, b));
    let ranges = this.get('ranges');
    if (ranges.get('length')) {
      let rn = ranges.objectAt(0);
      rn.set('b', b);
    } else {
      let a = table.get('focusIndex');
      if (a === -1) {
        a = b;
      }
      let rn = this._createNewRange(a, b);
      ranges.pushObject(rn);
    }
    run.schedule('afterRender', null, () => ltBody.makeRowAtVisible(b));
  },

  _moveRange(ltBody, direction) {
    let ranges = this.get('ranges');
    let focusIndex = ltBody.get('table.focusIndex');
    if (ranges.get('length')) {
      ranges.objectAt(0).move(ltBody, focusIndex, direction);
    } else {
      this._extendRangeTo(ltBody, focusIndex + direction);
    }
  },

  onExtendRange(ltBody, ltRow) {
    this._revertDomModifications(ltBody);
    let row = ltRow.get('row');
    this._extendRangeTo(ltBody, ltBody.get('table.rows').indexOf(row));
    this._immediateSimplification(ltBody);
  },

  selectNone(ltBody) {
    this._revertDomModifications(ltBody);
    this._clearRanges();
    this._noSimplification(ltBody);
  },

  onRowArrayChanged(ltBody) {
    this.selectNone(ltBody);
  },

  onSelectNone(ltBody) {
    let args = arguments;
    let event = args[args.length - 1];
    if (event && (args.length === 3 && event.button === 0 || args.length === 2)) {
      this.selectNone(ltBody);
    }
  },

  onRangeDown(ltBody) {
    this._rangeUpDownActive = true;
    this._revertDomModifications(ltBody);
    this._moveRange(ltBody, 1);
    this._noSimplification(ltBody);
  },

  onRangeUp(ltBody) {
    this._rangeUpDownActive = true;
    this._revertDomModifications(ltBody);
    this._moveRange(ltBody, -1);
    this._noSimplification(ltBody);
  },

  onStopRangeUpDown(ltBody) {
    if (this._rangeUpDownActive) {
      this._rangeUpDownActive = false;
      this._thenSimplify(ltBody);
    }
  },

  onRowMouseStartNewSelection(ltBody, ltRow, event) {
    if (event.button === 0) {
      this._mouseNewSelectionAnchor = ltBody.get('table.rows').indexOf(ltRow.get('row'));
    }
  },

  onRowMouseStartAddRange(ltBody, ltRow, event) {
    if (event.button === 0) {
      this._revertDomModifications(ltBody);
      let i = ltBody.get('table.rows').indexOf(ltRow.get('row'));
      this.get('ranges').insertAt(0, RowRange.create({ a: i, b: i }));
      this._mouseAddRangeActive = true;
      this._noSimplification(ltBody);
    }
  },

  onRowMouseEndNewSelection() {
    this._mouseNewSelectionAnchor = null;
    this._mouseNewSelectionActive = false;
  },

  onRowMouseEndAddRange(ltBody) {
    this._mouseAddRangeAnchor = null;
    this._mouseAddRangeActive = false;
    this._thenSimplify(ltBody);
  },

  onRowMouseNewSelectionMove(ltBody, ltRow, event) {
    if (event.button === 0) {
      let ranges = this.get('ranges');
      let i = ltBody.get('table.rows').indexOf(ltRow.get('row'));
      if (
        this._mouseNewSelectionAnchor !== null
        && !this._mouseNewSelectionActive
        && this._mouseNewSelectionAnchor !== i
      ) {
        this._clearRanges();
        ranges.insertAt(
          0,
          RowRange.create({
            a: this._mouseNewSelectionAnchor,
            b: this._mouseNewSelectionAnchor
          })
        );
        this._mouseNewSelectionActive = true;
      }
      if (this._mouseNewSelectionActive && ranges.get('length')) {
        this._revertDomModifications(ltBody);
        ranges.objectAt(0).set('b', i);
        this._noSimplification(ltBody);
      }
    }
  },

  onRowMouseAddRangeMove(ltBody, ltRow, event) {
    if (event.button === 0) {
      let ranges = this.get('ranges');
      if (this._mouseAddRangeActive && ranges.get('length')) {
        this._revertDomModifications(ltBody);
        ranges.objectAt(0).set('b', ltBody.get('table.rows').indexOf(ltRow.get('row')));
        this._noSimplification(ltBody);
      }
    }
  },

  _updateRange(ltBody, range, pointName, position, direction) {
    let ltDropRow = ltBody.getLtRowAt(position);
    if (ltDropRow) {
      let ltRows = ltBody.get('ltRows');
      let i = ltRows.indexOf(ltDropRow);
      let side = (ltDropRow.get('top') + ltDropRow.get('height') / 2 - position);
      if (side * direction > 0) {
        i -= direction;
      }
      i = Math.max(0, Math.min(i, ltBody.get('table.rows.length')));
      let realFirst = range.get('realFirst');
      let realLast = range.get('realLast');
      if (!(direction < 0 && i > realLast) && !(direction > 0 && i < realFirst)) {
        range.set(pointName, i);
        this.syncSelection(ltBody.get('table'));
        run.schedule('afterRender', null, () => ltBody.makeRowAtVisible(i));
      }
    }
  },

  onHandleMove() {
    this._updateRange(...arguments);
  },

  onHandleDrop(ltBody, range) {
    this._updateRange(...arguments);
    range.normalize();
    this._thenSimplify(ltBody);
  }

});
