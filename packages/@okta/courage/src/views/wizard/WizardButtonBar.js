define([
  'okta/underscore',
  'shared/views/BaseView',
  'shared/util/ButtonFactory',
  'shared/util/StringUtil'
],
function (_, BaseView, ButtonFactory, StringUtil) {


  return BaseView.extend({

    className: 'o-wizard-button-bar-wrap',

    template: '<div class="o-wizard-button-bar"></div>',

    initialize: function () {
      var state = this.options.wizardState;

      this.add(ButtonFactory.create({
        className: 'back',
        type: 'back',
        title: StringUtil.localize('wizard.button.previous', 'courage'),
        click: function () {
          state.trigger('wizard:prev');
        },
        postRender: function () {
          this.toggle(state.hasPrevStep() && !this.options.wizardState.get('done'));
        },
        wizardStateEvents: {
          'wizard:next wizard:prev wizard:done': 'disable',
          'wizard:error change:step change:error': 'render'
        }
      }), '.o-wizard-button-bar');

      this.add(ButtonFactory.create({
        className: 'cancel',
        type: 'cancel',
        title: StringUtil.localize('wizard.button.cancel', 'courage'),
        click: function () {
          state.trigger('wizard:cancel');
        },
        postRender: function () {
          this.toggle(!this.options.wizardState.get('done'));
        },
        wizardStateEvents: {
          'wizard:error change:step change:error': 'render',
          'wizard:next wizard:prev wizard:done': 'disable'
        }
      }), '.o-wizard-button-bar');

      this.add(ButtonFactory.create({
        title: function () {
          return state.hasNextStep() ? StringUtil.localize('wizard.button.next', 'courage') :
                 this.options.save || StringUtil.localize('wizard.button.done', 'courage');
        },
        className: 'button-primary button next',
        type: 'next',
        click: function () {
          state.trigger('wizard:next');
        },
        postRender: function () {
          this.toggle(!this.options.wizardState.get('done'));
        },
        wizardStateEvents: {
          'wizard:error change:step change:error': 'render',
          'wizard:next wizard:prev wizard:done': 'disable'
        },
        modelEvents: {
          'invalid error': 'enable'
        }
      }), '.o-wizard-button-bar');

      _.each(['back', 'cancel', 'next'], function (name) {
        _.each(['disable', 'enable'], function (action) {
          this.listenTo(state, name + ':' + action, function () {
            this.findWhere({type: name})[action]();
          });
        }, this);
      }, this);

    }
  });

});
