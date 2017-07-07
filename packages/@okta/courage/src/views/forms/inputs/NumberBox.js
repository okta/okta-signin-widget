define([
  'okta/underscore',
  './TextBox',
  'shared/util/StringUtil'
],
function (_, TextBox, StringUtil) {

  return TextBox.extend({

    editMode: function () {
      TextBox.prototype.editMode.apply(this, arguments);
      if (this.options.params) {
        this.$(':input').prop(_.pick(this.options.params, 'min', 'max', 'step'));
      }
      return this;
    },

    to: StringUtil.parseFloat

  });

});
