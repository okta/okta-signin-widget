import { View, _, loc, internal} from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

const { Notification } = internal.views.components;
const { Clipboard } = internal.util;

export default View.extend({
  template: hbs`
      {{#if href}}
        <ol class="qrcode-info ov-info">
        </ol>
        <div class="qrcode-container">
        Your enrollment is active!
        </div>
      {{/if}}
      {{#if email}}
        <ul class="email-info ov-info">
          <li>{{{i18n code="oie.enroll.okta_verify.email.info" bundle="login" arguments="email"}}}</li>
          <li class="switch-channel-content"></li>
        </ul>
      {{/if}}
      {{#if phoneNumber}}
        <ul class="sms-info ov-info">
          <li>{{{i18n code="oie.enroll.okta_verify.sms.info" bundle="login" arguments="phoneNumber"}}}</li>
          <li class="switch-channel-content"></li>
        </ul>
      {{/if}}
      {{#if sameDevice}}
        <p class="explanation" data-se="subheader">
          {{i18n code="oie.enroll.okta_verify.setup.subtitle " bundle="login"}}
        </p>
        <ol class="sameDevice-info ov-info">
          <li>
            {{{i18n code="enroll.oda.without.account.step1" bundle="login" arguments="sameDevice.downloadHref"}}}
          </li>
          <li>{{i18n code="oie.enroll.okta_verify.setup.openOv" bundle="login"}}</li>          
          <li>
              {{i18n code="oie.enroll.okta_verify.setup.signInUrl" bundle="login"}}
              <br><br/>
              <span class='semi-strong'>{{sameDevice.orgUrl}}</span>
              <a data-clipboard-text="{{sameDevice.orgUrl}}" class="button link-button copy-org-clipboard-button">
                {{i18n code="enroll.oda.org.copyLink" bundle="login"}}
              </a>
          </li>
          <li>{{i18n code="oie.enroll.okta_verify.setup.skipAuth.followInstruction" bundle="login"}}</li>
        </ol>
        <p class="closing">
          {{i18n code="oie.enroll.okta_verify.setup.skipAuth.canBeClosed" bundle="login"}}
        </p>
      {{/if}}
      {{#if deviceBootstrap}}
        <p class="explanation" data-se="subheader">
          {{i18n code="oie.enroll.okta_verify.setup.skipAuth.subtitle" bundle="login"}}
        </p>
        <ol class="deviceBootstrap-info ov-info">
          <li>
            {{i18n code="oie.enroll.okta_verify.setup.skipAuth.openOv.suchAs"
            bundle="login"
            arguments="enrolledDeviceName"
            $1="<span class='semi-strong'>$1</span>"}}
          </li>          
          <li>{{i18n code="oie.enroll.okta_verify.setup.skipAuth.selectAccount" bundle="login"}}</li>
          <li>
            {{i18n code="oie.enroll.okta_verify.setup.skipAuth.addAccount"
            bundle="login" $1="<span class='semi-strong'>$1</span>"}}
          </li>
          <li>{{i18n code="oie.enroll.okta_verify.setup.skipAuth.followInstruction" bundle="login"}}</li>
        </ol>
        <p class="closing">
          {{i18n code="oie.enroll.okta_verify.setup.skipAuth.canBeClosed" bundle="login"}}
        </p>
      {{/if}}
    `,
  getTemplateData() {
    const contextualData = this.options.appState.get('currentAuthenticator').contextualData;
    let enrolledDeviceName = '';
    if (contextualData && contextualData?.devicebootstrap && contextualData?.devicebootstrap.enrolledDevices) {
      const enrolledDevices = contextualData?.devicebootstrap.enrolledDevices;
      enrolledDeviceName = Array.isArray(enrolledDevices) && !_.isEmpty(enrolledDevices) ?
        enrolledDevices[0] : enrolledDevices;
    }

    return {
      href: contextualData.qrcode?.href,
      email: _.escape(contextualData?.email),
      phoneNumber:  _.escape(contextualData?.phoneNumber),
      sameDevice: contextualData?.samedevice,
      deviceBootstrap: contextualData?.devicebootstrap,
      enrolledDeviceName: enrolledDeviceName,
    };
  },
  postRender: function() {
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