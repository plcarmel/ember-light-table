import Component from '@ember/component';
import { computed } from '@ember/object';
import cssStyleify from 'ember-light-table/utils/css-styleify';

export default Component.extend({

  classNames: ['lt-frame'],

  attributeBindings: ['style'],

  height: null,
  scrollbar: 'standard',

  style: computed('height', function() {
    return cssStyleify(this.getProperties(['height']));
  })

});
