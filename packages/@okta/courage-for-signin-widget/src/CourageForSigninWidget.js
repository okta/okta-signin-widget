import BaseCollection from '@okta/courage/src/models/BaseCollection';
import BaseModel from '@okta/courage/src/models/BaseModel';
import BaseSchema from '@okta/courage/src/models/BaseSchema';
import Model from '@okta/courage/src/models/Model';
import SchemaProperty from '@okta/courage/src/models/SchemaProperty';
import BaseController from '@okta/courage/src/util/BaseController';
import BaseRouter from '@okta/courage/src/util/BaseRouter';
import ButtonFactory from '@okta/courage/src/util/ButtonFactory';
import Class from '@okta/courage/src/util/Class';
import Cookie from '@okta/courage/src/util/Cookie';
import Keys from '@okta/courage/src/util/Keys';
import Logger from '@okta/courage/src/util/Logger';
import StringUtil from '@okta/courage/src/util/StringUtil';
import TemplateUtil from '@okta/courage/src/util/TemplateUtil';
import Util from '@okta/courage/src/util/Util';
import Handlebars from '@okta/courage/src/util/handlebars-wrapper';
import $ from '@okta/courage/src/util/jquery-wrapper';
import _ from '@okta/courage/src/util/underscore-wrapper';
import ListView from '@okta/courage/src/views/Backbone.ListView';
import BaseView from '@okta/courage/src/views/BaseView';
import BaseDropDown from '@okta/courage/src/views/components/BaseDropDown';
import BaseForm from '@okta/courage/src/views/forms/BaseForm';
import Toolbar from '@okta/courage/src/views/forms/components/Toolbar';
import FormUtil from '@okta/courage/src/views/forms/helpers/FormUtil';
import InputRegistry from '@okta/courage/src/views/forms/helpers/InputRegistry';
import SchemaFormFactory from '@okta/courage/src/views/forms/helpers/SchemaFormFactory';
import CheckBox from '@okta/courage/src/views/forms/inputs/CheckBox';
import PasswordBox from '@okta/courage/src/views/forms/inputs/PasswordBox';
import Radio from '@okta/courage/src/views/forms/inputs/Radio';
import Select from '@okta/courage/src/views/forms/inputs/Select';
import InputGroup from '@okta/courage/src/views/forms/inputs/InputGroup';
import TextBox from '@okta/courage/src/views/forms/inputs/TextBox';
import Callout from '@okta/courage/src/views/components/Callout';
import Backbone from 'backbone';

const Okta = {
  Backbone: Backbone,

  $: $,

  _: _,

  Handlebars: Handlebars,

  loc: StringUtil.localize,

  createButton: ButtonFactory.create,

  createCallout: Callout.create,

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
    },

    views: {
      components: {
        BaseDropDown,
      },

      forms: {
        helpers: {
          FormUtil,
          SchemaFormFactory,
        },

        components: {
          Toolbar,
        },

        inputs: {
          TextBox,
          PasswordBox,
          CheckBox,
          Radio,
          Select,
          InputGroup,
        },
      },
    },

    models: {
      BaseSchema,
      SchemaProperty,
    },
  },
};

Okta.registerInput('text', TextBox);
Okta.registerInput('password', PasswordBox);
Okta.registerInput('checkbox', CheckBox);
Okta.registerInput('radio', Radio);
Okta.registerInput('select', Select);
Okta.registerInput('group', InputGroup);

module.exports = Okta;
