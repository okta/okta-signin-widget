define([
  'okta/underscore',
  'shared/views/BaseView',
  'shared/views/forms/BaseForm'
],
function (_, BaseView, BaseForm) {

  return BaseView.extend({
    wizardStateEvents: {
      'change:step': 'render'
    },
    render: function () {
      /* eslint max-statements: 0 */

      var postRender = this.postRender || _.noop;
      this.postRender = _.noop;

      this.removeChildren();

      BaseView.prototype.render.apply(this, arguments);

      var View,
          state = this.options.wizardState,
          currentStep = state.getCurrentStep();
      if (currentStep.form) {
        var proto = _.extend({
          noButtonBar: true,
          saveOnEnter: false,
          validate: 'local'
        }, currentStep.form);
        View = BaseForm.extend(proto);
      }
      else {
        View = currentStep.view;
      }
      this.add(View);

      this.postRender = postRender;
      this.postRender();

      return this;
    },
    className: 'margin-5'
  });

});
