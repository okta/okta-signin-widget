import BaseView from '../internals/BaseView';
import BaseHeader from '../internals/BaseHeader';
import HeaderBeaconFactor from '../components/HeaderBeaconFactor';
import BaseForm from '../internals/BaseForm';
import { loc } from 'okta';

const HeaderBeacon = HeaderBeaconFactor.extend({
  getBeaconClassName: function () {
    return 'mfa-okta-verify';
  },
});

const Body = BaseForm.extend({
  title: loc('ov.oidc.success.title', 'login'),
  subtitle: loc('ov.oidc.success.subtitle', 'login'),
  noButtonBar: true,
  className: 'ion-form ov-oidc-success',
});

export default BaseView.extend({
  Header: BaseHeader.extend({ HeaderBeacon }),
  Body
});
