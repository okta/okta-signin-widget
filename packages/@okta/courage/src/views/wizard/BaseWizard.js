define([
  'okta/jquery',
  'okta/underscore',
  'shared/views/BaseView',
  'shared/views/forms/BaseForm',
  './WizardProgressBar',
  './WizardStateMachine',
  './WizardHelper',
  './WizardStepTitle',
  './WizardButtonBar',
  './WizardContent'
],
function ($, _, BaseView, BaseForm, WizardProgressBar, WizardStateMachine, WizardHelper, WizardStepTitle,
          WizardButtonBar, WizardContent) {
  /*eslint max-params: 0 */

  function isAutoSaveForm(form) {
    return isForm(form) && form.getAttribute('autoSave');
  }

  function isForm(form) {
    return form instanceof BaseForm;
  }

  function submitForm(form) {
    var d = $.Deferred();
    form.listenToOnce(form, 'saved', _.bind(d.resolveWith, d, form));
    form.listenTo(form, 'error invalid', _.bind(d.rejectWith, d, form));
    form.$el.trigger('submit');
    return d.promise();
  }

  function validateForm(form) {
    form.clearErrors();
    var d = $.Deferred();
    form.isValid() ? d.resolveWith(form) : d.rejectWith(form);
    return d;
  }

  function clearForm(wizard) {
    var form = wizard.getCurrentView();
    if (isForm(form)) {
      form.model.trigger('form:cancel');
      wizard.wizardState.set('error', false);
    }
  }

  function getNext(view) {
    var next = _.isFunction(view.next) ? _.bind(view.next, view) : _.constant(true);
    if (isAutoSaveForm(view)) {
      return submitForm(view)
        .then(next);
    }
    else if (isForm(view)) {
      return validateForm(view)
        .then(next);
    }
    else {
      return next();
    }
  }

  return BaseView.extend({

    /**
     * @class Okta.Wizard
     * @extends {Okta.View}
     *
     * A wizard component
     *
     *
     * ```javascript
     * var Wizard = Okta.Wizard.extend({
     *   title: 'My Wizard',
     *   steps: [
     *     {
     *       title: 'Step 1',
     *       view: Okta.View.extend({
     *         // Define a next function to tell the wizard what to do before proceeding to the next step.
     *         // if no next method is defined, the wizard will just move to the next step.
     *         next: function () {
     *           return model.save(); // returns a promise
     *         }
     *       });
     *     },
     *     {
     *       substep: true,
     *       title: 'Step 1.1 (substep)',
     *       view: Okta.View.extend()
     *     },
     *     {
     *       title: 'Step 2',
     *       // Shorthand for forms - if autosave is true,
     *       // the wizard will automatically proceed to the next step on successful form save.
     *       form: {
     *         autoSave: true,
     *         inputs: [
     *            {
     *              type: 'text',
     *              name: 'some-input',
     *              label: 'Form Input'
     *            }
     *         ]
     *       }
     *     }
     *   ]
     * });
     * ```
     */

     /**
     * @event done
     * Fires when the last step "next" routine is complete
     */

     /**
     * @event cancel
     * Fires when the wizard is canceld
     */
     /**

    /**
     * Steps of the wizard
     *
     * ```javascript
     * var Wizard = Okta.Wizard.extend({
     *   steps: [
     *     {
     *       title: 'Step 1',
     *       view: Okta.View.extend({
     *         next: function () {
     *           return model.save(); // returns a promise
     *         }
     *       });
     *     },
     *     {
     *       substep: true,
     *       title: 'Step 1.1 (substep)',
     *       view: Okta.View.extend()
     *     },
     *     {
     *       title: 'Step 2',
     *       form: {
     *         autoSave: true,
     *         inputs: [
     *            {
     *              type: 'text',
     *              name: 'some-input',
     *              label: 'Form Input'
     *            }
     *         ]
     *       }
     *     }
     *   ]
     * });
     * ```
     *
     *  @type {Array|Function}
     */
    steps: [],

    /**
     * Title of the wizard. could be a string, a view or HTML
     * @type {String|Okta.View}
     */
    title: null,

    /**
     * The text for the save (done) button
     * @type {String|Function}
     */
    save: null,

    template: '\
      <h1 class="o-wizard-title"></h1>\
      <div class="o-wizard-progressbar-wrap">\
        <div class="o-wizard-progressbar-line"></div>\
      </div>\
      <div class="o-wizard-step-title"></div>\
      <div class="o-wizard-step-content"></div>\
      <div class="o-wizard-button-bar"></div>\
    ',

    getCurrentView: function () {
      return this.find(function (view) {
        return view instanceof WizardContent;
      }).first();
    },

    __goToNextStep: function () {
      var state = this.wizardState;
      return $.when(getNext(this.getCurrentView()))
        .then(_.bind(state.nextStep, state))
        .fail(function () {
          state.trigger('wizard:error');
          state.set('error', true);
        });
    },

    __goToPrevStep: function (state) {
      // mark the curent step as not done;
      clearForm(this);
      state.prevStep();
    },

    __init: function () {
      /* eslint max-statements: 0 */
      this.wizardState = this.options.wizardState = new WizardStateMachine(null, {
        steps: _.result(this, 'steps')
      });

      this.$el.addClass('o-wizard o-wizard-progressbar-steps-' + this.wizardState.getMajorSteps().length);

      this.options.save = _.result(this, 'save');

      WizardHelper.addIf(this, 'title', '.o-wizard-title');
      this.add(WizardProgressBar, '.o-wizard-progressbar-wrap');
      this.add(WizardStepTitle, '.o-wizard-step-title');
      this.add(WizardContent, '.o-wizard-step-content');
      this.add(WizardButtonBar, '.o-wizard-button-bar');

      this.listenTo(this.wizardState, 'wizard:prev', function () {
        this.__goToPrevStep(this.wizardState);
      });

      this.listenTo(this.wizardState, 'wizard:next', function () {
        this.__goToNextStep();
      });

      this.listenTo(this.wizardState, 'wizard:done', function () {
        this.done();
        this.trigger('done');
      });

      this.listenTo(this.wizardState, 'wizard:cancel', function () {
        clearForm(this);
        this.cancel();
        this.trigger('cancel');
      });

    },

    constructor: function () {
      this.initialize = _.wrap(this.initialize, _.bind(function (initialize, options) {
        this.__init();
        initialize.call(this, options);
      }, this));

      BaseView.apply(this, arguments);
    },

    /**
     * A callback to execute when the wizard is completed
     * @type {Function}
     */
    done: _.noop,

    /**
     * A callback to execute when the wizard is canceled
     * @type {Function}
     */
    cancel: _.noop

  });

});
