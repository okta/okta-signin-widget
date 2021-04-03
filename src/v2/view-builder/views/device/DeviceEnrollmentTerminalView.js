import { loc } from 'okta';
import { BaseForm, BaseView } from '../../internals';
import OdaOktaVerifyTerminalView from '../../components/OdaOktaVerifyTerminalView';
import MdmOktaVerifyTerminalView from '../../components/MdmOktaVerifyTerminalView';
import Enums from 'util/Enums';
import OktaVerifyAuthenticatorHeader from '../../components/OktaVerifyAuthenticatorHeader';

const BaseDeviceEnrollTerminalForm = BaseForm.extend({
  noButtonBar: true,
  className: 'device-enrollment-terminal',
});

const OdaTerminalForm = BaseDeviceEnrollTerminalForm.extend({
  title() {
    return loc('enroll.title.oda', 'login');
  },
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.add(OdaOktaVerifyTerminalView);
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
      this.Body = OdaTerminalForm;
      break;
    case Enums.MDM:
      this.Body = MdmTerminalForm;
      break;
    }
  }
});
