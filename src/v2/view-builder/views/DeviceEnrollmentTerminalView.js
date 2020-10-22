import { loc } from 'okta';
import BaseHeader from '../internals/BaseHeader';
import HeaderBeacon from '../components/HeaderBeacon';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import OdaOktaVerifyTerminalView from '../components/OdaOktaVerifyTerminalView';
import MdmOktaVerifyTerminalView from '../components/MdmOktaVerifyTerminalView';
import Enums from 'util/Enums';

const Header = BaseHeader.extend({
  HeaderBeacon: HeaderBeacon.extend({
    getBeaconClassName: () => 'mfa-okta-verify',
  }),
  initialize () {
    const deviceEnrollment = this.options.appState.get('deviceEnrollment');
    this.enrollmentType = (deviceEnrollment.name || '').toLowerCase(); // oda/mdm
    if (this.enrollmentType === Enums.ODA) { // add HeaderBeacon only for ODA
      BaseHeader.prototype.initialize.apply(this, arguments);
    }
  },
  postRender () {
    if (this.enrollmentType === Enums.ODA) { // show HeaderBeacon only for ODA
      BaseHeader.prototype.postRender.apply(this, arguments);
    }
  },
});

const Body = BaseForm.extend({
  noButtonBar: true,

  className: 'device-enrollment-terminal',

  title () {
    return this.enrollmentType === Enums.ODA
      ? loc('enroll.title.oda', 'login')
      : loc('enroll.title.mdm', 'login');
  },

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    const deviceEnrollment = this.options.appState.get('deviceEnrollment');
    this.enrollmentType = (deviceEnrollment.name || '').toLowerCase(); // oda/mdm
    switch (this.enrollmentType) {
    case Enums.ODA:
      this.add(OdaOktaVerifyTerminalView);
      break;
    case Enums.MDM:
      this.add(MdmOktaVerifyTerminalView);
      break;
    }
  },
});

export default BaseView.extend({
  Header,
  Body,
  Footer: '', // Sign out link appears in the footer if a cancel object exists in API response
});
