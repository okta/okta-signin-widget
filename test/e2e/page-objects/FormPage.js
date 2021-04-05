/*!
 * Copyright (c) 2015-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const EC = protractor.ExpectedConditions;

/**
 * Helper functions to compose css selectors
 */

function dataSe(val) {
  return '[data-se="' + val + '"]';
}

function dataType(val) {
  return '[data-type="' + val + '"]';
}

function inputWrap(field) {
  return dataSe('o-form-input-' + field);
}

/**
 * Abstract class that contains helper methods to work with FormController
 */
class FormPage {

  /**
   * Abstract methods
   */

  getFormClass() {
    throw new Error('Class name not defined!');
  }

  /**
   * Concrete selectors/methods that are shared by all forms
   */

  submitButton() {
    return this.$(dataType('save'));
  }

  submit() {
    return this.submitButton().click();
  }

  getCspErrorsMessage() {
    var cspErrorsEl = $('#csp-errors');
    browser.wait(EC.presenceOf(cspErrorsEl));
    return cspErrorsEl.getText();
  }

  getErrorMessage() {
    const errorEl = this.$('.okta-form-infobox-error.infobox.infobox-error p');
    browser.wait(EC.presenceOf(errorEl));
    return errorEl.getText();
  }

  /**
   * Generic helper functions that can be used to construct form specific
   * methods.
   */

  input(field) {
    return this.$(inputWrap(field) + ' input');
  }

  inputWrap(field) {
    return this.$(inputWrap(field));
  }

  $(selector) {
    return $('.' + this.getFormClass() + ' ' + selector);
  }

  $dataSe(val) {
    return this.$(dataSe(val));
  }

}

module.exports = FormPage;
