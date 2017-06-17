import Component from '@ember/component';
import { A as emberArray } from '@ember/array';
import { computed, observer } from '@ember/object';
import { getOwner } from '@ember/application';
import $ from 'jquery';
import withBackingField from 'ember-light-table/utils/with-backing-field';
import layout from 'ember-light-table/templates/components/lt-body';
import { run } from '@ember/runloop';
import { EKMixin } from 'ember-keyboard';
import ActivateKeyboardOnFocusMixin from 'ember-keyboard/mixins/activate-keyboard-on-focus';
import HasBehaviorsMixin from 'ember-light-table/mixins/has-behaviors';
import RowExpansionBehavior from 'ember-light-table/behaviors/row-expansion';
import SingleSelectBehavior from 'ember-light-table/behaviors/single-select';
import MultiSelectBehavior from 'ember-light-table/behaviors/multi-select';
import { behaviorGroupFlag, behaviorFlag } from 'ember-light-table/mixins/has-behaviors';

/**
 * @module Light Table
 */

/**
 * ```hbs
 * {{#light-table table as |t|}}
 *   {{#t.body multiSelect=true onRowClick=(action 'rowClicked') as |body|}}
 *     {{#body.expanded-row as |row|}}
 *       Hello <b>{{row.firstName}}</b>
 *     {{/body.expanded-row}}
 *
 *     {{#if isLoading}}
 *       {{#body.loader}}
 *         Loading...
 *       {{/body.loader}}
 *     {{/if}}
 *
 *     {{#if table.isEmpty}}
 *       {{#body.no-data}}
 *         No users found.
 *       {{/body.no-data}}
 *     {{/if}}
 *   {{/t.body}}
 * {{/light-table}}
 * ```
 *
 * @class t.body
 */
export default Component.extend(EKMixin, ActivateKeyboardOnFocusMixin, HasBehaviorsMixin, {

  layout,
  classNames: ['lt-body-wrap'],
  classNameBindings: ['canSelect', 'multiSelect', 'canExpand'],

  attributeBindings: ['tabindex'],

  tabindex: 0,

  /**
   * @property table
   * @type {Table}
   * @private
   */
  table: null,

  /**
   * @property sharedOptions
   * @type {Object}
   * @private
   */
  sharedOptions: null,

  /**
   * @property tableActions
   * @type {Object}
   */
  tableActions: null,

  singleSelectBehavior: withBackingField('_singleSelectBehavior', () => SingleSelectBehavior.create({})),
  multiSelectBehavior: withBackingField('_multiSelectBehavior', () => MultiSelectBehavior.create({})),
  expandRowBehavior: withBackingField('_expandRowBehavior', () => RowExpansionBehavior.create({})),

  _initDefaultBehaviorsIfNeeded() {
    if (this.get('behaviors.length') === 0 && this.get('behaviorsOff.length') === 0) {
      this.activateBehavior(this.get('multiSelectBehavior'), true);
      this.activateBehavior(this.get('singleSelectBehavior'), true);
      this.activateBehavior(this.get('expandRowBehavior'), false);
    }
  },

  /**
   * @property extra
   * @type {Object}
   */
  extra: null,

  /**
   * @property isInViewport
   * @default false
   * @type {Boolean}
   */
  isInViewport: false,

  /**
   * Allows a user to select a row on click. All this will do is apply the necessary
   * CSS classes and add the row to `table.selectedRows`. If `multiSelect` is disabled
   * only one row will be selected at a time.
   *
   * @property canSelect
   * @type {Boolean}
   * @default true
   * @deprecated Please set the value of the `behaviors` property directly.
   */
  canSelect: behaviorGroupFlag('selection'),

  /**
   * Select a row on click. If this is set to `false` and multiSelect is
   * enabled, using click + `shift`, `cmd`, or `ctrl` will still work as
   * intended, while clicking on the row will not set the row as selected.
   *
   * @property selectOnClick
   * @type {Boolean}
   * @default true
   * @deprecated Please set the flag directly on the `behaviors/multi-select` instance.
   */
  selectOnClick: computed.alias('multiSelectBehavior.selectOnClick'),

  /**
   * Allows for expanding row. This will create a new row under the row that was
   * clicked with the template provided by `body.expanded-row`.
   *
   * ```hbs
   * {{#body.expanded-row as |row|}}
   *  This is the content of the expanded row for {{row.firstName}}
   * {{/body.expanded-row}}
   * ```
   *
   * @property canExpand
   * @type {Boolean}
   * @default false
   * @deprecated Please set the value of the `behaviors` property directly.
   */
  canExpand: behaviorGroupFlag('row-expansion'),

  /**
   * Allows a user to select multiple rows with the `ctrl`, `cmd`, and `shift` keys.
   * These rows can be easily accessed via `table.get('selectedRows')`
   *
   * @property multiSelect
   * @type {Boolean}
   * @default false
   * @deprecated Please set the value of the `behaviors` property directly.
   */
  multiSelect: behaviorFlag('selection', 'multiSelectBehavior'),

  /**
   * When multiSelect is true, this property determines whether or not `ctrl`
   * (or `cmd`) is required to select additional rows, one by one. When false,
   * simply clicking on subsequent rows will select or deselect them.
   *
   * `shift` to select many consecutive rows is unaffected by this property.
   *
   * @property multiSelectRequiresKeyboard
   * @type {Boolean}
   * @default true
   * @deprecated Please set the flag directly on the `behaviors/multi-select` instance.
   */
  multiSelectRequiresKeyboard: computed.alias('multiSelectBehavior.requiresKeyboard'),

  /**
   * Hide scrollbar when not scrolling
   *
   * @property autoHideScrollbar
   * @type {Boolean}
   * @default true
   */
  autoHideScrollbar: true,

  /**
   * Allows multiple rows to be expanded at once
   *
   * @property multiRowExpansion
   * @type {Boolean}
   * @default true
   * @deprecated Please set the flag directly on the `behaviors/row-expansion` instance.
   */
  multiRowExpansion: computed.alias('expandRowBehavior.multiRow'),

  /**
   * Expand a row on click
   *
   * @property expandOnClick
   * @type {Boolean}
   * @default true
   * @deprecated Please set the flag directly on the `behaviors/row-expansion` instance.
   */
  expandOnClick: computed.alias('expandRowBehavior.expandOnClick'),

  /**
   * If true, the body block will yield columns and rows, allowing you
   * to define your own table body
   *
   * @property overwrite
   * @type {Boolean}
   * @default false
   */
  overwrite: false,

  /**
   * If true, the body will prepend an invisible `<tr>` that scaffolds the
   * widths of the table cells.
   *
   * ember-light-table uses [`table-layout: fixed`](https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout).
   * This means, that the widths of the columns are defined by the first row
   * only. By prepending this scaffolding row, widths of columns only need to
   * be specified once.
   *
   * @property enableScaffolding
   * @type {Boolean}
   * @default false
   */
  enableScaffolding: false,

  /**
   * ID of main table component. Used to generate divs for ember-wormhole
   *
   * @property tableId
   * @type {String}
   * @private
   */
  tableId: null,

  /**
   * @property scrollBuffer
   * @type {Number}
   * @default 500
   */
  scrollBuffer: 500,

  /**
   * @property scrollBufferRows
   * @type {Number}
   * @default 500 / estimatedRowHeight
   */
  scrollBufferRows: computed('scrollBuffer', 'sharedOptions.estimatedRowHeight', function() {
    return Math.ceil(
      this.get('scrollBuffer') / (this.get('sharedOptions.estimatedRowHeight') || 1)
    );
  }),

  /**
   * @property useVirtualScrollbar
   * @type {Boolean}
   * @default false
   * @private
   */
  useVirtualScrollbar: false,

  /**
   * Set this property to scroll to a specific px offset.
   *
   * This only works when `useVirtualScrollbar` is `true`, i.e. when you are
   * using fixed headers / footers.
   *
   * @property scrollTo
   * @type {Number}
   * @default null
   */
  scrollTo: null,
  _scrollTo: null,

  /**
   * @property targetScrollOffset
   * @type {Number}
   * @default 0
   * @private
   */
  targetScrollOffset: 0,

  /**
   * @property currentScrollOffset
   * @type {Number}
   * @default 0
   * @private
   */
  currentScrollOffset: 0,

  /**
   * @property hasReachedTargetScrollOffset
   * @type {Boolean}
   * @default true
   * @private
   */
  hasReachedTargetScrollOffset: true,

  /**
   * Allows to customize the component used to render rows
   *
   * ```hbs
   * {{#light-table table as |t|}}
   *    {{t.body rowComponent=(component 'my-row')}}
   * {{/light-table}}
   * ```
   * @property rowComponent
   * @type {Ember.Component}
   * @default null
   */
  rowComponent: null,

  /**
   * Allows to customize the component used to render spanned rows
   *
   * ```hbs
   * {{#light-table table as |t|}}
   *    {{t.body spannedRowComponent=(component 'my-spanned-row')}}
   * {{/light-table}}
   * ```
   * @property spannedRowComponent
   * @type {Ember.Component}
   * @default null
   */
  spannedRowComponent: null,

  /**
   * Allows to customize the component used to render infinite loader
   *
   * ```hbs
   * {{#light-table table as |t|}}
   *    {{t.body infinityComponent=(component 'my-infinity')}}
   * {{/light-table}}
   * ```
   * @property infinityComponent
   * @type {Ember.Component}
   * @default null
   */
  infinityComponent: null,

  rows: computed.readOnly('table.visibleRows'),
  columns: computed.readOnly('table.visibleColumns'),
  colspan: computed.readOnly('columns.length'),

  /**
   * fills the screen with row items until lt-infinity component has exited the viewport
   * @property scheduleScrolledToBottom
   */
  scheduleScrolledToBottom: observer('rows.[]', 'isInViewport', function() {
    if (this.get('isInViewport')) {
      /*
       Continue scheduling onScrolledToBottom until no longer in viewport
       */
      this._schedulerTimer = run.scheduleOnce('afterRender', this, this._debounceScrolledToBottom);
    }
  }),

  /* Components to add in the scrollable content
   *
   * @property
   * @type {[ { component, namedArgs ]} ]}
   * @default []
   */
  scrollableDecorations: null,

  init() {
    this._super(...arguments);

    if (this.get('scrollableDecorations') === null) {
      this.set('scrollableDecorations', emberArray());
    }

    this._initDefaultBehaviorsIfNeeded();

    this.get('table.focusIndex'); // so the observers are triggered

  },

  didReceiveAttrs() {
    this._super(...arguments);
  },

  destroy() {
    this._super(...arguments);
    this._cancelTimers();
  },

  makeRowAtVisible(i) {
    this.makeRowVisible(this.get('ltRows').objectAt(i).$());
  },

  $scrollableContainer: computed(function() {
    return this.$().parents('.lt-scrollable');
  }).volatile().readOnly(),

  $scrollableContent: computed(function() {
    return this.$().parents('.scrollable-content');
  }).volatile().readOnly(),

  makeRowVisible($row) {
    let $scrollableContent = this.get('$scrollableContent');
    let $scrollableContainer = this.get('$scrollableContainer');
    if ($row.length !== 0 && $scrollableContent.length !== 0 && $scrollableContainer.length !== 0) {
      let rt = $row.offset().top - $scrollableContent.offset().top;
      let rh = $row.height();
      let rb = rt + rh;
      let h = $scrollableContainer.height();
      let t = this.get('scrollTop');
      let b = t + h;
      let extraSpace = rh * 2;
      if (rt - extraSpace <= t) {
        this.sendAction('onScrollTo', rt - extraSpace);
      } else if (rb + extraSpace >= b) {
        this.sendAction('onScrollTo', t + rb - b + extraSpace);
      }
    }
  },

  _onFocusedRowChanged: observer('table.focusIndex', function() {
    if (typeof FastBoot === 'undefined') {
      run.schedule('afterRender', null, () => this.makeRowVisible(this.$('tr.has-focus')));
    }
  }),

  checkTargetScrollOffset() {
    if (!this.get('hasReachedTargetScrollOffset')) {
      let targetScrollOffset = this.get('targetScrollOffset');
      let currentScrollOffset = this.get('currentScrollOffset');

      if (targetScrollOffset > currentScrollOffset) {
        this.set('targetScrollOffset', null);
        this._setTargetOffsetTimer = run.schedule('render', null, () => {
          this.set('targetScrollOffset', targetScrollOffset);
        });
      } else {
        this.set('hasReachedTargetScrollOffset', true);
      }
    }
  },

  /**
   * @method _debounceScrolledToBottom
   */
  _debounceScrolledToBottom(delay = 100) {
    /*
     This debounce is needed when there is not enough delay between onScrolledToBottom calls.
     Without this debounce, all rows will be rendered causing immense performance problems
     */
    this._debounceTimer = run.debounce(this, this.sendAction, 'onScrolledToBottom', delay);
  },

  /**
   * @method _cancelTimers
   */
  _cancelTimers() {
    run.cancel(this._checkTargetOffsetTimer);
    run.cancel(this._setTargetOffsetTimer);
    run.cancel(this._schedulerTimer);
    run.cancel(this._debounceTimer);
  },

  ltRows: computed(function() {
    let vrm = getOwner(this).lookup('-view-registry:main');
    let q = this.$('tr:not(.lt-expanded-row)');
    return emberArray($.makeArray(q.map((i, e) => vrm[e.id])));
  }).volatile(),

  getLtRowAt(position) {
    return this
      .get('ltRows')
      .find((ltr) => {
        let top = ltr.get('top');
        return top <= position && position < top + ltr.get('height');
      });
  },

  pageSize: computed(function() {
    let rows = this.get('table.rows');
    if (rows.get('length') === 0) {
      return 0;
    }
    let r0 = this.getLtRowAt(0);
    if (!r0) {
      r0 = this.get('ltRows').get('firstObject');
    }
    let rN = this.getLtRowAt(this.get('$scrollableContainer').height());
    if (!rN) {
      rN = this.get('ltRows').get('lastObject');
    }
    let i = (r) => rows.indexOf(r.get('row'));
    return i(rN) - i(r0);
  }).volatile().readOnly(),

  onRowArrayChanged: observer('table.rows.[]', function() {
    this.get('behaviors').forEach((b) => {
      if (typeof b.onRowArrayChanged === 'function') {
        b.onRowArrayChanged(this);
      }
    });
  }),

  actions: {
    onRowClick() {
      this.triggerBehaviorEvent('rowClick', ...arguments);
      this.sendAction('onRowClick', ...arguments);
    },

    onRowDoubleClick() {
      this.triggerBehaviorEvent('rowDoubleClick', ...arguments);
      this.sendAction('onRowDoubleClick', ...arguments);
    },

    onRowMouseDown() {
      this.triggerBehaviorEvent('rowMouseDown', ...arguments);
      this.sendAction('onRowMouseDown', ...arguments);
    },

    onRowMouseUp() {
      this.triggerBehaviorEvent('rowMouseUp', ...arguments);
      this.sendAction('onRowMouseUp', ...arguments);
    },

    onRowMouseMove() {
      this.triggerBehaviorEvent('rowMouseMove', ...arguments);
      this.sendAction('onRowMouseMove', ...arguments);
    },

    onRowTouchStart() {
      this.triggerBehaviorEvent('rowTouchStart', ...arguments);
      this.sendAction('onRowTouchStart', ...arguments);
    },

    onRowTouchEnd() {
      this.triggerBehaviorEvent('rowTouchEnd', ...arguments);
      this.sendAction('onRowTouchEnd', ...arguments);
    },

    onRowTouchCancel() {
      this.triggerBehaviorEvent('rowTouchCancel', ...arguments);
      this.sendAction('onRowTouchCancel', ...arguments);
    },

    onRowTouchLeave() {
      this.triggerBehaviorEvent('rowTouchLeave', ...arguments);
      this.sendAction('onRowTouchLeave', ...arguments);
    },

    onRowTouchMove() {
      this.triggerBehaviorEvent('rowTouchMove', ...arguments);
      this.sendAction('onRowTouchMove', ...arguments);
    },

    /**
     * lt-infinity action to determine if component is still in viewport
     * @event inViewport
     */
    inViewport() {
      this.set('isInViewport', true);
    },
    /**
     * lt-infinity action to determine if component has exited the viewport
     * @event exitViewport
     */
    exitViewport() {
      this.set('isInViewport', false);
    },

    firstVisibleChanged(/* item, index, key */) {
      this.sendAction('firstVisibleChanged', ...arguments);
    },

    lastVisibleChanged(/* item, index, key */) {
      this.sendAction('lastVisibleChanged', ...arguments);
    },

    firstReached(/* item, index, key */) {
      this.sendAction('firstReached', ...arguments);
    },

    lastReached(/* item, index, key */) {
      this.sendAction('lastReached', ...arguments);
    }
  }
});
