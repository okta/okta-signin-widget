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

/* jshint maxcomplexity: 8 */
define([
  'okta',
  'vendor/lib/q',
  'util/FactorUtil',
  'views/mfa-verify/dropdown/FactorsDropDown',
  'models/Factor'
],
function (Okta, Q, FactorUtil, FactorsDropDown, Factor) {

  var _ = Okta._;

  return Okta.View.extend({

    template: '\
      <div class="beacon-blank auth-beacon">\
        <div class="beacon-blank js-blank-beacon-border auth-beacon-border"></div>\
      </div>\
      <div class="bg-helper auth-beacon auth-beacon-factor {{className}}" data-se="factor-beacon">\
        <div class="okta-sign-in-beacon-border auth-beacon-border"></div>\
      </div>\
      <div data-type="factor-types-dropdown" class="factors-dropdown-wrap"></div>\
    ',

    events: {
      'click .auth-beacon-factor': function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.$('.dropdown .options').toggle();
      }
    },

    getTemplateData: function () {
      var factors = this.options.appState.get('factors'),
          factor, className;
      if (factors) {
        factor = factors.findWhere(_.pick(this.options, 'provider', 'factorType'));
      } else  {
        factor = new Factor.Model(this.options.appState.get('factor'));
      }
      className = factor.get('iconClassName');
      return { className: className || '' };
    },

    postRender: function () {
      if (this.options.animate) {
        this.$('.auth-beacon-factor').fadeIn(200);
      }
      var appState = this.options.appState;
      if (appState.get('hasMfaRequiredOptions')) {
        this.add(FactorsDropDown, '[data-type="factor-types-dropdown"]');
      }
    },

    fadeOut: function () {
      var deferred = Q.defer();
      this.$('.auth-beacon-factor').fadeOut(200, function () {
        deferred.resolve();
      });
      return deferred.promise;
    },

    equals: function (Beacon, options) {
      return Beacon &&
        this instanceof Beacon &&
        options.provider === this.options.provider &&
        (options.factorType === this.options.factorType ||
          (FactorUtil.isOktaVerify(options.provider, options.factorType) &&
          FactorUtil.isOktaVerify(this.options.provider, this.options.factorType)));
    }

  });

});
