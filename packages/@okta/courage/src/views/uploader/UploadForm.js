define([
  'shared/views/BaseView',
  './FileUpload',
  './SubmitLogo'
], function (BaseView, FileUpload, SubmitLogo) {

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

    events: {
      'submit': function () {
        this.submitBtn.disable(true);
      }
    },

    initialize: function () {
      this.fileUpload = new FileUpload();
      this.add(this.fileUpload);

      this.submitBtn = new SubmitLogo();
      this.add(this.submitBtn);
      return this;
    },

    uploadDone: function () {
      this.submitBtn.disable(false);
    }
  });

  return View;
});
