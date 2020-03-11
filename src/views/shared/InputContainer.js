/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

define([
  'okta',
  'util/Logger'
], function (Okta, Logger) {

  const { InputContainer } = Okta.internal.views.forms.helpers;
  const { _, loc, tpl } = Okta;

  return InputContainer.extend({

    constructor: function () {
      /* eslint max-statements: [2, 18] */
      InputContainer.apply(this, arguments);

      const explainTop = this.options['explain-top'] && this.options['label-top'];
      const names = this._getNames();

      this.stopListening(this.model, 'form:field-error');
      this.listenTo(this.model, 'form:field-error', function (name, errors) {
        if (_.contains(names, name)) {
          this.__setError(errors, explainTop);
        }
      });

      const clearErrorsChangeEventName = 'form:clear-errors change:' + names.join(' change:');
      this.stopListening(this.model, clearErrorsChangeEventName);
      this.listenTo(this.model, clearErrorsChangeEventName, this.__clearError);

      const clearErrorEventName = 'form:clear-error:' + names.join(' form:clear-error:');
      this.stopListening(this.model, clearErrorEventName);
      this.listenTo(this.model, clearErrorEventName, this.__clearError);
    },

    _getNames: function () {
      const names = _.isArray(this.options.name) ? this.options.name : [this.options.name];
      /*eslint complexity: 0 */

      if (this.options.type === 'group') {
        names.push.apply(names, _.pluck(this.options.input[0].options.params.inputs, 'name'));
      } else if (_.isArray(this.options.name)) {
        if (this.options.input && this.options.input.options && this.options.input.options.name) {
          names.push(this.options.input.options.name);
        }
      } else if (this.options.input) {
        if (_.isArray(this.options.input)) {
          _.each(this.options.input, function (inputItem) {
            names.push(inputItem.options.name);
          });
        } else {
          names.push(this.options.input.options.name);
        }
      }
      return _.uniq(_.compact(names));
    },

    /**
     * Highlight the input as invalid (validation failed)
     * Adds an explaination message of the error
     * @private
     */
    __setError: function (errors, explainTop) {
      this.__errorState = true;
      this.$el.addClass('o-form-has-errors');

      const errorId = _.uniqueId('input-container-error');
      const tmpl = [
        '<p id="{{errorId}}" class="okta-form-input-error o-form-input-error o-form-explain">',
        '<span class="icon icon-16 error-16-small" role="img" aria-label="{{iconLabel}}" aria-hidden="true"></span>',
        '{{text}}',
        '</p>',
      ].join('');

      const iconLabel = loc('oform.error.icon.ariaLabel', 'courage'); // 'Error'
      const html = tpl(tmpl)({
        errorId: errorId,
        iconLabel: iconLabel,
        text: errors.join(', ')
      });

      const $elExplain = this.$('.o-form-explain')
        .not('.o-form-input-error')
        .first();

      if ($elExplain.length && !explainTop) {
        $elExplain.before(html);
      } else {
        this.$el.append(html);
      }

      this.__setInputAttribute('aria-describedby', errorId);
    },

    /**
     * Un-highlight the input and remove explaination text
     * @private
     */
    __clearError: function () {
      if (this.__errorState) {
        this.$('.o-form-input-error').remove();
        this.__setInputAttribute('aria-describedby', null);
        this.$el.removeClass('o-form-has-errors');
        this.__errorState = false;
        _.defer(() => {
          this.model.trigger('form:resize');
        });
      }
    },

    /**
     * Add/remove attribute from dom input element
     * @private
     * @param {string} attribute - name of attribute
     * @param {string|null} value - value of attribute
     */
    __setInputAttribute: function (attribute, value) {
      const { name } = this.options;
      const names = Array.isArray(name) ? name : [name];
      names.forEach(name => {
        let inputEl;
        try {
          inputEl = this.$(`[name=${name}]`);
        } catch (e) {
          Logger.error('Invalid input selector', e);
          return;
        }

        if (!inputEl.get(0)) {
          Logger.warn('Failed to find input element by name', name);
        } else {
          inputEl.attr(attribute, value);
        }
      });
    },

  });
});
