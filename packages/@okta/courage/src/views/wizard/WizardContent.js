define([
  'okta/underscore',
  'shared/views/BaseView',
  'shared/views/forms/BaseForm'
],
function (_, BaseView, BaseForm) {

  return BaseView.extend({
    className: 'o-wizard-content-wrap',

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

      function toggleButton(action) {
        return function (button) {
          _.defer(function () {
            state.trigger([button, action].join(':'));
          });
        };
      }

      _.extend(View.prototype, {
        enableButton: toggleButton('enable'),
        disableButton: toggleButton('disable')
      });

      this.add(View, {
        options: {
          model: currentStep.model && this.options[currentStep.model] || this.model,
          collection: currentStep.collection && this.options[currentStep.collection] || this.collection
        }
      });

      this.postRender = postRender;
      this.postRender();

      return this;
    }
  });

});
