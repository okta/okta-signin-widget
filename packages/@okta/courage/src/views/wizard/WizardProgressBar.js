define([
  'okta/underscore',
  'shared/views/BaseView'
],
function (_, BaseView) {

  var ProgressBarStep = BaseView.extend({
    tagName: 'li',
    className: 'o-wizard-step',
    wizardStateEvents: {
      'change:step change:error wizard:done wizard:error': 'render'
    },

    initialize: function () {
      this.__substepClass = null;
    },

    template: '\
      <span class="icon icon-16 icon-only"></span>\
      {{#if step.label }}\
        <h4 class="o-wizard-step-label">{{step.label}}</h4>\
      {{/if}}\
    ',

    isCurrent: function () {
      var subSteps = this.getSubSteps(),
          myStep = this.options.counter,
          stateStep = this.options.wizardState.get('step');

      var isCurrentStep = myStep == stateStep,
          isAtSubStep = myStep < stateStep && subSteps.total > 1 && subSteps.done < subSteps.total;

      return (isCurrentStep || isAtSubStep);
    },

    isActive: function () {
      return this.isCurrent() && !this.isCompleted() && !this.options.wizardState.get('error');
    },

    isError: function () {
      return this.isCurrent() && this.options.wizardState.get('error');
    },

    isCompleted: function () {
      var subSteps = this.getSubSteps();
      return this.options.wizardState.get('done') ||
        (this.options.counter < this.options.wizardState.get('step') && subSteps.total == subSteps.done);
    },

    getSubSteps: function () {
      return this.options.wizardState.getSubStepsInfo(this.options.counter);
    },

    postRender: function () {
      var subSteps = this.getSubSteps();

      this.$el
        .toggleClass('o-wizard-active', this.isActive())
        .toggleClass('o-wizard-complete', this.isCompleted())
        .toggleClass('o-wizard-error', this.isError());

      this.$el.removeClass(this.__substepClass);
      if (subSteps.total > 1 && subSteps.done > 0 && subSteps.done < subSteps.total) {
        this.__substepClass = 'o-wizard-has-substep o-wizard-substeps-' + subSteps.done + '-' + subSteps.total;
        this.$el.addClass(this.__substepClass);
      }

      this.$('span')
        .toggleClass('confirm-16-green', this.isCompleted())
        .toggleClass('error-16-red', this.isError());
    }
  });

  return BaseView.extend({
    tagName: 'ol',
    className: 'o-wizard-progressbar',
    initialize: function () {
      this.__counter = 0;
      _.each(this.options.wizardState.getSteps(), function (step) {
        this.addStep(step);
      }, this);
    },
    addStep: function (step) {
      if (!step.substep) {
        this.add(ProgressBarStep, {
          options: {
            counter: this.__counter,
            step: step
          }
        });
      }
      this.__counter++;
    }
  }, {
    ProgressBarStep: ProgressBarStep
  });

});
