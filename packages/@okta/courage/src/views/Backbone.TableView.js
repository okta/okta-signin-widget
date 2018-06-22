define([
  './BaseView',
  'shared/framework/TableView'
], function (BaseView, TableView) {
   /**
    * See {@link src/framework/TableView} for more detail and examples from the base class.
    * @class module:Okta.TableView
    * @extends src/framework/TableView
    * @mixes module:Okta.View
    */
  return BaseView.decorate(TableView);
});
