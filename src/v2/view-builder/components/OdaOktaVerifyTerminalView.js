import { View, loc, internal } from 'okta';
import hbs from 'handlebars-inline-precompile';
import Enums from 'util/Enums';

const { Notification } = internal.views.components;
const { Clipboard } = internal.util;

const getDeviceEnrollmentContext = (deviceEnrollment) => {
  const platform = (deviceEnrollment.platform || '').toLowerCase();
  const isIOS = platform === Enums.IOS;
  const withAccount = false;
  const isAndroidAppLinkWithAccount = platform === Enums.ANDROID && withAccount;
  const isAndroidAppLinkWithoutAccount = platform === Enums.ANDROID && !withAccount;
  const isAndroidLoopback = platform === Enums.ANDROID 
      && !isAndroidAppLinkWithAccount && !isAndroidAppLinkWithoutAccount;
  return {
    signInUrl: deviceEnrollment.signInUrl,
  isIOS,
    isAndroidLoopback,
    isAndroidAppLinkWithAccount,
    isAndroidAppLinkWithoutAccount,
    appStoreLink: isIOS ? Enums.OKTA_VERIFY_APPLE_APP_STORE_URL : null,
    orgName: deviceEnrollment.orgName
  };
};

const BaseOdaOktaVerifyTerminalView = View.extend({
  getTemplateData() {
    const deviceEnrollment = this.options.appState.get('deviceEnrollment');
    return getDeviceEnrollmentContext(deviceEnrollment);
  },

  postRender: function() {
    // Attach each button to the respective 'data-clipboard-text'
    Clipboard.attach('.copy-clipboard-button').done(() => {
      let notification = new Notification({
        message: loc('enroll.mdm.copyLink.success', 'login'),
        level: 'success',
      });
      this.el.prepend(notification.render().el);
      return false;
    });
    Clipboard.attach('.copy-org-clipboard-button').done(() => {
      let notification = new Notification({
        message: loc('enroll.oda.org.copyLink.success', 'login'),
        level: 'success',
      });
      this.el.prepend(notification.render().el);
      return false;
    });
  },
});

const IosAndAndroidLoopbackOdaTerminalView =  BaseOdaOktaVerifyTerminalView.extend({
  template: hbs`
    <p class="explanation">
      {{i18n code="enroll.explanation.p1" bundle="login"}}
    </p>
    <ol>
      {{#if isIOS}}
      <li>
        {{i18n code="enroll.mdm.step1" bundle="login"}}
        <a data-clipboard-text="{{appStoreLink}}" class="button link-button copy-clipboard-button">
          {{i18n code="enroll.mdm.copyLink" bundle="login"}}
        </a>
      </li>
      <li>{{i18n code="enroll.mdm.step2" bundle="login"}}</li>
      <li>{{i18n code="enroll.oda.step3" bundle="login"}}</li>
      {{/if}}
      {{#if isAndroidLoopback}}
      <li>{{i18n code="enroll.oda.android.step1" bundle="login"}}</li>
      {{/if}}
      <li>{{i18n code="enroll.oda.step1" bundle="login"}}</li>
      <li>
        {{i18n code="enroll.oda.step2" bundle="login"}}
        <p class="org-signin-link">
          <span class="no-translate">
          {{signInUrl}}
          </span>
        </p>
        <a data-clipboard-text="{{signInUrl}}" class="button link-button copy-org-clipboard-button">
          {{i18n code="enroll.oda.org.copyLink" bundle="login"}}
        </a>
      </li>
      <li>{{i18n code="enroll.oda.step6" bundle="login"}}</li>
    </ol>
  `,
});

const AndroidAppLinkOdaTerminalView =  BaseOdaOktaVerifyTerminalView.extend({
  template: hbs`
    {{#if isAndroidAppLinkWithAccount}}
      <p class="explanation">
      {{i18n code="enroll.oda.with.account.explanation" bundle="login"}}
      </p>
      <p class="subtitle">
      {{i18n code="enroll.oda.with.account.subtitile1 " bundle="login"}}
      </p>
      <ul>
        <li>{{i18n code="enroll.oda.with.account.step1" bundle="login"}}</li>
        <li>{{i18n code="enroll.oda.with.account.step2" bundle="login"}}</li>
        <li>{{i18n code="enroll.oda.with.account.step3" bundle="login"}}</li>
      </ul>
      <p class="subtitle">
      {{i18n code="enroll.oda.with.account.subtitile2 " bundle="login"}}
      </p>
      <ol>
        <li>{{i18n code="enroll.oda.with.account.step4" bundle="login"}}</li>
        <li>{{i18n code="enroll.oda.with.account.step5" bundle="login" arguments="orgName"}}</li>
        <li>{{i18n code="enroll.oda.with.account.step6" bundle="login"}}</li>
        <li>{{i18n code="enroll.oda.with.account.step7" bundle="login"}}</li>
      </ol>
    {{/if}}

    {{#if isAndroidAppLinkWithoutAccount}}
      <p class="explanation">
      {{i18n code="enroll.oda.without.account.explanation" bundle="login"}}
      </p>
      <ol>
        <li>
          {{i18n code="enroll.oda.without.account.step1" bundle="login"}}
          <a href="{{appStoreLink}}" target="_blank" id="download-ov" class="link">
            {{i18n code="enroll.oda.without.account.download.app" bundle="login"}}
          </a>
        </li>
        <li>{{i18n code="enroll.oda.without.account.step2" bundle="login"}}</li>
        <li>
          {{i18n code="enroll.oda.step3" bundle="login"}}
          <p class="org-signin-link">
            <span class="no-translate">
            {{signInUrl}}
            </span>
          </p>
          <a data-clipboard-text="{{signInUrl}}" class="button link-button copy-org-clipboard-button">
            {{i18n code="enroll.oda.org.copyLink" bundle="login"}}
          </a>
        </li>
        <li>{{i18n code="enroll.oda.without.account.step4" bundle="login"}}</li>
      </ol>
    {{/if}}
  `,
});

export {
  IosAndAndroidLoopbackOdaTerminalView,
  AndroidAppLinkOdaTerminalView,
  getDeviceEnrollmentContext,
};

// export default View.extend({
//   template: hbs`
//     <p class="explanation">
//       {{i18n code="enroll.explanation.p1" bundle="login"}}
//     </p>
//     <ol>
//       {{#if isIOS}}
//       <li>
//         {{i18n code="enroll.mdm.step1" bundle="login"}}
//         <a data-clipboard-text="{{appStoreLink}}" class="button link-button copy-clipboard-button">
//           {{i18n code="enroll.mdm.copyLink" bundle="login"}}
//         </a>
//       </li>
//       <li>{{i18n code="enroll.mdm.step2" bundle="login"}}</li>
//       <li>{{i18n code="enroll.oda.step3" bundle="login"}}</li>
//       {{/if}}
//       {{#if isAndroidLoopback}}
//       <li>{{i18n code="enroll.oda.android.step1" bundle="login"}}</li>
//       {{/if}}
//       <li>{{i18n code="enroll.oda.step1" bundle="login"}}</li>
//       <li>
//         {{i18n code="enroll.oda.step2" bundle="login"}}
//         <p class="org-signin-link">
//           <span class="no-translate">
//           {{signInUrl}}
//           </span>
//         </p>
//         <a data-clipboard-text="{{signInUrl}}" class="button link-button copy-org-clipboard-button">
//           {{i18n code="enroll.oda.org.copyLink" bundle="login"}}
//         </a>
//       </li>
//       <li>{{i18n code="enroll.oda.step6" bundle="login"}}</li>
//     </ol>
//   `,

//   getTemplateData() {
//     const deviceEnrollment = this.options.appState.get('deviceEnrollment');
//     const platform = (deviceEnrollment.platform || '').toLowerCase();
//     const isIOS = platform === Enums.IOS;
//     const withAccount = true;
//     const isAndroidAppLinkWithAccount = platform === Enums.ANDROID && withAccount;
//     const isAndroidAppLinkWithoutAccount = platform === Enums.ANDROID && !withAccount;
//     const isAndroidLoopback = platform === Enums.ANDROID 
//         && !isAndroidAppLinkWithAccount && !isAndroidAppLinkWithoutAccount;
//     return {
//       signInUrl: deviceEnrollment.signInUrl,
//       isIOS,
//       isAndroidLoopback,
//       isAndroidAppLinkWithAccount,
//       isAndroidAppLinkWithoutAccount,
//       appStoreLink: isIOS ? Enums.OKTA_VERIFY_APPLE_APP_STORE_URL : null,
//     };
//   },

//   postRender: function() {
//     // Attach each button to the respective 'data-clipboard-text'
//     Clipboard.attach('.copy-clipboard-button').done(() => {
//       let notification = new Notification({
//         message: loc('enroll.mdm.copyLink.success', 'login'),
//         level: 'success',
//       });
//       this.el.prepend(notification.render().el);
//       return false;
//     });
//     Clipboard.attach('.copy-org-clipboard-button').done(() => {
//       let notification = new Notification({
//         message: loc('enroll.oda.org.copyLink.success', 'login'),
//         level: 'success',
//       });
//       this.el.prepend(notification.render().el);
//       return false;
//     });
//   },
// });
