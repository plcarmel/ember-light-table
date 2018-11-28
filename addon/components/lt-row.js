/* eslint ember/no-on-calls-in-components:off */
import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import layout from 'ember-light-table/templates/components/lt-row';

const Row = Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['lt-row'],

  classNameBindings: [
    'isSelected',
    'isExpanded',
    'hasFocus',
    'canExpand:is-expandable',
    'canSelect:is-selectable',
    'canFocus:is-focusable',
    'row.classNames'
  ],

  attributeBindings: ['colspan', 'data-row-id'],

  columns: null,
  row: null,
  tableActions: null,
  extra: null,
  canExpand: false,
  canSelect: false,
  canFocus: false,
  colspan: 1,

  isSelected: reads('row.selected'),
  isExpanded: reads('row.expanded'),
  hasFocus: reads('row.hasFocus'),

  ltBody: null,

  left() {
    return this.element.offsetLeft;
  },

  width() {
    return this.element.offsetWidth;
  },

  top() {
    return this.element.offsetTop;
  },

  height() {
    return this.element.offsetHeight;
  },

  _onClick: on('click', function() {
    if (this.rowClick) {
      this.rowClick(this, ...arguments);
    }
  }),

  _onDoubleClick: on('doubleClick', function() {
    if (this.rowDoubleClick) {
      this.rowDoubleClick(this, ...arguments);
    }
  }),

  _onMouseDown: on('mouseDown', function() {
    if (this.rowMouseDown) {
      this.rowMouseDown(this, ...arguments);
    }
  }),

  _onMouseUp: on('mouseUp', function() {
    if (this.rowMouseUp) {
      this.rowMouseUp(this, ...arguments);
    }
  }),

  _onMouseMove: on('mouseMove', function() {
    if (this.rowMouseMove) {
      this.rowMouseMove(this, ...arguments);
    }
  }),

  _onTouchStart: on('touchStart', function() {
    if (this.rowTouchStart) {
      this.rowTouchStart(this, ...arguments);
    }
  }),

  _onTouchEnd: on('touchEnd', function() {
    if (this.rowTouchEnd) {
      this.rowTouchEnd(this, ...arguments);
    }
  }),

  _onTouchCancel: on('touchCancel', function() {
    if (this.rowTouchCancel) {
      this.rowTouchCancel(this, ...arguments);
    }
  }),

  _onTouchLeave: on('touchLeave', function() {
    if (this.rowTouchLeave) {
      this.rowTouchLeave(this, ...arguments);
    }
  }),

  _onTouchMove: on('touchMove', function() {
    if (this.rowTouchMove) {
      this.rowTouchMove(this, ...arguments);
    }
  })

});

Row.reopenClass({
  positionalParams: ['row', 'columns']
});

export default Row;
