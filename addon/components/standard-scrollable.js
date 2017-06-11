import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { run } from '@ember/runloop';
import layout from '../templates/components/standard-scrollable';
import cssStyleify from 'ember-light-table/utils/css-styleify';

export default Component.extend({

  layout,

  classNames: ['standard-scrollable'],
  attributeBindings: ['tabIndex', 'style'],

  tabIndex: -1,
  height: null,

  style: computed('height', function() {
    return cssStyleify(this.getProperties(['height']));
  }),

  // passed in
  scrollToY: null,
  onScroll: null,

  init() {
    this._super(...arguments);
    this.get('scrollToY');
  },

  didInsertElement() {
    this.$().on('scroll', (evt) => this._onScroll(evt));
  },

  _onScroll(event) {
    let $ = this.$();
    if ($) {
      this.sendAction('onScroll', $.scrollTop(), event);
    }
  },

  _onScrollToY: observer('scrollToY', function() {
    run.scheduleOnce('afterRender', this, this.__onScrollToY);
  }),

  __onScrollToY() {
    this.$().scrollTop(this.get('scrollToY'));
  }

});
