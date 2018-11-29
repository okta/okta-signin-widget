/* eslint max-params: 0 */
define([
  'backbone',
  '@okta/courage/src/util/jquery-wrapper',
  '@okta/courage/src/util/underscore-wrapper',
  '@okta/courage/src/util/handlebars-wrapper',
  '@okta/courage/src/models/Model',
  '@okta/courage/src/models/BaseModel',
  '@okta/courage/src/models/BaseCollection',
  '@okta/courage/src/models/SchemaProperty',
  '@okta/courage/src/models/BaseSchema',
  '@okta/courage/src/util/StringUtil',
  '@okta/courage/src/util/TemplateUtil',
  '@okta/courage/src/util/ButtonFactory',
  '@okta/courage/src/util/BaseRouter',
  '@okta/courage/src/util/BaseController',
  '@okta/courage/src/util/Util',
  '@okta/courage/src/util/Cookie',
  '@okta/courage/src/util/Logger',
  '@okta/courage/src/util/Class',
  '@okta/courage/src/util/Keys',
  '@okta/courage/src/util/TimeUtil',
  '@okta/courage/src/views/BaseView',
  '@okta/courage/src/views/Backbone.ListView',
  '@okta/courage/src/views/components/BaseDropDown',
  '@okta/courage/src/views/forms/BaseForm',
  '@okta/courage/src/views/forms/helpers/InputRegistry',
  '@okta/courage/src/views/forms/helpers/FormUtil',
  '@okta/courage/src/views/forms/helpers/SchemaFormFactory',
  '@okta/courage/src/views/forms/components/Toolbar',
  '@okta/courage/src/views/forms/inputs/TextBox',
  '@okta/courage/src/views/forms/inputs/PasswordBox',
  '@okta/courage/src/views/forms/inputs/CheckBox',
  '@okta/courage/src/views/forms/inputs/Radio',
  '@okta/courage/src/views/forms/inputs/Select',
],
  function (Backbone, $, _, Handlebars,
    Model, BaseModel, BaseCollection, SchemaProperty, BaseSchema,
    StringUtil, TemplateUtil, ButtonFactory, BaseRouter, BaseController,
    Util, Cookie, Logger, Class, Keys, TimeUtil,
    BaseView, ListView, BaseDropDown,
    BaseForm, InputRegistry, FormUtil, SchemaFormFactory, Toolbar,
    TextBox, PasswordBox, CheckBox, Radio, Select) {

    var Okta = {

      Backbone: Backbone,

      $: $,

      _: _,

      Handlebars: Handlebars,

      loc: StringUtil.localize,

      createButton: ButtonFactory.create,

      registerInput: InputRegistry.register,

      tpl: TemplateUtil.tpl,

      Model: Model,

      BaseModel: BaseModel,

      Collection: BaseCollection,

      View: BaseView,

      ListView: ListView,

      Router: BaseRouter,

      Controller: BaseController,

      Form: BaseForm,

      internal: {

        util: {
          Util,
          Cookie,
          Logger,
          Class,
          Keys,
          TimeUtil,
        },

        views: {
          components: {
            BaseDropDown,
          },

          forms: {
            helpers: {
              FormUtil,
              SchemaFormFactory
            },

            components: {
              Toolbar,
            },

            inputs: {
              TextBox,
              PasswordBox,
              CheckBox,
              Radio,
              Select
            }
          }
        },

        models: {
          BaseSchema,
          SchemaProperty
        },

      }
    };

    Okta.registerInput('text', TextBox);
    Okta.registerInput('password', PasswordBox);
    Okta.registerInput('checkbox', CheckBox);
    Okta.registerInput('radio', Radio);
    Okta.registerInput('select', Select);

    return Okta;
  });
