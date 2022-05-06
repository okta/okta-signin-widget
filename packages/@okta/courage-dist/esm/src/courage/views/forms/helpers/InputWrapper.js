import oktaUnderscore from '../../../util/underscore-wrapper.js';
import BaseView from '../../BaseView.js';
import FormUtil from './FormUtil.js';

function runCallback(callback, field) {
  callback.apply(this, oktaUnderscore.map(field.split(/\s+/), function (field) {
    return this.model.get(field);
  }, this));
}

function runIf(fn, ctx) {
  if (oktaUnderscore.isFunction(fn)) {
    fn.call(ctx);
  }
}
/**
 * @class InputWrapper
 * @extends Okta.View
 * @private
 * The outer wrapper that warps the label and the input container
 */


var InputWrapper = BaseView.extend({
  tagName: function () {
    if (this.options.group) {
      return 'fieldset';
    }

    return 'div';
  },
  className: function () {
    let className = 'o-form-fieldset';

    if (this.options['label-top']) {
      className += ' o-form-label-top';
    }

    if (this.options.readOnly) {
      className += ' o-form-read-mode';
    }

    return className;
  },
  attributes: function () {
    return {
      'data-se': this.options['data-se'] || 'o-form-fieldset'
    };
  },

  /**
   * @constructor
   * @param  {Object} options options hash
   * @param  {Object} [options.events]
   * @param  {Object} [options.bindings]
   * @param  {Object} [options.showWhen]
   * @param  {Function} [options.initialize] post initialize callback
   * @param  {Function} [options.render] post render callback
   */
  constructor: function (options) {
    if (options.className) {
      this.inputWrapperClassName = this.className;
      this.optionsClassName = options.className;

      options.className = function () {
        return oktaUnderscore.result(this, 'inputWrapperClassName', '') + ' ' + oktaUnderscore.result(this, 'optionsClassName');
      };
    }

    BaseView.apply(this, arguments);

    oktaUnderscore.each(options.events || {}, function (callback, event) {
      this.listenTo(this.model, event, callback);
    }, this);

    oktaUnderscore.each(options.bindings || {}, function (callback, field) {
      this.listenTo(this.model, FormUtil.changeEventString(field.split(/\s+/)), oktaUnderscore.bind(runCallback, this, callback, field));
    }, this);

    FormUtil.applyShowWhen(this, options.showWhen);
    FormUtil.applyToggleWhen(this, options.toggleWhen);
    runIf(options.initialize, this);
  },
  postRender: function () {
    oktaUnderscore.each(this.options.bindings || {}, runCallback, this);

    runIf(this.options.render, this);
  },

  /**
   * @return {InputLabel}
   */
  getLabel: function () {
    return this.size() > 1 ? this.at(0) : null;
  },

  /**
   * @deprecated ambiguous naming, use {@link #getInputContainer}
   */
  getInput: function () {
    return this.getInputContainer();
  },

  /**
   * @return {InputContainer}
   */
  getInputContainer: function () {
    return this.at(this.size() > 1 ? 1 : 0);
  },

  /**
   * @return {BaseInput[]}
   */
  getInputs: function () {
    return this.getInputContainer().toArray();
  },
  focus: function () {
    return this.getInput().focus();
  }
});

export { InputWrapper as default };
