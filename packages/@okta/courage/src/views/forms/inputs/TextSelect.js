define([
  'okta/jquery',
  'okta/underscore',
  'shared/util/TemplateUtil',
  'shared/util/Keys',
  'shared/views/forms/BaseInput'
],
  function ($, _, TemplateUtil, Keys, BaseInput) {

    var template = TemplateUtil.tpl('\
      <input type="text" class="okta-form-input-field input-fix float-l" \
      name="{{name}}" id="{{inputId}}" value="{{value}}" placeholder="{{placeholder}}">\
      <a class="chzn-single float-l">\
        <div>\
          <b></b>\
        </div>\
      </a>\
      <div class="chzn-drop">\
        <ul class="chzn-results">\
        </ul>\
      </div>\
    ');

    return BaseInput.extend({
      tagName: 'div',

      template: template,

      className: 'o-form-control chzn-container chzn-container-active chzn-container-single text-select',

      events: {
        'click .chzn-single': function (e) {
          // this is a click on the drop-down arrow to display/hide results
          // results are shown when .chzn-with-drop is added to the top element
          e.preventDefault();
          e.stopPropagation();
          this.$el.toggleClass('chzn-with-drop');
        },

        'click .chzn-drop': function (e) {
          e.stopPropagation();
        },

        'mouseover .active-result': function (e) {
          var target;
          target = $(e.target).hasClass('active-result') ? $(e.target) : $(e.target).parents('.active-result').first();
          if (!target.hasClass('highlighted')) {
            target.addClass('highlighted');
          }
        },

        'mouseout .active-result': function (e) {
          var target;
          target = $(e.target).hasClass('active-result') ? $(e.target) : $(e.target).parents('.active-result').first();
          if (target.hasClass('highlighted')) {
            target.removeClass('highlighted');
          }
        },

        'click .active-result': function (e) {
          var target;
          target = $(e.target).hasClass('active-result') ? $(e.target) : $(e.target).parents('.active-result').first();
          if (target.hasClass('highlighted')) {
            this._removeClass();
            this.$('input')
              .val(target.text())
              .trigger('change');
          }
        },
        'input input': 'update',
        'change input': 'update',
        'propertychange input': 'update',

        'keyup input': function (e) {
          if (Keys.isEnter(e)) {
            this.model.trigger('form:save');
          }
        }
      },

      optionTemplate: TemplateUtil.tpl('<li class="active-result">{{value}}</li>'),

      constructor: function () {
        BaseInput.apply(this, arguments);
        // close the dropdown when we click outside the dropdown
        $(document).click(_.bind(this._removeClass, this));
      },

      _removeClass: function () {
        this.$el.removeClass('chzn-with-drop');
      },

      editMode: function () {
        BaseInput.prototype.editMode.apply(this, arguments);
        _.each(this.options.options, function (value, key) {
          this.$('.chzn-results').append(this.optionTemplate({key: key, value: value}));
        }, this);
        return this;
      },

      val: function () {
        return this.$('input').val();
      },

      focus: function () {
        return this.$('input').focus();
      }
    });

  });
