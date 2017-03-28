define([
  'okta/underscore',
  '../BaseInput',
  'shared/views/BaseView',
  'shared/util/ButtonFactory'
], function (_, BaseInput, BaseView, ButtonFactory) {


  function countInputs(inputs) {
    return _.filter(inputs || [], function (input) {
      return !_.contains(['label', 'button', 'select'], input.type);
    }).length;
  }

  var LabelInput = BaseInput.extend({
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
    focus: _.noop
  });

  function createButtonInput(options) {
    return ButtonFactory.create(_.defaults({
      getReadModeString: _.constant(' '),
      focus: _.noop
    }, _.pick(options, 'click', 'title', 'href')));
  }

  var InputGroupView = BaseView.extend({

    getParams: BaseInput.prototype.getParams,
    getParam: BaseInput.prototype.getParam,

    className: function () {
      var className;
      if (this.getParam('display') == 'text') {
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
      _.each(this.getParam('inputs'), function (input) {
        switch (input.type) {
        case 'label':
          this.add(LabelInput, {options: input});
          break;
        case 'button':
          this.add(createButtonInput(input));
          break;
        default:
          input = _.defaults({
            model: this.model,
            params: _.extend({
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


  return BaseInput.extend({

    constructor: function (options) {
      this.inputGroupView = new InputGroupView(options);
      BaseInput.apply(this, arguments);
    },

    editMode: function () {
      this.inputGroupView.remove();
      this.inputGroupView = new InputGroupView(this.options);
      this.$el.html(this.inputGroupView.render().el);
    },

    toStringValue: function () {
      var strings = this.inputGroupView.map(function (input) {
        return input.getReadModeString();
      });
      return strings.length && _.every(strings) ? strings.join(' ') : ' ';
    },

    focus: function () {
      this.inputGroupView.focus();
    }

  },
    {  // test hooks
      LabelInput: LabelInput,
      InputGroupView: InputGroupView
    });


});
