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
  'util/RouterUtil'
], function (Okta, RouterUtil) {

  var _ = Okta._;

  var FactorRow = Okta.View.extend({
    className: 'enroll-factor-row clearfix',

    template: '\
      <div class="enroll-factor-icon-container">\
        <div class="factor-icon enroll-factor-icon {{iconClassName}}">\
        </div>\
      </div>\
      <div class="enroll-factor-description">\
        <h3 class="enroll-factor-label">{{factorLabel}}</h3>\
        {{#if factorDescription}}\
          <p>{{factorDescription}}</p>\
        {{/if}}\
        <div class="enroll-factor-button"></div>\
      </div>\
    ',

    attributes: function () {
      return { 'data-se': this.model.get('factorName') };
    },

    children: function () {
      if (this.model.get('enrolled')) {
        return [['<span class="icon success-16-green"></span>', '.enroll-factor-label']];
      }
      return [[Okta.createButton({
        className: 'button',
        title: Okta.loc('enroll.choices.setup', 'login'),
        click: function () {
          this.options.appState.trigger('navigate', RouterUtil.createEnrollFactorUrl(
            this.model.get('provider'),
            this.model.get('factorType')
          ));
        }
      }), '.enroll-factor-button']];
    },

    minimize: function () {
      this.$el.addClass('enroll-factor-row-min');
    },

    maximize: function () {
      this.$el.removeClass('enroll-factor-row-min');
    }
  });

  return Okta.ListView.extend({

    className: 'enroll-factor-list',

    item: FactorRow,

    itemSelector: '.list-content',

    template: '\
      {{#if listSubtitle}}\
        <div class="list-subtitle">{{listSubtitle}}</div>\
      {{/if}}\
      {{#if listTitle}}\
        <div class="list-title">{{listTitle}}</div>\
      {{/if}}\
      <div class="list-content"></div>\
    ',

    getTemplateData: function () {
      var json = Okta.ListView.prototype.getTemplateData.call(this);
      _.extend(json, this);
      return json;
    },

    postRender: function () {
      if (this.options.minimize) {
        this.invoke('minimize');
      }
    }

  });

});
