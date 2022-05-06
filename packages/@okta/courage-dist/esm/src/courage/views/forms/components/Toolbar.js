import oktaUnderscore from '../../../util/underscore-wrapper.js';
import BaseView from '../../BaseView.js';
import FormUtil from '../helpers/FormUtil.js';

const proto = {
  className: function () {
    return 'o-form-button-bar';
  },
  buttonOrder: ['previous', 'save', 'cancel'],
  initialize: function (options) {
    const buttonConfigs = {
      previous: {
        type: 'previous'
      },
      save: {
        type: 'save',
        text: oktaUnderscore.resultCtx(options, 'save', this),
        id: oktaUnderscore.resultCtx(options, 'saveId', this),
        className: oktaUnderscore.resultCtx(options, 'saveClassName', this)
      },
      cancel: {
        type: 'cancel',
        text: oktaUnderscore.resultCtx(options, 'cancel', this)
      }
    };

    this.__getButtonOrder(options).forEach(buttonName => {
      this.addButton(buttonConfigs[buttonName]);
    });
  },

  /**
   * Adds a buttomn to the toolbar
   * @param {Object} params button parameters
   * @param {Object} options {@link Okta.View#add} options
   */
  addButton: function (params, options) {
    return this.add(FormUtil.createButton(params), options);
  },
  __getButtonOrder: function (options) {
    const buttonOrder = oktaUnderscore.resultCtx(options, 'buttonOrder', this, this.buttonOrder);

    const buttonsToSkip = [];

    if (options.noSubmitButton) {
      buttonsToSkip.push('save');
    }

    if (options.noCancelButton) {
      buttonsToSkip.push('cancel');
    }

    if (!options.hasPrevStep) {
      buttonsToSkip.push('previous');
    }

    return oktaUnderscore.without(buttonOrder, ...buttonsToSkip);
  }
};
var Toolbar = BaseView.extend(proto);

export { Toolbar as default };
