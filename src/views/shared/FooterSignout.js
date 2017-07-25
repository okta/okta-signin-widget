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

define(['okta', 'util/Enums', 'shared/util/Util'], function (Okta, Enums, Util) {

  var _ = Okta._;

  return Okta.View.extend({
    template: '\
      <a href="#" class="link {{linkClassName}}" data-se="signout-link">\
        {{linkText}}\
      </a>\
    ',
    className: 'auth-footer clearfix',
    events: {
      'click a' : function (e) {
        e.preventDefault();
        var self = this;
        this.model.doTransaction(function(transaction) {
          return transaction.cancel();
        })
        .then(function() {
          if (self.settings.get('signOutLink')) {
            Util.redirect(self.settings.get('signOutLink'));
          } else {
            self.state.set('navigateDir', Enums.DIRECTION_BACK);
            self.options.appState.trigger('navigate', '');
          }
        });
      }
    },
    getTemplateData: function () {
      return {
        linkClassName: _.isUndefined(this.options.linkClassName) ? 'goto' : this.options.linkClassName,
        linkText: this.options.linkText || Okta.loc('signout', 'login')
      };
    }
  });

});
