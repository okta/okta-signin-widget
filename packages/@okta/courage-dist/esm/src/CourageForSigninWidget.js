import BaseCollection from './courage/models/BaseCollection.js';
export { default as BaseModel } from './courage/models/BaseModel.js';
import BaseSchema from './courage/models/BaseSchema.js';
export { default as Model } from './courage/models/Model.js';
import SchemaProperty from './courage/models/SchemaProperty.js';
import BaseController from './courage/util/BaseController.js';
import BaseRouter from './courage/util/BaseRouter.js';
import ButtonFactory from './courage/util/ButtonFactory.js';
import Class from './courage/util/Class.js';
import Cookie from './courage/util/Cookie.js';
import Clipboard from './courage/util/Clipboard.js';
import Keys from './courage/util/Keys.js';
import Logger from './courage/util/Logger.js';
import StringUtil from './courage/util/StringUtil.js';
import Util from './courage/util/Util.js';
export { default as Handlebars } from '../lib/handlebars/dist/cjs/handlebars.runtime.js';
import './courage/util/handlebars/handle-url.js';
import './courage/util/handlebars/helper-base64.js';
import './courage/util/handlebars/helper-i18n.js';
import './courage/util/handlebars/helper-img.js';
import './courage/util/handlebars/helper-markdown.js';
import './courage/util/handlebars/helper-xsrfTokenInput.js';
export { default as $ } from './courage/util/jquery-wrapper.js';
export { default as _ } from './courage/util/underscore-wrapper.js';
export { default as ListView } from './courage/views/Backbone.ListView.js';
import BaseView from './courage/views/BaseView.js';
import BaseDropDown from './courage/views/components/BaseDropDown.js';
import Notification from './courage/views/components/Notification.js';
import BaseForm from './courage/views/forms/BaseForm.js';
import Toolbar from './courage/views/forms/components/Toolbar.js';
import FormUtil from './courage/views/forms/helpers/FormUtil.js';
import InputRegistry from './courage/views/forms/helpers/InputRegistry.js';
import SchemaFormFactory from './courage/views/forms/helpers/SchemaFormFactory.js';
import CheckBox from './courage/views/forms/inputs/CheckBox.js';
import PasswordBox from './courage/views/forms/inputs/PasswordBox.js';
import Radio from './courage/views/forms/inputs/Radio.js';
import Select from './courage/views/forms/inputs/Select.js';
import InputGroup from './courage/views/forms/inputs/InputGroup.js';
import TextBox from './courage/views/forms/inputs/TextBox.js';
import Callout from './courage/views/components/Callout.js';
export { default as Backbone } from './courage/vendor/lib/backbone.js';
import FrameworkView from './courage/framework/View.js';
export { default as FrameworkView } from './courage/framework/View.js';
import './util/scrollParent.js';
export { isModelPropertySchema } from './courage/framework/Model.js';
import './courage/util/SettingsModel.js';

const Controller = BaseController.extend({
  // The courage BaseController renders asynchronously in current versions of jQuery
  // https://github.com/okta/okta-ui/blob/master/packages/courage/src/util/BaseController.js#L108
  // https://api.jquery.com/jquery/#jQuery-callback
  // Override so that render is synchronous
  render: function (...args) {
    BaseView.prototype.render.apply(this, args);
    return this;
  }
}); // The string will be returned unchanged. All templates should be precompiled.

FrameworkView.prototype.compileTemplate = function (str) {
  const compiledTmpl = function fakeTemplate() {
    return str;
  };

  compiledTmpl.source = ''; // to satisfy TS

  return compiledTmpl;
}; // Override events to not support `Enter` submitting the form twice - OKTA-321999 and OKTA-317629


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
const TextBoxForSigninWidget = TextBox.extend({
  events: events
});
const PasswordBoxForSigninWidget = PasswordBox.extend({
  events: events
});
const Form = BaseForm.extend({
  scrollOnError: function () {
    // scrollOnError is true by default. Override to false if `scrollOnError` has been set to false in widget settings.
    const {
      settings: settings
    } = this.options;

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
const internal = {
  util: {
    Util: Util,
    Cookie: Cookie,
    Clipboard: Clipboard,
    Logger: Logger,
    Class: Class,
    Keys: Keys
  },
  views: {
    components: {
      BaseDropDown: BaseDropDown,
      Notification: Notification
    },
    forms: {
      helpers: {
        FormUtil: FormUtil,
        SchemaFormFactory: SchemaFormFactory
      },
      components: {
        Toolbar: Toolbar
      },
      inputs: {
        TextBox: TextBoxForSigninWidget,
        PasswordBox: PasswordBoxForSigninWidget,
        CheckBox: CheckBox,
        Radio: Radio,
        Select: Select,
        InputGroup: InputGroup
      }
    }
  },
  models: {
    BaseSchema: BaseSchema,
    SchemaProperty: SchemaProperty
  }
};
registerInput('text', TextBoxForSigninWidget);
registerInput('password', PasswordBoxForSigninWidget);
registerInput('checkbox', CheckBox);
registerInput('radio', Radio);
registerInput('select', Select);
registerInput('group', InputGroup);

export { Collection, Controller, Form, Router, View, createButton, createCallout, internal, loc, registerInput };
