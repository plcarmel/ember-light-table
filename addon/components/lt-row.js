/* eslint ember/no-on-calls-in-components:off */
import { getOwner } from '@ember/application';
import Component from '@ember/component';
import { computed } from '@ember/object';
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

  isSelected: computed.readOnly('row.selected'),
  isExpanded: computed.readOnly('row.expanded'),
  hasFocus: computed.readOnly('row.hasFocus'),

  ltBody: computed(function() {
    let $this = this.$();
    if ($this) {
      let vrm = getOwner(this).lookup('-view-registry:main');
      let $body = $this.parents('.lt-body-wrap');
      return $body.length ? vrm[$body[0].id] : null;
    }
  }).volatile().readOnly(),

  $scrollableContent: computed(function() {
    return this.get('ltBody.$scrollableContent');
  }).volatile().readOnly(),

  left: computed(function() {
    return this.$().offset().left - this.get('$scrollableContent').offset().left;
  }).volatile().readOnly(),

  width: computed(function() {
    return this.$().width();
  }).volatile().readOnly(),

  top: computed(function() {
    return this.$().offset().top - this.get('$scrollableContent').offset().top;
  }).volatile().readOnly(),

  height: computed(function() {
    return this.$().height();
  }).volatile().readOnly(),

  _onClick: on('click', function() {
    this.sendAction('rowClick', this, ...arguments);
  }),

  _onDoubleClick: on('doubleClick', function() {
    this.sendAction('rowDoubleClick', this, ...arguments);
  }),

  _onMouseDown: on('mouseDown', function() {
    this.sendAction('rowMouseDown', this, ...arguments);
  }),

  _onMouseUp: on('mouseUp', function() {
    this.sendAction('rowMouseUp', this, ...arguments);
  }),

  _onMouseMove: on('mouseMove', function() {
    this.sendAction('rowMouseMove', this, ...arguments);
  }),

  _onTouchStart: on('touchStart', function() {
    this.sendAction('rowTouchStart', this, ...arguments);
  }),

  _onTouchEnd: on('touchEnd', function() {
    this.sendAction('rowTouchEnd', this, ...arguments);
  }),

  _onTouchCancel: on('touchCancel', function() {
    this.sendAction('rowTouchCancel', this, ...arguments);
  }),

  _onTouchLeave: on('touchLeave', function() {
    this.sendAction('rowTouchLeave', this, ...arguments);
  }),

  _onTouchMove: on('touchMove', function() {
    this.sendAction('rowTouchMove', this, ...arguments);
  })

});

Row.reopenClass({
  positionalParams: ['row', 'columns']
});

export default Row;
