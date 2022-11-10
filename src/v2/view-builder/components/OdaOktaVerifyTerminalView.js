import { View, loc, internal } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Enums from 'util/Enums';

const { Notification } = internal.views.components;
const { Clipboard } = internal.util;

const getDeviceEnrollmentContext = (deviceEnrollment) => {
  const platform = (deviceEnrollment.platform || '').toLowerCase();
  const challengeMethod = deviceEnrollment.challengeMethod;
  const enrollmentType = deviceEnrollment.name;
  const isIOS = platform === Enums.IOS;
  const isAndroidAppLink = platform === Enums.ANDROID && challengeMethod === 'APP_LINK';
  const isAndroidLoopback = platform === Enums.ANDROID && challengeMethod === 'LOOPBACK';
  return {
    signInUrl: deviceEnrollment.signInUrl,
    isIOS,
    enrollmentType,
    isAndroidLoopback,
    isAndroidAppLink,
    appStoreLink: isIOS ? Enums.OKTA_VERIFY_APPLE_APP_STORE_URL : Enums.OKTA_VERIFY_GOOGLE_PLAY_STORE_URL,
    orgName: deviceEnrollment.orgName
  };
};

const BaseOdaOktaVerifyTerminalView = View.extend({
  getTemplateData() {
    const deviceEnrollment = this.options.appState.get('deviceEnrollment');
    return getDeviceEnrollmentContext(deviceEnrollment);
  },
});

const IosAndAndroidLoopbackOdaTerminalView =  BaseOdaOktaVerifyTerminalView.extend({
  template: hbs`
    <p class="explanation" data-se="subheader">
      {{i18n code="enroll.explanation.p1" bundle="login"}}
    </p>
    <ol>
      {{#if isIOS}}
      <li>
        {{i18n code="enroll.mdm.step.copyLink" bundle="login"}}
        <a data-clipboard-text="{{appStoreLink}}" class="button link-button copy-clipboard-button">
          {{i18n code="enroll.mdm.copyLink" bundle="login"}}
        </a>
      </li>
      <li>{{i18n code="enroll.mdm.step.pasteLink" bundle="login"}}</li>
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

const AndroidAppLinkWithAccountOdaTerminalView =  BaseOdaOktaVerifyTerminalView.extend({
  template: hbs`
    <p class="explanation" data-se="subheader">
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
      <li>{{i18n code="enroll.oda.with.account.step5" bundle="login" arguments="signInUrl"}}</li>
      <li>{{i18n code="enroll.oda.with.account.step6" bundle="login"}}</li>
      <li>{{i18n code="enroll.oda.with.account.step7" bundle="login"}}</li>
    </ol>
  `,
});

const AndroidAppLinkWithoutAccountOdaTerminalView =  BaseOdaOktaVerifyTerminalView.extend({
  template: hbs`
    <p class="explanation" data-se="subheader">
      {{i18n code="enroll.oda.without.account.explanation" bundle="login"}}
    </p>
    <ol>
      <li>
        {{{i18n code="enroll.oda.without.account.step1" bundle="login" arguments="appStoreLink"}}}
      </li>
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
      <li>{{i18n code="enroll.oda.without.account.step4" bundle="login"}}</li>
    </ol>
  `,

  postRender: function() {
    // Attach each button to the respective 'data-clipboard-text'
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

export {
  IosAndAndroidLoopbackOdaTerminalView,
  AndroidAppLinkWithAccountOdaTerminalView,
  AndroidAppLinkWithoutAccountOdaTerminalView,
  getDeviceEnrollmentContext,
};
