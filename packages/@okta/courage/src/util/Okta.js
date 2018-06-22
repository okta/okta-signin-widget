/**
 * The main Courage module, which references the most commonly used classes
 * and utility functions.
 * @module Okta
 * @borrows module:Okta.internal.util.StringUtil.localize as loc
 * @borrows module:Okta.internal.util.ButtonFactory.create as createButton
 * @borrows module:Okta.internal.views.components.Callout.create as createCallout
 * @borrows module:Okta.internal.views.forms.helpers.InputRegistry.register as registerInput
 * @borrows module:Okta.internal.util.TemplateUtil.tpl as tpl
 * @example
 * define(['okta'], function (Okta) {
 *   var Form = Okta.FormDialog.extend({
 *     title: Okta.loc('my.i18n.key'),
 *     inputs: [
 *       {
 *         type: 'text',
 *         name: 'name'
 *       }
 *     ]
 *   });
 *
 *   var View = Okta.View.extend({
 *     children: [
 *       Okta.createButton({
 *         title: 'Click Me',
 *         click: function () {
 *           new Form({model: new Okta.Model()}).render();
 *         }
 *       })
 *     ]
 *   });
 * });
 */
/* eslint max-params: 0 */
define([
  'backbone',
  'okta/jquery',
  'okta/underscore',
  'okta/handlebars',
  'okta/moment',
  'okta/moment-tz',
  'shared/models/Model',
  'shared/models/BaseModel',
  'shared/models/BaseCollection',
  'shared/views/wizard/BaseWizard',
  'shared/framework/frameworkBundle',
  'shared/models/modelsBundle',
  'shared/util/utilBundle',
  'shared/views/viewsBundle',
  'okta/jqueryui'
],
function (Backbone, $, _, Handlebars, moment, momentTz, Model, BaseModel, BaseCollection, BaseWizard,
  frameworkBundle, modelsBundle, utilBundle, viewsBundle) {

  var framwork = frameworkBundle,
      models = modelsBundle,
      util = utilBundle,
      views = viewsBundle;

  return /** @lends module:Okta */ {

    /**
     * A reference to [Backbone.js](http://backbonejs.org/).
     */
    Backbone: Backbone,

    /**
     * A reference to [jQuery](http://api.jquery.com/).
     */
    $: $,

    /**
     * A reference to [Underscore.js](http://underscorejs.org/).
     */
    _: _,

    /**
     * A reference to [Moment.js](https://momentjs.com/docs/).
     */
    moment: moment,

    /**
     * A reference to [Moment Timezone](https://momentjs.com/timezone/docs/).
     */
    momentTz: momentTz,

    /**
     * A reference to [Handlebars.js](http://handlebarsjs.com/).
     */
    Handlebars: Handlebars,

    loc: util.StringUtil.localize,

    createButton: util.ButtonFactory.create,

    createCallout: views.components.Callout.create,

    registerInput: views.forms.helpers.InputRegistry.register,

    tpl: util.TemplateUtil.tpl,

    Model: Model,

    BaseModel: BaseModel,

    Collection: BaseCollection,

    View: views.BaseView,

    ListView: views.ListView,

    TableView: views.TableView,

    Router: util.BaseRouter,

    TabbedRouter: util.TabbedRouter,

    Controller: util.BaseController,

    DataListController: util.DataListController,

    DataList: views.datalist.DeadSimpleDataList,

    DependentCallout: views.components.BaseDependentCallout,

    ModalDialog: views.components.BaseModalDialog,

    MultiViewModalDialog: views.components.MultiViewModalDialog,

    Form: views.forms.BaseForm,

    FormDialog: views.components.BaseFormDialog,

    DropDown: views.components.DropDown,

    Wizard: BaseWizard,

    Logger: util.Logger,

    Metrics: util.Metrics,

    internal: {

      framework: framwork,

      util: util,

      views: views,

      models: models

    }

  };

});
