define(['shared/views/BaseView'], function (BaseView) {

  return BaseView.extend({
    tagName: 'h2',
    wizardStateEvents: {
      'change:step': 'render'
    },
    template: '{{title}}',
    getTemplateData: function () {
      return this.options.wizardState.getCurrentStep();
    }
  });

});
