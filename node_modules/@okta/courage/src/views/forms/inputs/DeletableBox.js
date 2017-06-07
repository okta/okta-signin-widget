/* eslint max-params: [2, 6] */
define([
  'okta/underscore',
  'shared/framework/View',
  'shared/util/SchemaUtil',
  'shared/util/StringUtil',
  'shared/util/TemplateUtil',
  'shared/util/Time'
],
function (_, View, SchemaUtil, StringUtil, TemplateUtil, Time) {

  var isVowel = function (string) {
    return (/^[aeiou]/).test(string);
  };

  var getArticle = function (string) {
    return isVowel(string) ? 'an' : 'a';
  };

  var template = TemplateUtil.tpl('\
    <div class="o-form-input-group-controls">\
      <span class="input-fix o-form-control">\
        <input type="text" class="o-form-text" name="{{key}}" id="{{key}}" value="{{value}}" \
        placeholder="{{placeholder}}"/>\
      </span>\
      <a href="#" class="link-button link-button-icon icon-only clear-input-16">\
        <span class="icon "></span>\
      </a>\
    </div>\
    <p class="o-form-input-error o-form-explain">\
      <span class="icon icon-16 error-16-small"></span> {{errorExplain}}\
    </p>\
  '),
      errorClass = 'o-form-has-errors',
      updateArrayEvent = 'updateArray';

  return View.extend({

    tagName: 'div',

    className: 'o-form-input-group',

    events: {
      'click a': function (e) {
        e.preventDefault();
        this.remove();
      },
      'keyup input': function () {
        this.update();
      }
    },

    isEditMode: function () {
      return !this.options.readOnly && (this.options.read !== true || this.model.get('__edit__') === true);
    },

    initialize: function () {
      this.template = template(
        _.extend(this.options, {
          placeholder: this.getPlaceholderText(),
          errorExplain: this.getErrorExplainText()
        })
      );
      this.update = _.debounce(this.update, this.options.debounceDelay || Time.DEBOUNCE_DELAY);
    },

    render: function () {
      if (this.isEditMode()) {
        this.$el.html(this.template);
      }
      else {
        this.$el.text(this.options.value);
        this.$('a').hide();
      }
      return this;
    },

    remove: function () {
      this.trigger(updateArrayEvent, null);
      this.$el.slideUp(_.bind(function () {
        View.prototype.remove.call(this, arguments);
      }, this));
    },

    update: function () {
      var updatedValue = this.$('input').val(),
          parseFunc = _.object(
            [SchemaUtil.DATATYPE.number, SchemaUtil.DATATYPE.integer],
            [StringUtil.parseFloat, this.parseInt]
          );
      if (_.has(parseFunc, this.options.itemType)) {
        updatedValue = parseFunc[this.options.itemType](updatedValue);
        !_.isNumber(updatedValue) ? this.markInvalid() : this.clearInvalid();
      }
      this.trigger(updateArrayEvent, updatedValue);
    },

    markInvalid: function () {
      this.$el.addClass(errorClass);
    },

    clearInvalid: function () {
      this.$el.removeClass(errorClass);
    },

    getPlaceholderText: function () {
      var text = ['Enter'];
      text.push(getArticle(this.options.itemType));
      text.push(this.options.itemType.toLowerCase());
      return text.join(' ');
    },

    getErrorExplainText: function () {
      var text = ['Value must be'];
      text.push(getArticle(this.options.itemType));
      text.push(this.options.itemType.toLowerCase());
      return text.join(' ');
    },

    parseInt: function (string) {
      // native javascript parseInt is aggressive
      // there're cases we don't want a string to be parsed even though it is convertable
      // so that we don't convert a string silently before warning a user the potential error
      // this is to make sure the string is in an integer format before we parse it
      if (/^-?\d+$/.test(string)) {
        var num = parseInt(string, 10);
        return !_.isNaN(num) ? num : string;
      }
      return string;
    }
  });
});
