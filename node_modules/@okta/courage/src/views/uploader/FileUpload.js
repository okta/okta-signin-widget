define([
  'okta/jquery',
  'shared/util/TemplateUtil',
  'shared/views/BaseView'
], function ($, TemplateUtil, BaseView) {

  var template = TemplateUtil.tpl('\
    <input type="file" name="file" class="m-file">\
    <div class="facade">\
      <input type="text" class="text-field-default" disabled>\
      {{{img src="/img/ui/button/file-browse-01.png" alt="Browse files..." class="browse"}}}\
    </div>\
    <input type="hidden" class="hide" name="_xsrfToken" value="{{token}}">\
  ');

  var View = BaseView.extend({
    template: template,
    className: 'file-input-facade margin-top-10 margin-btm-10 clearfix',

    events: {
      'change .m-file': 'updateDisplayVal'
    },

    updateDisplayVal: function () {
      var val = this.getFilename();
      if (val.match(/^C:\\fakepath/)) {
        val = val.replace('C:\\fakepath\\', '');
      }

      this.updateDisplay(val);
    },

    updateDisplay: function (value) {
      this.$('.text-field-default').val(value);
    },

    // Makes the unit testing nicer. TDD FTW
    getFilename: function () {
      return this.$('.m-file').val();
    },

    render: function () {
      var token = $('#_xsrfToken').text();
      this.$el.html(this.template({token: token}));

      return this;
    }
  });

  return View;
});
