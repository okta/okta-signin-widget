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
  'views/shared/InputContainer'
], function (Okta, InputContainer) {

  var { FormUtil, InputLabel, InputWrapper, InputFactory } = Okta.internal.views.forms.helpers;
  const { _ } = Okta;

  return Okta.Form.extend({

    // The actual override function is _createContainer
    // bring in the public method to make sure SIW will not be affected by private method change in courage
    // Ideally Class should be able to injected in options to avoid unneccessary override
    addInput: function (_options) {
      _options = _.clone(_options);

      FormUtil.validateInput(_options, this.model);

      const inputsOptions = FormUtil.generateInputOptions(_options, this, this.__createInput).reverse();

      // We need a local variable here to keep track
      // as addInput can be called either directy or through the inputs array.
      if (_.isEmpty(this.getInputs().toArray())) {
        _.extend(inputsOptions[0], { validateOnlyIfDirty: true });
      }

      const inputs = _.map(inputsOptions, this.__createInput, this);

      _.each(
        inputsOptions,
        function (input) {
          if (input.errorField) {
            this.__errorFields[input.errorField] = input.name;
          }
        },
        this
      );

      const options = {
        inputId: _.last(inputs).options.inputId,
        input: inputs,
        multi: inputsOptions.length > 1 ? inputsOptions.length : undefined
      };

      _.extend(options, _.omit(this.options, 'input'), _.omit(_options, 'input'));

      const inputWrapper = this.__createWrapper(options);

      if (options.label !== false) {
        inputWrapper.add(this.__createLabel(options));
      }
      inputWrapper.add(this._createContainer(options));
      inputWrapper.type = options.type || options.input.type || 'custom';

      const args = [inputWrapper].concat(_.rest(arguments));

      return this.add.apply(this, args);
    },

    /**
     * @private
     */
    __createInput: function (options) {
      options = _.pick(options, FormUtil.INPUT_OPTIONS);
      return InputFactory.create(options);
    },

    /**
     * @private
     */
    __createWrapper: function (options) {
      options = _.pick(options, FormUtil.WRAPPER_OPTIONS);
      return new InputWrapper(options);
    },

    /**
     * @private
     */
    __createLabel: function (options) {
      options = _.pick(options, FormUtil.LABEL_OPTIONS);
      return new InputLabel(options);
    },

    /**
     * @private
     */
    _createContainer: function (options) {
      options = _.pick(options, FormUtil.CONTAINER_OPTIONS);
      return new InputContainer(options);
    },

  });
});
