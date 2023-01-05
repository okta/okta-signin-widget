/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _, Form, Controller } from '@okta/courage';
import Q from 'q';

function getForm(controller) {
  return _.find(controller.getChildren(), function(item) {
    return item instanceof Form;
  });
}

export default Controller.extend({
  // Ideally we should be attaching the listeners in the constructor, but because of the way
  // we construct the FormController (this.model is generated after the BaseLoginController's
  // constructor is called), this.model is undefined in when try to attach the events and
  // therefore we don't listen to events for such forms. And changing the order in which we call
  // the constructor doesn't help either (JS errors etc.). This at least guarantees that we
  // are listening to the model events.
  // Note - Figure out a way to call the constructor in the right order.
  addListeners: function() {
    // Events to enable/disable the primary button on the forms
    this.listenTo(this.model, 'save', function() {
      const form = getForm(this);
      //disable the submit button on forms while making the request
      //to prevent users from hitting rate limiting exceptions of
      //1 per second on the auth api

      const disableSubmitButton = form.disableSubmitButton;

      if (disableSubmitButton && !form.disableSubmitButton()) {
        return;
      }
      this.toggleButtonState(true);
    });

    this.listenTo(this.model, 'error', function() {
      this.toggleButtonState(false);
    });

    this.addModelListeners(this.model);
  },

  addModelListeners: function(model) {
    const setTransactionHandler = transaction => {
      this.options.appState.set('transaction', transaction);
    };

    const transactionErrorHandler = err => {
      this.options.appState.set('transactionError', err);
    };

    // Events to set the transaction attributes on the app state.
    this.listenTo(model, 'setTransaction', setTransactionHandler);
    this.listenTo(model, 'setTransactionError', transactionErrorHandler);

    // For TOTP factor model
    // TOTP model is special, its model will not be attached to a controller, but will
    // tag along with the push factor model. We need to listen to the transaction
    // changes on this as well (in case of the push+totp form).
    const totpModel = model.get('backupFactor');

    if (totpModel) {
      this.listenTo(totpModel, 'setTransaction', setTransactionHandler);
      this.listenTo(totpModel, 'setTransactionError', transactionErrorHandler);
    }
  },

  // Override this method to delay switching to this screen until return
  // promise is resolved. This is useful for cases like enrolling a security
  // question, which requires an additional request to fetch the question
  // list.
  fetchInitialData: function() {
    return Q();
  },

  // Override this method to prevent route navigation. This is useful for
  // intermediate status changes that do not trigger a full refresh of the
  // page, like MFA_ENROLL_ACTIVATE and MFA_CHALLENGE.
  trapAuthResponse: function() {
    return false;
  },

  toJSON: function() {
    const data = Controller.prototype.toJSON.apply(this, arguments);

    return _.extend(_.pick(this.options, 'appState'), data);
  },

  toggleButtonState: function(state) {
    const button = this.$el.find('.button');

    button.toggleClass('link-button-disabled', state).prop('disabled', state);
  },

  postRenderAnimation: function() {
    // Event triggered after a page is rendered along with the classname to identify the page
    // TODO: Deprecate this event in the next major version in favor of 'afterRender'
    this.trigger('pageRendered', { page: this.className });

    this.trigger('afterRender', { controller: this.className });
  },
});
