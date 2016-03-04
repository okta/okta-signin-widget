/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*jshint newcap:false */
define(['okta', 'vendor/lib/q'], function (Okta, Q) {
  var _ = Okta._;

  function getForm(controller) {
    return _.find(controller.getChildren(), function (item) {
      return (item instanceof Okta.Form);
    });
  }

  return Okta.Controller.extend({

    // Ideally we should be attaching the listeners in the constructor, but because of the way
    // we construct the FormController (this.model is generated after the BaseLoginController's
    // constructor is called), this.model is undefined in when try to attach the events and
    // therefore we don't listen to events for such forms. And changing the order in which we call
    // the constructor doesn't help either (JS errors etc.). This at least guarantees that we
    // are listening to the model events.
    // Note - Figure out a way to call the constructor in the right order.
    addListeners: function () {
      // Events to enable/disable the primary button on the forms
      this.listenTo(this.model, 'save', function () {
        //disable the submit button on forms while making the request
        //to prevent users from hitting rate limiting exceptions of
        //1 per second on the auth api
        var form = getForm(this);
        var disableSubmitButton = form.disableSubmitButton;
        if (disableSubmitButton && !form.disableSubmitButton()) {
          return;
        }
        this.toggleButtonState(true);
      });
      this.listenTo(this.model, 'error', function () {
        this.toggleButtonState(false);
      });

      // Events to set the transaction attributes on the app state.
      this.listenTo(this.model, 'setTransaction', function (transaction) {
        this.options.appState.set('transaction', transaction);
      });
      this.listenTo(this.model, 'setTransactionError', function (err) {
        this.options.appState.set('transactionError', err);
      });
    },

    // Override this method to delay switching to thies screen until return
    // promise is resolved. This is useful for cases like enrolling a security
    // question, which requires an additional request to fetch the question
    // list.
    fetchInitialData: function () {
      return Q();
    },

    // Override this method to prevent route navigation. This is useful for
    // intermediate status changes that do not trigger a full refresh of the
    // page, like MFA_ENROLL_ACTIVATE and MFA_CHALLENGE.
    trapAuthResponse: function () {
      return false;
    },

    toJSON: function () {
      var data = Okta.Controller.prototype.toJSON.apply(this, arguments);
      return _.extend(_.pick(this.options, 'appState'), data);
    },

    toggleButtonState: function (state) {
      var button = this.$el.find('.button');
      button.toggleClass('link-button-disabled', state);
    }

  });

});
