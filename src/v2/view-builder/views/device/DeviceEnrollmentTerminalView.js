import { loc } from 'okta';
import BaseHeader from '../../internals/BaseHeader';
import HeaderBeacon from '../../components/HeaderBeacon';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import OdaOktaVerifyTerminalView from '../../components/OdaOktaVerifyTerminalView';
import MdmOktaVerifyTerminalView from '../../components/MdmOktaVerifyTerminalView';
import Enums from 'util/Enums';
import { getIconClassNameForBeacon } from '../../utils/AuthenticatorUtil';
import { AUTHENTICATOR_KEY } from '../../../ion/RemediationConstants';

const ODAHeader = BaseHeader.extend({
  HeaderBeacon: HeaderBeacon.extend({
    getBeaconClassName: () => getIconClassNameForBeacon(AUTHENTICATOR_KEY.OV),
  }),
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
  Body,
  initialize () {
    BaseView.prototype.initialize.apply(this, arguments);
    const deviceEnrollment = this.options.appState.get('deviceEnrollment');
    this.enrollmentType = (deviceEnrollment.name || '').toLowerCase(); // oda/mdm
    switch (this.enrollmentType) {
    case Enums.ODA:
      this.Header = ODAHeader;
      break;
    case Enums.MDM:
      this.Header = null;
      break;
    }
  }
});
