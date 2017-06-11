/* eslint ember/no-on-calls-in-components:off */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { on } from '@ember/object/evented';

export default Component.extend({

  classNameBindings: [':table-action', ':fa', 'fixed:fa-lock:fa-unlock'],
  attributeBindings: ['title'],

  fixed: false,

  title: computed('fixed', function() {
    return this.get('fixed') ? 'Headers are fixed' : 'Headers are inlined';
  }),

  _onClick: on('click', function() {
    this.onChange(!this.get('fixed'));
  })

});
