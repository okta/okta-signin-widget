import { loc } from 'okta';
import { BaseForm, BaseView } from '../../internals';
import { IosAndAndroidLoopbackOdaTerminalView, 
  AndroidAppLinkOdaTerminalView,
  getDeviceEnrollmentContext} from '../../components/OdaOktaVerifyTerminalView';
import MdmOktaVerifyTerminalView from '../../components/MdmOktaVerifyTerminalView';
import Enums from 'util/Enums';
import OktaVerifyAuthenticatorHeader from '../../components/OktaVerifyAuthenticatorHeader';

const BaseDeviceEnrollTerminalForm = BaseForm.extend({
  noButtonBar: true,
  className: 'device-enrollment-terminal',
});

const PreselectForm = BaseForm.extend({
  title: loc('enroll.title.oda.with.account', 'login'),
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
  // saveForm(model) {
    
  // }
});

const OdaTerminalForm = BaseDeviceEnrollTerminalForm.extend({
  title() {
    const deviceEnrollmentContext = getDeviceEnrollmentContext(this.options.appState.get('deviceEnrollment'));
    if (deviceEnrollmentContext.isAndroidAppLinkWithAccount) {
      return loc('enroll.title.oda.with.account', 'login');
    }
    if (deviceEnrollmentContext.isAndroidAppLinkWithoutAccount) {
      return loc('enroll.title.oda.without.account', 'login');
    }
    return loc('enroll.title.oda', 'login');
  },
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.add(AndroidAppLinkOdaTerminalView);
  },
});

const MdmTerminalForm = BaseDeviceEnrollTerminalForm.extend({
  title() {
    return loc('enroll.title.mdm', 'login');
  },
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.add(MdmOktaVerifyTerminalView);
  },
});

export default BaseView.extend({
  initialize() {
    BaseView.prototype.initialize.apply(this, arguments);

    const deviceEnrollment = this.options.appState.get('deviceEnrollment');
    this.enrollmentType = (deviceEnrollment.name || '').toLowerCase(); // oda/mdm

    switch (this.enrollmentType) {
    case Enums.ODA:
      this.Header = OktaVerifyAuthenticatorHeader;
      this.Body = PreselectForm;
      break;
    case Enums.MDM:
      this.Body = MdmTerminalForm;
      break;
    }
  }
});
