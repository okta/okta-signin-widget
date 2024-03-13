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

import { _, View, loc } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import FactorUtil from 'util/FactorUtil';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import StoreLinks from 'v1/util/StoreLinks';
import Footer from 'v1/views/enroll-factors/Footer';
const showWhenDeviceTypeSelected = {
  __deviceType__: function(val) {
    return val !== undefined;
  },
};
const EnrollTotpControllerAppDownloadInstructionsView = View.extend({
  attributes: { 'data-se': 'app-download-instructions' },
  className: 'app-download-instructions',
  template: hbs(
    '\
      <span class="app-logo {{appIcon}}"></span>\
      <p class="instructions">{{{appStoreLinkText}}}</p>\
    '
  ),
  initialize: function() {
    this.listenTo(this.model, 'change:__deviceType__', this.render);
  },
  postRender: function() {
    const link  = this.$el.find('.instructions a');
    if (link.length) {
      link[0].setAttribute('target', '_blank');
      link[0].setAttribute('rel', 'noreferer noopener');
    }
  },
  getTemplateData: function() {
    let appStoreLink;
    let appIcon;
    let appStoreName;
    const factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));

    appStoreName = StoreLinks.STORE[this.model.get('__deviceType__')];
    if (this.model.get('__provider__') === 'GOOGLE') {
      appStoreLink = StoreLinks.GOOGLE[this.model.get('__deviceType__')];
      appIcon = 'google-auth-38';
    } else {
      appStoreLink = StoreLinks.OKTA[this.model.get('__deviceType__')];
      appIcon = 'okta-verify-download-icon';
    }
    const appStoreLinkText = appStoreName
      ? loc('enroll.totp.downloadApp', 'login', [appStoreLink, factorName, appStoreName])
      : null;
    return {
      appStoreLinkText: appStoreLinkText,
      appIcon: appIcon,
    };
  },
});
const EnrollTotpControllerEnrollTotpController = FormController.extend({
  className: 'enroll-totp',
  Model: function() {
    return {
      local: {
        __deviceType__: 'string',
        __factorType__: ['string', false, this.options.factorType],
        __provider__: ['string', false, this.options.provider],
      },
      save: function() {
        return this.doTransaction(function(transaction) {
          const factor = _.findWhere(transaction.factors, {
            factorType: this.get('__factorType__'),
            provider: this.get('__provider__'),
          });

          return factor.enroll();
        });
      },
    };
  },

  Form: {
    title: function() {
      const factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));

      return loc('enroll.totp.title', 'login', [factorName]);
    },
    noButtonBar: true,
    attributes: { 'data-se': 'step-device-type' },

    formChildren: function() {
      const inputOptions = {
        APPLE: loc('iphone', 'login'),
        ANDROID: loc('android', 'login'),
      };
      const children = [
        FormType.Input({
          name: '__deviceType__',
          type: 'radio',
          options: inputOptions,
          group: true,
          label: _.partial(loc, 'enroll.totp.selectDevice', 'login'),
        }),
        FormType.Divider({ showWhen: showWhenDeviceTypeSelected }),
        FormType.View({
          View: EnrollTotpControllerAppDownloadInstructionsView,
          showWhen: showWhenDeviceTypeSelected,
        }),
        FormType.Button({
          title: loc('oform.next', 'login'),
          attributes: {
            'data-type': 'save'
          },
          className: 'button button-primary default-custom-button',
          click: function() {
            this.model.save();
          },
          showWhen: showWhenDeviceTypeSelected,
        }),
      ];

      return children;
    },
  },

  Footer: Footer,
});
export default EnrollTotpControllerEnrollTotpController;
