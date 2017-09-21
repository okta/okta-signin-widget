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

  /**
   * @class Okta
   * @singleton
   *
   * #### The Okta module holds reference to many frequently used objects and functions
   *
   * A quick example:
   *
   * ```javascript
   * define(['okta'], function (Okta) {
   *
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
   *
   * });
   *
   * ```
   */

  return {

    /**
     * A reference to Backbone
     * @type {Backbone}
     */
    Backbone: Backbone,

    /**
     * A reference to jQuery
     * @type {jQuery}
     */
    $: $,

    /**
     * A reference to underscore
     * @type {underscore}
     */
    _: _,

    /**
     * A reference to moment
     * @type {moment}
     */
    moment: moment,

    /**
     * A reference to moment-tz
     * @type {moment-tz}
     */
    momentTz: momentTz,

    /**
     * A reference to Handlebars
     * @type {Handlebars}
     */
    Handlebars: Handlebars,

    /**
     * @method
     * @inheritdoc StringUtil#static-method-localize
     */
    loc: util.StringUtil.localize,

    /**
     * @method
     * @inheritdoc ButtonFactory#create
     */
    createButton: util.ButtonFactory.create,

    /**
     * @method
     * @inheritdoc Callout#static-method-create
     */
    createCallout: views.components.Callout.create,

    /**
     * @method
     * @inheritdoc TemplateUtil#tpl
     */
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
