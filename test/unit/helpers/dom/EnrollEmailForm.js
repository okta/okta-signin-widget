define(['./Form'], function (Form) {
  return Form.extend({
    enrollEmailContent: function () {
      return this.el('enroll-email-content').trimmedText();
    },
  });
});
