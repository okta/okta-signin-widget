import BaseCollection from './courage/models/BaseCollection';
import BaseModel from './courage/models/BaseModel';
import BaseSchema from './courage/models/BaseSchema';
import Model from './courage/models/Model';
import SchemaProperty from './courage/models/SchemaProperty';
import BaseController from './courage/util/BaseController';
import BaseRouter from './courage/util/BaseRouter';
import ButtonFactory from './courage/util/ButtonFactory';
import Class from './courage/util/Class';
import Cookie from './courage/util/Cookie';
import Clipboard from './courage/util/Clipboard';
import Keys from './courage/util/Keys';
import Logger from './courage/util/Logger';
import StringUtil from './courage/util/StringUtil';
import Util from './courage/util/Util';
import Handlebars from './courage/util/handlebars-wrapper';
import $ from './courage/util/jquery-wrapper';
import _ from './courage/util/underscore-wrapper';
import ListView from './courage/views/Backbone.ListView';
import BaseView from './courage/views/BaseView';
import BaseDropDown from './courage/views/components/BaseDropDown';
import Notification from './courage/views/components/Notification';
import BaseForm from './courage/views/forms/BaseForm';
import Toolbar from './courage/views/forms/components/Toolbar';
import FormUtil from './courage/views/forms/helpers/FormUtil';
import InputRegistry from './courage/views/forms/helpers/InputRegistry';
import SchemaFormFactory from './courage/views/forms/helpers/SchemaFormFactory';
import CheckBox from './courage/views/forms/inputs/CheckBox';
import PasswordBox from './courage/views/forms/inputs/PasswordBox';
import Radio from './courage/views/forms/inputs/Radio';
import Select from './courage/views/forms/inputs/Select';
import InputGroup from './courage/views/forms/inputs/InputGroup';
import TextBox from './courage/views/forms/inputs/TextBox';
import Callout from './courage/views/components/Callout';
import Backbone from 'backbone';

import FrameworkView, { FrameworkViewClass } from './courage/framework/View';
import './util/scrollParent';

const Controller = BaseController.extend({
  // The courage BaseController renders asynchronously in current versions of jQuery
  // https://github.com/okta/okta-ui/blob/master/packages/courage/src/util/BaseController.ts#L117-L119
  // https://api.jquery.com/jquery/#jQuery-callback
  // Override so that render is synchronous
  render: function(...args) {
    BaseView.prototype.render.apply(this, args);
    return this;
  }
});

// The string will be returned unchanged. All templates should be precompiled.
FrameworkView.prototype.compileTemplate = function(str) {
  const compiledTmpl = function fakeTemplate() {
    return str;
  };
  compiledTmpl.source = ''; // to satisfy TS
  return compiledTmpl;
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

const loc = StringUtil.localize;
const createButton = ButtonFactory.create;
const createCallout = Callout.create;
const registerInput = InputRegistry.register;
const Collection = BaseCollection;
const View = BaseView;
const Router = BaseRouter;

export interface Internal {
  util: any;
  views: {
    components: any;
    forms: {
      helpers: any;
      components: any;
      inputs: any;
    }
  },
  models: any;
}
const internal: Internal = {
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
};

registerInput('text', TextBoxForSigninWidget);
registerInput('password', PasswordBoxForSigninWidget);
registerInput('checkbox', CheckBox);
registerInput('radio', Radio);
registerInput('select', Select);
registerInput('group', InputGroup);

export {
  Backbone,

  $,

  _,

  Handlebars,

  loc,

  createButton,

  createCallout,

  registerInput,

  Model,

  // TODO: BaseModel has been deprecated and shall not be public
  // remove this once clean up usage in widget.
  BaseModel,

  Collection,

  FrameworkView,

  View,

  ListView,

  Router,

  Controller,

  Form,

  internal,
};

// Additional type exports
export * from './courage/views/forms/types';
export * from './courage/framework/Model';
export * from './courage/models/Model';
export * from './courage/util/BaseRouter';
export * from './courage/util/SettingsModel';
export * from './courage/util/jquery-wrapper';
export * from './courage/util/underscore-wrapper';
