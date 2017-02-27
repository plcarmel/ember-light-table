import EmberObject from '@ember/object';

export default EmberObject.extend({

  exclusionGroup: null,

  events: null,

  init() {
    this._super(...arguments);
    this.events = {};
  }

});
