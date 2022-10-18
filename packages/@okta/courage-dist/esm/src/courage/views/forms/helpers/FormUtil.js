import oktaUnderscore from '../../../util/underscore-wrapper.js';
import Keys from '../../../util/Keys.js';
import Logger from '../../../util/Logger.js';
import StringUtil from '../../../util/StringUtil.js';
import ViewUtil from '../../../util/ViewUtil.js';
import BaseView from '../../BaseView.js';

/* eslint max-params: [2, 6] */
const LABEL_OPTIONS = ['model', 'id', 'inputId', 'type', 'label', 'sublabel', 'tooltip', 'name', 'group'];
const CONTAINER_OPTIONS = ['wide', 'multi', 'input', 'label-top', 'explain', 'explain-top', 'customExplain', 'model', 'name', 'type', 'autoRender', 'multirowError'];
const WRAPPER_OPTIONS = ['model', 'name', 'label-top', 'readOnly', 'events', 'initialize', 'showWhen', 'bindings', 'render', 'className', 'data-se', 'toggleWhen', 'group'];
const INPUT_OPTIONS = ['model', 'name', 'inputId', 'type', // base options
'input', // custom input
'placeholder', 'label', // labels
'readOnly', 'read', 'disabled', 'readModeString', // modes
'options', // select/radio
'deps', // used to specify inputs that have dependencies and show a callout to user on select
'from', 'to', // model transformers,
'autoRender', // model attributes change event to trigger rerendering of the input
'inlineValidation', // control inline validating against the model on focus lost
'validateOnlyIfDirty', // check if field has been interacted with and then validate
'ariaLabel', // 508 compliance for inputs that do not have label associated with them
'params', 'autoComplete', // autocomplete attribute
'sortByKey'];
const OTHER_OPTIONS = ['errorField' // widgets params - for input specific widgets
];

const ALL_OPTIONS = oktaUnderscore.uniq(oktaUnderscore.union(LABEL_OPTIONS, CONTAINER_OPTIONS, WRAPPER_OPTIONS, INPUT_OPTIONS, OTHER_OPTIONS));

const SAVE_BUTTON_PHASES = ['•         ', '•  •      ', '•  •  •   ', '•  •  •  •', '   •  •  •', '      •  •', '         •', '          ', '          ', '          '];

function decorateDoWhen(doWhen) {
  if (doWhen && !doWhen['__edit__']) {
    return oktaUnderscore.extend({
      __edit__: oktaUnderscore.constant(true)
    }, doWhen);
  }
}

function createButton(options) {
  options = oktaUnderscore.pick(options || {}, 'action', 'id', 'className', 'text', 'type');
  let timeoutId;
  let intervalId;
  let phaseCount;
  return BaseView.extend({
    tagName: 'input',
    className: 'button',
    events: {
      click: function () {
        if (options.action && !this.disabled()) {
          options.action.call(this);
        }
      },
      keyup: function (e) {
        if (Keys.isEnter(e) && options.action && !this.disabled()) {
          options.action.call(this);
        }
      }
    },
    disabled: function () {
      return this.$el.prop('disabled') === true;
    },
    disable: function () {
      this.$el.prop('disabled', true);
      this.$el.addClass('btn-disabled');
    },
    enable: function () {
      this.$el.prop('disabled', false);
      this.$el.removeClass('btn-disabled');
    },
    initialize: function () {
      const self = this;
      this.$el.attr('type', options.type === 'save' ? 'submit' : 'button');
      this.$el.val(options.text);

      if (options.id) {
        this.$el.attr('id', options.id);
      }

      if (options.className) {
        this.$el.addClass(options.className);
      }

      if (options.type) {
        this.$el.attr('data-type', options.type);
      }

      this.$el.mousedown(function () {
        self.model.set('__pending__', true);
      });
      this.$el.mouseup(function () {
        self.model.set('__pending__', false);
      });
      this.listenTo(this.model, 'form:set-saving-state', function () {
        this.disable();

        if (options.type === 'save') {
          timeoutId = setTimeout(oktaUnderscore.bind(this.__changeSaveText, this), 1000);
        }
      });
      this.listenTo(this.model, 'form:clear-saving-state', function () {
        this.enable();

        if (options.type === 'save') {
          clearTimeout(timeoutId);
          clearInterval(intervalId);
          this.$el.val(options.text);
        }
      });
    },
    __changeSaveText: function () {
      phaseCount = 0;
      intervalId = setInterval(oktaUnderscore.bind(this.__showLoadingText, this), 200);
    },
    __showLoadingText: function () {
      this.$el.val(SAVE_BUTTON_PHASES[phaseCount++ % SAVE_BUTTON_PHASES.length]);
    }
  });
}

function validateInput(options, model) {
  /* eslint max-statements: 0, complexity: 0 */
  options || (options = {});

  if (options.type === 'label') {
    if (!options.label) {
      Logger.warn('A label input must have a "label" parameter', options);
    }

    return;
  }

  if (options.type === 'button') {
    if (!options.title && !options.icon) {
      Logger.warn('A button input must have a "title" and/or an "icon" parameter', options);
    }

    if (!options.click && !options.href) {
      Logger.warn('A button input must have a "click" and/or an "href" parameter', options);
    }

    return;
  }

  if (!options.name && !options.input) {
    Logger.warn('Missing "name" or "input" parameters', options);
  }

  if (oktaUnderscore.isArray(options.name) && oktaUnderscore.isArray(options.input)) {
    throw new Error('Not allowed to have both "name" and "input" defined as array.');
  }

  if (options.type !== 'list' && options.name && model && model.allows) {
    let names = [];

    if (oktaUnderscore.isArray(options.name)) {
      names = options.name;
    } else {
      names.push(options.name);
    }

    oktaUnderscore.each(names, function (name) {
      if (!model.allows(name)) {
        throw new Error('field not allowed: ' + options.name);
      }
    });
  }

  if (oktaUnderscore.isArray(options.input) && options.type !== 'list') {
    oktaUnderscore.each(options.input, function (input) {
      validateInput(input, model);
    });
  }

  const keys = oktaUnderscore.keys(options);

  const intersection = oktaUnderscore.intersection(keys, ALL_OPTIONS);

  if (oktaUnderscore.size(intersection) !== oktaUnderscore.size(options)) {
    const fields = oktaUnderscore.clone(ALL_OPTIONS);

    Logger.warn('Invalid input parameters', oktaUnderscore.without(keys, ...fields), options);
  }
}

function generateInputOptions(options, form, createFn) {
  options = oktaUnderscore.clone(options);

  if (oktaUnderscore.contains(['list', 'group'], options.type)) {
    options.params = oktaUnderscore.defaults({
      create: createFn,
      inputs: oktaUnderscore.map(oktaUnderscore.isArray(options.input) ? options.input : [options.input], function (input) {
        return oktaUnderscore.first(generateInputOptions(input, form, createFn));
      })
    }, options.params || {});
    delete options.input;
  }

  const inputs = oktaUnderscore.isArray(options.input) ? oktaUnderscore.clone(options.input) : [options];
  return oktaUnderscore.map(inputs, function (input) {
    const target = oktaUnderscore.defaults({
      model: form.model
    }, input, oktaUnderscore.omit(options, 'input', 'inputs'), form.options, {
      id: oktaUnderscore.uniqueId('input'),
      readOnly: form.isReadOnly(),
      read: form.hasReadMode()
    });

    if (form.isReadOnly()) {
      target.read = target.readOnly = true;
    }

    return target;
  });
}

var FormUtil = {
  LABEL_OPTIONS: LABEL_OPTIONS,
  CONTAINER_OPTIONS: CONTAINER_OPTIONS,
  WRAPPER_OPTIONS: WRAPPER_OPTIONS,
  INPUT_OPTIONS: INPUT_OPTIONS,
  generateInputOptions: generateInputOptions,
  changeEventString: function (fieldNames) {
    return 'change:' + fieldNames.join(' change:');
  },
  createReadFormButton: function (options) {
    let action;
    let text;
    let ariaLabel;

    if (options.type === 'cancel') {
      text = ariaLabel = StringUtil.localize('oform.cancel', 'courage');

      action = function () {
        this.model.trigger('form:cancel');
      };
    } else {
      text = StringUtil.localize('oform.edit', 'courage');
      ariaLabel = text + ' ' + options.formTitle;

      action = function () {
        this.model.set('__edit__', true);
      };
    }

    return BaseView.extend({
      tagName: 'a',
      className: options.className,
      attributes: {
        href: '#',
        'aria-label': ariaLabel
      },
      // TODO: refactor to enforce precompiled templates OKTA-309852
      // eslint-disable-next-line @okta/okta-ui/no-bare-templates
      template: function () {
        return oktaUnderscore.escape(text);
      },
      events: {
        click: function (e) {
          e.preventDefault();
          action.call(this);
        }
      }
    });
  },
  createButton: function (options) {
    options = oktaUnderscore.clone(options);

    switch (options.type) {
      case 'save':
        oktaUnderscore.defaults(options, {
          className: 'button-primary'
        });

        break;

      case 'cancel':
        oktaUnderscore.defaults(options, {
          className: 'button-clear',
          text: StringUtil.localize('oform.cancel', 'courage'),
          action: function () {
            this.model.trigger('form:cancel');
          }
        });

        break;

      case 'previous':
        oktaUnderscore.defaults(options, {
          text: StringUtil.localize('oform.previous', 'courage'),
          action: function () {
            this.model.trigger('form:previous');
          }
        });

        break;
    }

    return createButton(options);
  },
  validateInput: validateInput,

  /**
   * Applies a show-when logic on a view instance.
   * The show-when is a map of a model field name -> a boolean or a function that returns a boolean.
   * The view will toggle based on the field value.
   *
   * @param  {Okta.View} view a view instance that has a this.model attached to it
   * @param  {Object} showWhen
   */
  applyShowWhen: function (view, showWhen) {
    const toggleAndResize = function (bool) {
      return function () {
        // The `toggle` is here since an event may be triggered before the el is in the DOM
        // and in that case slide events may not function as expected.
        view.$el.toggle(bool);
        view.model.trigger('form:resize');
      };
    };

    ViewUtil.applyDoWhen(view, decorateDoWhen(showWhen), function (bool, options) {
      if (!options.animate) {
        view.$el.toggle(bool);
      } else {
        view.$el['slide' + (bool ? 'Down' : 'Up')](200, toggleAndResize(bool));
      }
    });
  },
  applyToggleWhen: function (view, toggleWhen) {
    ViewUtil.applyDoWhen(view, decorateDoWhen(toggleWhen), function (bool, options) {
      view.$el.toggle(bool);
      view.model.trigger('form:resize');

      if (options.animate) {
        view.render();
      }
    });
  }
};

export { FormUtil as default };
