import { loc } from 'okta';
import { BaseForm, BaseView } from '../../internals';
import OdaOktaVerifyTerminalView from '../../components/OdaOktaVerifyTerminalView';
import MdmOktaVerifyTerminalView from '../../components/MdmOktaVerifyTerminalView';
import Enums from 'util/Enums';
import OktaVerifyHeader from '../../components/OktaVerifyHeader';

const BaseBody = BaseForm.extend({
  noButtonBar: true,
  className: 'device-enrollment-terminal',
});
const OdaBody = BaseBody.extend({
  title() {
    return loc('enroll.title.oda', 'login');
  },
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.add(OdaOktaVerifyTerminalView);
  },
});

const MdmBody = BaseBody.extend({
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
      this.Header = OktaVerifyHeader;
      this.Body = OdaBody;
      break;
    case Enums.MDM:
      this.Body = MdmBody;
      break;
    }
  }
});
