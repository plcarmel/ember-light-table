/* eslint ember/no-on-calls-in-components:off */
import $ from 'jquery';
import { getOwner } from '@ember/application';
import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { run } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import layout from '../templates/components/lt-selection-handle';

export default Component.extend({

  layout,

  classNameBindings: [':lt-selection-handle', 'isUp:lt-selection-handle-up:lt-selection-handle-down'],
  attributeBindings: ['style'],

  // passed in
  rowIndex: null,
  direction: null,
  inverse: false,

  _initialMousePosition: null,
  offset: 0,

  ltBody: computed(function() {
    if (this.$()) {
      let vrm = getOwner(this).lookup('-view-registry:main');
      let $body = this.$().parents('.lt-body-wrap');
      return $body.length ? vrm[$body[0].id] : null;
    }
  }).volatile().readOnly(),

  ltRow: computed(function() {
    let ltBody = this.get('ltBody');
    if (ltBody) {
      return ltBody.get('ltRows').objectAt(this.get('rowIndex'));
    }
  }).volatile().readOnly(),

  isUp: computed('direction', 'inverse', function() {
    let inverse = this.get('inverse');
    return this.get('direction') < 0 ? !inverse : inverse;
  }).readOnly(),

  position: computed(function() {
    let r = this.get('ltRow');
    let result = r.get('top');
    if (!this.get('isUp')) {
      result += r.get('height');
    }
    return result;
  }).volatile().readOnly(),

  _getMousePosition(event) {
    return event.clientY - this.$().parents('.scrollable-content').offset().top;
  },

  _setDomEvents: on('init', function() {
    this._domEvents = {
      mousemove: this._$onMouseMove,
      mouseup: this._$onMouseUp
    };
  }),

  _removeEvents: on('willDestroyElement', function() {
    $('body').off(this._domEvents, this);
  }),

  _onMouseDown: on('mouseDown', function(event) {
    this._initialMousePosition = this._getMousePosition(event);
    $('body').on(this._domEvents, this);
    this.sendAction('drag');
  }),

  extra: computed('direction', 'inverse', function() {
    return !this.get('ltRow')
      ? 0
      : this.get('inverse')
        ?  this.get('direction') * this.get('ltRow.height')
        : 0;
  }).readOnly(),

  _onMouseMove(event) {
    if (this.get('isDestroyed')) {
      $('body').off(this._domEvents);
    } else if (this._initialMousePosition) {
      let offset = this._getMousePosition(event) - this.get('_initialMousePosition');
      this.set('offset', offset);
      this.sendAction('move', offset + this.get('extra') + this.get('position'), this.get('isUp') ? -1 : 1);
    } else {
      this._onMouseDown(event);
    }
  },

  _$onMouseMove(event) {
    let that = event.data;
    run.scheduleOnce('afterRender', null, () => that._onMouseMove.call(that, event));
  },

  _onMouseUp(event) {
    this._removeEvents();
    if (!this.get('isDestroyed')) {
      let offset = this._getMousePosition(event) - this.get('_initialMousePosition');
      this._initialMousePosition = null;
      this.set('offset', 0);
      this.sendAction('drop', offset + this.get('extra') + this.get('position'), this.get('isUp') ? -1 : 1);
    }
  },

  _$onMouseUp(event) {
    let that = event.data;
    run.scheduleOnce('afterRender', null, () => that._onMouseUp.call(that, event));
  },

  fromBottom: computed(function() {
    let $row = this.get('ltRow').$();
    let $content = this.$().parents('.scrollable-content');
    let $container = this.$().parents('.lt-scrollable');
    return $content.offset().top + $container.height() - $row.offset().top;
  }).volatile().readOnly(),

  fromTop: computed(function() {
    let $row = this.get('ltRow').$();
    let $content = this.$().parents('.scrollable-content');
    return $row.offset().top + $row.height() - $content.offset().top;
  }).volatile().readOnly(),

  _onResize: null,

  _attachResizeEventListener: on('didInsertElement', function() {
    this._onResize = () => this.set('style', this.get('__style'));
    window.addEventListener('resize', this._onResize);
  }),

  _removeEventListener: on('willDestroyElement', function() {
    window.removeEventListener('resize', this._onResize);
  }),

  _forceStyleUpdate: on('didInsertElement', observer('isUp', 'extra', function() {
    run.once(this, this.__forceStyleUpdate);
  })),

  __forceStyleUpdate() {
    this.set('style', this.get('__style'));
  },

  __style: computed(function() {
    if (this.get('ltBody')) {
      let isUp = this.get('isUp');
      let y = (isUp ? this.get('fromBottom') : this.get('fromTop'));
      let side = isUp ? 'bottom' : 'top';
      let translation = this.get('offset') + this.get('extra');
      return htmlSafe(`${side}: ${y}px; transform: translateY(${translation}px);`);
    }
  }).volatile().readOnly(),

  _style: null,

  style: computed('isUp', 'offset', 'extra', 'rowIndex', {
    get() {
      let style = this.get('_style');
      if (style) {
        this.set('_style', null);
        return style;
      } else {
        if (this.get('ltBody')) {
          return this.get('__style');
        } else {
          return null;
        }
      }
    },
    set(key, value) {
      this.set('_style', value);
      return value;
    }
  })

});
