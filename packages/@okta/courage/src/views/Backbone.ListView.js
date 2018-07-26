define([
  './BaseView',
  'shared/framework/ListView'
], function (BaseView, ListView) {
   /**
    * See {@link src/framework/ListView} for more detail and examples from the base class.
    * @class module:Okta.ListView
    * @extends src/framework/ListView
    * @mixes module:Okta.View
    */
  return BaseView.decorate(ListView);
});
