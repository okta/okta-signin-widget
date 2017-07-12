define(['shared/views/BaseView'],
  function (BaseView) {

    var View = BaseView.extend({
      tagName: 'input',

      className: 'button',

      attributes: {
        type: 'submit',
        value: 'Upload Logo'
      },

      disable: function (disabled) {
        this.$el.prop('disabled', disabled);
      }
    });

    return View;
  });