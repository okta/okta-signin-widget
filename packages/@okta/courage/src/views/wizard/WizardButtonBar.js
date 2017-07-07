define([
  'shared/views/BaseView',
  'shared/util/ButtonFactory',
  'shared/util/StringUtil'
],
function (BaseView, ButtonFactory, StringUtil) {


  return BaseView.extend({

    initialize: function () {
      var state = this.options.wizardState;

      this.add(ButtonFactory.create({
        className: 'back',
        title: StringUtil.localize('wizard.button.previous'),
        click: function () {
          state.trigger('wizard:prev');
        },
        postRender: function () {
          this.toggle(state.hasPrevStep() && !this.options.wizardState.get('done'));
        },
        wizardStateEvents: {
          'wizard:next wizard:prev wizard:done': 'disable',
          'wizard:error change:step change:error': 'render'
        },
        attributes: {
          'style': 'min-width: 100px'
        }
      }));

      this.add(ButtonFactory.create({
        className: 'cancel',
        title: StringUtil.localize('wizard.button.cancel'),
        click: function () {
          state.trigger('wizard:cancel');
        },
        postRender: function () {
          this.toggle(!this.options.wizardState.get('done'));
        },
        wizardStateEvents: {
          'wizard:error change:step change:error': 'render',
          'wizard:next wizard:prev wizard:done': 'disable'
        },
        attributes: {
          'style': 'min-width: 100px'
        }
      }));

      this.add(ButtonFactory.create({
        title: function () {
          return state.hasNextStep() ? StringUtil.localize('wizard.button.next') :
                 this.options.save || StringUtil.localize('wizard.button.done');
        },
        className: 'button-primary button next',
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
        },
        attributes: {
          'style': 'min-width: 100px; float: right'
        }
      }));

    }
  });

});
