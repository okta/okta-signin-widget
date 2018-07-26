define([
  'okta/underscore',
  'shared/views/BaseView',
  './FileUpload',
  './SubmitLogo'
], function (_, BaseView, FileUpload, SubmitLogo) {

  var View = BaseView.extend({

    tagName: 'form',

    className: 'clearfix padding-btm-10',

    attributes: function () {
      return {
        method: 'post',
        enctype: 'multipart/form-data',
        action: this.options.endpoint,
        target: this.options.target
      };
    },

    initialize: function () {
      this.fileUpload = new FileUpload();
      this.add(this.fileUpload);

      this.submitBtn = new SubmitLogo();
      this.add(this.submitBtn);
      this.submitBtn.$el.on('click', _.bind(this.submit, this));
    },

    submit: function (e) {
      e.preventDefault();
      this.submitBtn.disable(true);

      var $parent = this.$el.parent();
      this.$el.detach().appendTo('body');
      this.$el.submit();
      this.$el.detach().appendTo($parent);
    },

    uploadDone: function () {
      this.submitBtn.disable(false);
    }
  });

  return View;
});
