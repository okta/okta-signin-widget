define(['./BaseFormDialog'], function (BaseFormDialog) {

  return BaseFormDialog.extend({

    'save': 'OK',

    params: {
      minWidth: 500,
      maxWidth: 700,
      close: true
    },

    constructor: function () {
      BaseFormDialog.apply(this, arguments);

      if (this.content) {
        this.add(this.content);
      }

      this.listenTo(this, 'save', function () {
        var callback = this.ok || this.options.ok;
        callback && callback();
        this.remove();
      });

      this.listenTo(this, 'cancel', function () {
        var callback = this.cancelFn || this.options.cancelFn;
        callback && callback();
      });

    }

  });

});
