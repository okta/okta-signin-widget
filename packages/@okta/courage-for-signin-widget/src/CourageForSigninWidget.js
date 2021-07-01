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
import Clipboard from '@okta/courage/src/util/Clipboard';
import Keys from '@okta/courage/src/util/Keys';
import Logger from '@okta/courage/src/util/Logger';
import StringUtil from '@okta/courage/src/util/StringUtil';
import Util from '@okta/courage/src/util/Util';
import Handlebars from '@okta/courage/src/util/handlebars-wrapper';
import $ from '@okta/courage/src/util/jquery-wrapper';
import _ from '@okta/courage/src/util/underscore-wrapper';
import ListView from '@okta/courage/src/views/Backbone.ListView';
import BaseView from '@okta/courage/src/views/BaseView';
import BaseDropDown from '@okta/courage/src/views/components/BaseDropDown';
import Notification from '@okta/courage/src/views/components/Notification';
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

import FrameworkView from '@okta/courage/src/framework/View';

import './util/scrollParent';

// The string will be returned unchanged. All templates should be precompiled.
FrameworkView.prototype.compileTemplate = function(str) {
  return function fakeTemplate() {
    return str;
  };
};

// Override events to not support `Enter` submitting the form twice - OKTA-321999 and OKTA-317629
const events = {
  'input input': 'update',
  'change input': 'update',
  'keydown input': 'update',
  'keyup input': function (e) {
    if (Keys.isEsc(e)) {
      this.model.trigger('form:cancel');
    }
  }
};
const TextBoxForSigninWidget = TextBox.extend({ events });
const PasswordBoxForSigninWidget = PasswordBox.extend({ events });

const Form = BaseForm.extend({
  scrollOnError() {
    // scrollOnError is true by default. Override to false if `scrollOnError` has been set to false in widget settings.
    const { settings } = this.options;
    if (settings.get('features.scrollOnError') === false) {
      return false;
    }
    return true;
  }
});

const Okta = {
  Backbone: Backbone,

  $: $,

  _: _,

  Handlebars: Handlebars,

  loc: StringUtil.localize,

  createButton: ButtonFactory.create,

  createCallout: Callout.create,

  registerInput: InputRegistry.register,

  Model: Model,

  // TODO: BaseModel has been deprecated and shall not be public
  // remove this once clean up usage in widget.
  BaseModel: BaseModel,

  Collection: BaseCollection,

  FrameworkView: FrameworkView,

  View: BaseView,

  ListView: ListView,

  Router: BaseRouter,

  Controller: BaseController,

  Form,

  internal: {
    util: {
      Util,
      Cookie,
      Clipboard,
      Logger,
      Class,
      Keys,
    },

    views: {
      components: {
        BaseDropDown,
        Notification,
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
          TextBox: TextBoxForSigninWidget,
          PasswordBox: PasswordBoxForSigninWidget,
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

Okta.registerInput('text', TextBoxForSigninWidget);
Okta.registerInput('password', PasswordBoxForSigninWidget);
Okta.registerInput('checkbox', CheckBox);
Okta.registerInput('radio', Radio);
Okta.registerInput('select', Select);
Okta.registerInput('group', InputGroup);

export default Okta;
