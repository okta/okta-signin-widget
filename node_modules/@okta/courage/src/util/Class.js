define(['okta/underscore', 'backbone'], function (_, Backbone) {

  function Class(options) {
    this.options = _.clone(options || {});
    this.cid = _.uniqueId('class');
    this.initialize.apply(this, arguments);
  }

  _.extend(Class.prototype, Backbone.Events, {
    initialize: function () {}
  });

  Class.extend = Backbone.Model.extend;

  return Class;

});
