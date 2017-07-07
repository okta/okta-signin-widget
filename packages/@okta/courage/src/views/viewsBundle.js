/* eslint max-params: [2, 8] */
define([
  './BaseView',
  './Backbone.ListView',
  './Backbone.TableView',
  './components/componentsBundle',
  './datalist/datalistBundle',
  './forms/formsBundle',
  './tabs/tabsBundle',
  './uploader/uploaderBundle'
],
function (BaseView, ListView, TableView, componentsBundle, datalistBundle, formsBundle, tabsBundle, uploaderBundle) {

  return {

    BaseView: BaseView,

    ListView: ListView,

    TableView: TableView,

    components: componentsBundle,

    datalist: datalistBundle,

    forms: formsBundle,

    tabs: tabsBundle,

    uploader: uploaderBundle

  };

});
