define([
  './BaseView',
  'shared/framework/ListView'
], function (BaseView, ListView) {
   /**
   * @class Okta.ListView
   * @extends Archer.ListView
   * @inheritdoc Archer.ListView
   */
  return BaseView.decorate(ListView);
});
