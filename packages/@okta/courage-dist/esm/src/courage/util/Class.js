import Backbone from '../vendor/lib/backbone.js';
import oktaUnderscore from './underscore-wrapper.js';

function Class(options) {
  this.options = oktaUnderscore.clone(options || {});
  this.cid = oktaUnderscore.uniqueId('class');
  this.initialize.apply(this, arguments);
}

oktaUnderscore.extend(Class.prototype, Backbone.Events, {
  initialize: function () {}
});

Class.extend = Backbone.Model.extend;

export { Class as default };
