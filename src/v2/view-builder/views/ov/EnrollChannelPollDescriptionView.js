import { View, _, $, loc, internal} from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

const { Notification } = internal.views.components;
const { Clipboard } = internal.util;

export default View.extend({
  template: hbs`
      {{#if href}}
        <ol class="qrcode-info ov-info">
          <li>{{i18n code="oie.enroll.okta_verify.qrcode.step1" bundle="login"}}</li>
          <li>{{i18n code="oie.enroll.okta_verify.qrcode.step2" bundle="login"}}</li>
          <li>{{i18n code="oie.enroll.okta_verify.qrcode.step3" bundle="login"}}</li>
        </ol>
        <div class="qrcode-container">
          <img class="qrcode" src={{href}} alt="{{i18n code="mfa.altQrCode" bundle="login" }}"></img>
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
      {{#if deviceMap.setupOVUrl}}
        <div class="sameDevice-setup">        
          <p class="explanation" data-se="subheader">
            {{#if deviceMap.isDesktop}}
              <div class="desktop-instructions ov-info">
                {{i18n code="oie.enroll.okta_verify.setup.customUri.prompt"
                bundle="login" $1="<span class='semi-strong'>$1</span>"}}
              </div>              
              <div class="desktop-instructions">
                {{i18n code="oie.enroll.okta_verify.setup.customUri.noPrompt"
                bundle="login" $1="<span class='semi-strong'>$1</span>"}}
              </div>
              <div class="desktop-instructions">
                {{i18n code="oie.enroll.okta_verify.setup.customUri.makeSureHaveOV" bundle="login"}}
              </div>            
            {{else}}
              {{i18n code="oie.enroll.okta_verify.setup.customUri.makeSureHaveOVToContinue" bundle="login"}}
            {{/if}}
          </p>      
          <ol class="ov-info">
            {{#if deviceMap.platformLC}}
              <li>
                <a aria-label='{{i18n code="customUri.required.content.download.linkText" bundle="login"}}'
                href="{{deviceMap.downloadHref}}"
                class="app-store-logo {{deviceMap.platformLC}}-app-store-logo"></a>
              </li>
            {{/if}}            
                        
            <li>
              {{i18n code="oie.enroll.okta_verify.setup.customUri.setup"
              bundle="login" $1="<span class='semi-strong'>$1</span>"}}
            </li>            
            
            <li>
              <a href="{{deviceMap.setupOVUrl}}" class="button button-primary setup-button">
              {{i18n code="oie.enroll.okta_verify.setup.title" bundle="login"}}
              </a>
            </li>

            {{#if showAnotherDeviceLink}}
              <li>
              {{#if deviceMap.isDesktop}}
                {{i18n code="oie.enroll.okta_verify.setup.customUri.orOnMobile"
                bundle="login" $1="<a class='orOnMobileLink' href='#'>$1</a>"}}
              {{else}}
                {{i18n code="oie.enroll.okta_verify.setup.customUri.orMobile"
                bundle="login" $1="<a class='orOnMobileLink' href='#'>$1</a>"}}
              {{/if}}              
              </li>
            {{/if}}
          </ol>
        </div>
      {{/if}}
      <div class="sameDevice-bootstrap" {{#if hideSameDeviceBootstrap}}style="display:none;"{{/if}}>
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
          {{#if hideSameDeviceBootstrap}}
            <p class="closing"><a href='#' class='ovSetupScreen'>{{i18n code="oie.go.back" bundle="login"}}</a></p>
          {{/if}}
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
          {{#if hideSameDeviceBootstrap}}
            <p class="closing"><a href='#' class='ovSetupScreen'>{{i18n code="oie.go.back" bundle="login"}}</a></p>
          {{/if}}
        {{/if}}
      </div>
    `,
  /* eslint complexity: [2, 20] */
  getTemplateData() {
    const contextualData = this.options.appState.get('currentAuthenticator').contextualData;
    let enrolledDeviceName = '';
    let deviceMap = [];
    let showAnotherDeviceLink = false;
    let hideSameDeviceBootstrap = true;
    if (contextualData) {
      if (contextualData?.devicebootstrap && contextualData?.devicebootstrap.enrolledDevices) {
        const enrolledDevices = contextualData?.devicebootstrap.enrolledDevices;
        enrolledDeviceName = Array.isArray(enrolledDevices) && !_.isEmpty(enrolledDevices) ?
          enrolledDevices[0] : enrolledDevices;
      }
      if (contextualData.samedevice && contextualData.samedevice?.setupOVUrl) {
        deviceMap = contextualData.samedevice;
      } else if (contextualData.devicebootstrap && contextualData.devicebootstrap?.setupOVUrl) {
        deviceMap = contextualData.devicebootstrap;
      } else {
        hideSameDeviceBootstrap = false;
      }
    }

    if (deviceMap.platform) {
      deviceMap.platformLC = deviceMap.platform.toLowerCase();
      deviceMap.isDesktop = !(deviceMap.platformLC === 'ios' || deviceMap.platformLC === 'android');
    }

    if (deviceMap.securityLevel && deviceMap.securityLevel === 'ANY') {
      showAnotherDeviceLink = true;
    }
    return {
      href: contextualData.qrcode?.href,
      email: _.escape(contextualData?.email),
      phoneNumber:  _.escape(contextualData?.phoneNumber),
      sameDevice: contextualData?.samedevice,
      deviceBootstrap: contextualData?.devicebootstrap,
      enrolledDeviceName: enrolledDeviceName,
      deviceMap: deviceMap,
      showAnotherDeviceLink: showAnotherDeviceLink,
      hideSameDeviceBootstrap: hideSameDeviceBootstrap,
    };
  },
  postRender: function() {
    $(document).on('click', '.orOnMobileLink', function() {
      $('.sameDevice-setup').hide();
      $('.sameDevice-bootstrap').show();
    });

    $(document).on('click', '.ovSetupScreen', function() {
      $('.sameDevice-bootstrap').hide();
      $('.sameDevice-setup').show();
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