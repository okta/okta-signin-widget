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

define([
  'okta',
  './FormType',
  'shared/views/forms/components/Toolbar',
  'shared/views/forms/helpers/FormUtil',
  './BaseLoginController'
],
function (Okta, FormType, Toolbar, FormUtil, BaseLoginController) {

  var _ = Okta._;

  var SimpleForm = Okta.Form.extend({
    layout: 'o-form-theme',
    noCancelButton: true,
    constructor: function (options) {
      Okta.Form.call(this, options);
      _.each(_.result(this, 'formChildren') || [], function (child) {
        switch (child.type) {
        case FormType.INPUT:
          this.addInput(_.extend({
            label: false,
            'label-top': true
          }, child.viewOptions));
          break;
        case FormType.BUTTON:
          this.add(Okta.createButton(_.extend({ model: this.model }, child.viewOptions)), child.addOptions);
          FormUtil.applyShowWhen(this.last(), child.viewOptions && child.viewOptions.showWhen);
          break;
        case FormType.DIVIDER:
          this.addDivider(child.viewOptions);
          break;
        case FormType.TOOLBAR:
          this.add(Toolbar, { options: child.viewOptions });
          FormUtil.applyShowWhen(this.last(), child.viewOptions && child.viewOptions.showWhen);
          break;
        case FormType.VIEW:
          this.add(child.viewOptions.View);
          FormUtil.applyShowWhen(this.last(), child.viewOptions.showWhen);
          break;
        default:
          throw new Error('Unrecognized child type: ' + child.type);
        }
      }, this);
    }
  });

  return BaseLoginController.extend({

    constructor: function () {
      var initialize = this.initialize;
      this.initialize = function () {};

      BaseLoginController.apply(this, arguments);

      if (this.Model && this.Form) {
        var Model = Okta.Model.extend(_.extend({
          parse: function (options) {
            this.settings = options.settings;
            return _.omit(options, 'settings');
          }
        }, _.result(this, 'Model')));
        this.model = new Model({ settings: this.settings }, { parse: true });
        var Form = SimpleForm.extend(_.result(this, 'Form', this));
        this.form = new Form(this.toJSON());
        this.add(this.form);
      }

      if (this.Footer) {
        this.footer = new this.Footer(this.toJSON());
        this.add(this.footer);
      }

      initialize.apply(this, arguments);
    },

    toJSON: function () {
      var data = BaseLoginController.prototype.toJSON.apply(this, arguments);
      return _.extend(_.pick(this.options, 'appState'), data);
    },

    back: function () {
      if (this.footer && this.footer.back) {
        this.footer.back();
      }
    }
  });
});
