define([
  './BaseView',
  'shared/framework/TableView'
], function (BaseView, TableView) {
   /**
   * @class Okta.TableView
   * @extends Archer.TableView
   * @inheritdoc Archer.TableView
   */
  return BaseView.decorate(TableView);
});
