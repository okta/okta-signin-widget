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
import Handlebars from 'handlebars';
import './courage/util/handlebars/handle-url';
import './courage/util/handlebars/helper-i18n';
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
import BaseInput from './courage/views/forms/BaseInput';
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

// Disable the Chosen jQuery plugin for the SIW — the SIW does not bundle Chosen CSS,
// so applying Chosen produces an unstyled dropdown. Use native <select> instead.
// Also restore placeholder localization for empty-key options removed in the upgrade.
const SelectForSigninWidget = Select.extend({
  editMode: function () {
    this.params = Object.assign({ chosen: false }, this.params);
    return Select.prototype.editMode.apply(this, arguments);
  },
  // Upstream appendOptions no longer localizes empty-key placeholder options
  // and removed the deferred update() call that syncs the DOM value to the model.
  // Restore both: localized placeholder for empty keys and deferred model sync.
  appendOptions: function () {
    if (!this.getOptions()) {
      return;
    }
    const options = this.getOptions();
    const keys = Object.keys(options);
    this.applySortByKey(keys);
    keys.forEach(key => {
      if (!key) {
        this.$select.prepend(this.option({
          key: '',
          value: StringUtil.localize('select.default_value', 'login'),
        }));
      } else {
        this.$select.append(this.option({
          key: key,
          value: options[key],
        }));
      }
    });
    // Sync the initial selected value to the model (removed in upstream upgrade)
    _.defer(_.bind(this.update, this));
  },
  // Patched to remove unneeded call to
  // this.$select.trigger('remove');
  // which causes error on IE11
  remove: function () {
    return BaseInput.prototype.remove.apply(this, arguments);
  },
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

    // iOS detection - check for iPad, iPhone, iPod, or iPad on iOS 13+
    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent)
      || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

    // Check if iOS scroll fix is enabled (default is true)
    const iosScrollFixEnabled = settings.get('features.iosScrollFix') !== false;

    // On iOS devices with scroll fix enabled, only allow scroll on form submission
    // Track form submission state to determine when to allow scrolling
    if (isIOS && iosScrollFixEnabled) {
      const activeElement = document.activeElement;
      const isActivelyTyping = activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
        !activeElement.readOnly;

      // Prevent scrolling during active typing
      if (isActivelyTyping) {
        return false;
      }
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
        Select: SelectForSigninWidget,
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
registerInput('select', SelectForSigninWidget);
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
