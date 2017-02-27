import Component from '@ember/component';
import { computed } from '@ember/object';
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
  hasFocus: computed.readOnly('row.hasFocus')
});

Row.reopenClass({
  positionalParams: ['row', 'columns']
});

export default Row;
