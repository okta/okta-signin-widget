import oktaUnderscore from '../../../util/underscore-wrapper.js';
import ButtonFactory from '../../../util/ButtonFactory.js';
import BaseView from '../../BaseView.js';
import BaseInput from '../BaseInput.js';

function countInputs(inputs) {
  return oktaUnderscore.filter(inputs || [], function (input) {
    return !oktaUnderscore.contains(['label', 'button', 'select'], input.type);
  }).length;
}

const InputGroupLabelInput = BaseInput.extend({
  tagName: 'span',
  initialize: function () {
    this.$el.text(this.getModelValue());
  },
  editMode: function () {
    this.toggle(true);
  },
  readMode: function () {
    this.toggle(false);
  },
  getModelValue: function () {
    return this.options.label;
  },
  toggle: function (isEditMode) {
    this.$el.toggleClass('o-form-label-inline', isEditMode);
    this.$el.toggleClass('o-form-control', !isEditMode);
  },
  focus: oktaUnderscore.noop
});

function createButtonInput(options) {
  return ButtonFactory.create(oktaUnderscore.defaults({
    getReadModeString: oktaUnderscore.constant(' '),
    focus: oktaUnderscore.noop
  }, oktaUnderscore.pick(options, 'click', 'title', 'href', 'icon')));
}

const InputGroupInputGroupView = BaseView.extend({
  getParams: BaseInput.prototype.getParams,
  getParam: BaseInput.prototype.getParam,
  className: function () {
    let className; // Allows views to group multiple inputs under one label without any of the other
    // styling/rendering changes that come with using a group input

    if (this.getParam('noBaseClasses')) {
      return '';
    }

    if (this.getParam('display') === 'text') {
      className = 'o-form-input-group-subtle';
    } else {
      className = 'o-form-input-group';
    }

    if (countInputs(this.getParam('inputs')) > 1) {
      className += ' o-form-input-group-2';
    }

    return className;
  },
  initialize: function () {
    oktaUnderscore.each(this.getParam('inputs'), function (input) {
      switch (input.type) {
        case 'label':
          this.add(InputGroupLabelInput, {
            options: input
          });
          break;

        case 'button':
          this.add(createButtonInput(input));
          break;

        default:
          input = oktaUnderscore.defaults({
            model: this.model,
            params: oktaUnderscore.extend({
              autoWidth: true
            }, input.params || {})
          }, input);
          this.add(this.getParams().create(input));
      }
    }, this);
  },
  focus: function () {
    this.first().focus();
  }
});
var InputGroup = BaseInput.extend({
  constructor: function (options) {
    this.inputGroupView = new InputGroupInputGroupView(options);
    BaseInput.apply(this, arguments);
  },
  editMode: function () {
    this.inputGroupView.remove();
    this.inputGroupView = new InputGroupInputGroupView(this.options);
    this.$el.html(this.inputGroupView.render().el);
  },
  readMode: function () {
    // Allows the user to use to the default "read mode" of the child inputs instead of
    // rendering a single read mode string for all the child inputs
    if (this.getParam('useChildInputsReadMode')) {
      this.editMode();
    } else {
      BaseInput.prototype.readMode.apply(this, arguments);
    }
  },
  toStringValue: function () {
    const strings = this.inputGroupView.map(function (input) {
      return input.getReadModeString();
    });
    return strings.length && oktaUnderscore.every(strings) ? strings.join(' ') : ' ';
  },
  focus: function () {
    this.inputGroupView.focus();
  }
}, {
  // test hooks
  LabelInput: InputGroupLabelInput,
  InputGroupView: InputGroupInputGroupView
});

export { InputGroup as default };
