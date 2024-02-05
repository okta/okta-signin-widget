import { loc } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';
import { IosAndAndroidLoopbackOdaTerminalView,
  AndroidAppLinkWithAccountOdaTerminalView,
  AndroidAppLinkWithoutAccountOdaTerminalView,
  getDeviceEnrollmentContext} from '../../components/OdaOktaVerifyTerminalView';
import MdmOktaVerifyTerminalView from '../../components/MdmOktaVerifyTerminalView';
import Enums from 'util/Enums';
import OktaVerifyAuthenticatorHeader from '../../components/OktaVerifyAuthenticatorHeader';
import Link from '../../components/Link';

const BaseDeviceEnrollTerminalForm = BaseForm.extend({
  noButtonBar: true,
  className: 'device-enrollment-terminal',
});

const AndroidAppLinkPreselectForm = BaseForm.extend({
  attributes: { 'data-se': 'android-app-link-setup-options-terminal' },
  title() {
    return loc('enroll.title.oda.with.account', 'login');
  },
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    const deviceEnrollmentContext = getDeviceEnrollmentContext(this.options.appState.get('deviceEnrollment'));
    this.model.set('hasOVAccount', 'no');
    this.addInput({
      label: () => loc('enroll.subtitle.fastpass', 'login', [ deviceEnrollmentContext.orgName ]),
      'label-top': true,
      options: {
        'no': loc('enroll.option.noaccount.fastpass', 'login'),
        'yes': loc('enroll.option.account.fastpass', 'login'),
      },
      name: 'hasOVAccount',
      type: 'radio',
    });
  },

  saveForm() {
    //remove any existing warnings or messages before saving form
    this.$el.find('.o-form-error-container').empty();
    this.options.appState.trigger('updateDeviceEnrollmentView', this.model.get('hasOVAccount') === 'yes');
  }
});

const AndroidAppLinkWithAccountOdaTerminalForm = BaseDeviceEnrollTerminalForm.extend({
  attributes: { 'data-se': 'android-oda-app-link-with-ov-account-terminal' },
  title() {
    return loc('enroll.title.oda.with.account', 'login');
  },
  initialize() {
    BaseDeviceEnrollTerminalForm.prototype.initialize.apply(this, arguments);
    this.add(AndroidAppLinkWithAccountOdaTerminalView);
  },
});

const AndroidAppLinkWithoutAccountOdaTerminalForm = BaseDeviceEnrollTerminalForm.extend({
  attributes: { 'data-se': 'android-oda-app-link-without-ov-account-terminal' },
  title() {
    return loc('enroll.title.oda.without.account', 'login');
  },
  initialize() {
    BaseDeviceEnrollTerminalForm.prototype.initialize.apply(this, arguments);
    this.add(AndroidAppLinkWithoutAccountOdaTerminalView);
  },
});

const IosAndAndroidLoopbackOdaTerminalForm = BaseDeviceEnrollTerminalForm.extend({
  attributes: { 'data-se': 'loopback-terminal' },
  title() {
    return loc('enroll.title.oda', 'login');
  },
  initialize() {
    BaseDeviceEnrollTerminalForm.prototype.initialize.apply(this, arguments);
    this.add(IosAndAndroidLoopbackOdaTerminalView);
  },
});

const MdmTerminalForm = BaseDeviceEnrollTerminalForm.extend({
  attributes: { 'data-se': 'mdm-terminal' },
  title() {
    return loc('enroll.title.mdm', 'login');
  },
  initialize() {
    BaseDeviceEnrollTerminalForm.prototype.initialize.apply(this, arguments);
    this.add(MdmOktaVerifyTerminalView);
  },
});

const AndroidAppLinkTerminalViewFooter = Link.extend({
  postRender() {
    this.$el.click((event) => {
      event.preventDefault();
      this.options.appState.trigger('switchBackToPreselect');
    });
  }
});

export default BaseView.extend({
  initialize() {
    BaseView.prototype.initialize.apply(this, arguments);
    this.listenTo(this.options.appState, 'updateDeviceEnrollmentView', this.handleUpdateDeviceEnrollmentView);
    this.listenTo(this.options.appState, 'switchBackToPreselect', this.handleSwitchBackToPreselect);

    const deviceEnrollmentContext = getDeviceEnrollmentContext(this.options.appState.get('deviceEnrollment'));
    this.enrollmentType = (deviceEnrollmentContext.enrollmentType|| '').toLowerCase(); // oda/mdm

    switch (this.enrollmentType) {
    case Enums.ODA:
      this.Header = OktaVerifyAuthenticatorHeader;
      this.Body = deviceEnrollmentContext.isAndroidAppLink ?
        AndroidAppLinkPreselectForm : IosAndAndroidLoopbackOdaTerminalForm;
      break;
    case Enums.MDM:
      this.Body = MdmTerminalForm;
      break;
    case Enums.WS1:
      this.Body = MdmTerminalForm;
    }
  },

  handleUpdateDeviceEnrollmentView(withAccount) {
    this.Body = withAccount ? AndroidAppLinkWithAccountOdaTerminalForm : AndroidAppLinkWithoutAccountOdaTerminalForm;
    this.backLink = this.add(AndroidAppLinkTerminalViewFooter, {
      options: {
        name: 'back-to-preselect',
        label: loc('oform.back', 'login'),
      }
    }).last();
    this.renderForm();
  },

  handleSwitchBackToPreselect() {
    this.Body = AndroidAppLinkPreselectForm;
    this.backLink && this.backLink.remove();
    this.render();
  },
});
