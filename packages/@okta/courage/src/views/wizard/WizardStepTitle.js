define([
  'okta/underscore',
  'shared/views/BaseView',
  'shared/util/TemplateUtil'
], function (_, BaseView, TemplateUtil) {

  return BaseView.extend({
    tagName: 'h2',
    wizardStateEvents: {
      'change:step': 'render'
    },
    template: function (data) {
      var tpl = '{{title}}';
      if (data.escapeTitle === false) {
        tpl = '{{{title}}}';
      }
      return TemplateUtil.tpl(tpl)(data);
    },
    getTemplateData: function () {
      var data = this.options.wizardState.getCurrentStep();
      return {
        title: _.resultCtx(data, 'title', this),
        escapeTitle: data.escapeTitle
      };
    }
  });
});
