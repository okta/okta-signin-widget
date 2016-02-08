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
  './FactorsDropDownOptions',
  'shared/views/components/BaseDropDown'
],
function (Okta, FactorsDropDownOptions, BaseDropDown) {
  var _ = Okta._;
  var $ = Okta.$;

  $(document).click(function (e) {
    var $target = $(e.target);
    var isDropdown = $target.closest('.option-selected').length > 0 && $target.closest('.dropdown').length > 0;
    if (!isDropdown) {
      $('.dropdown .options').hide();
    }
  });

  return BaseDropDown.extend({
    className: 'bg-helper icon-button',
    events: {
      'click a.option-selected': function (e) {
        e.preventDefault();
        if (_.result(this, 'disabled')) {
          e.stopPropagation();
        } else {
          this.$('.options').toggle();
        }
      },
      'click .dropdown-disabled': function (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    initialize: function () {
      this.addOption(FactorsDropDownOptions.getDropdownOption('TITLE'));
      this.options.appState.get('factors').each(function (factor) {
        this.addOption(FactorsDropDownOptions.getDropdownOption(factor.get('factorName')), {model: factor});
        this.listenTo(this.last(), 'options:toggle', function () {
          this.$('.options').hide();
        });
      }, this);
    }
  });

});
