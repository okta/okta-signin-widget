import { getHeader } from '../../../../../../src/v2/view-builder/utils/AutoRedirectUtil';
import Util from '../../../../../../src/util/Util';
import { BaseHeader } from '../../../../../../src/v2/view-builder/internals';
import { BaseAuthenticatorBeacon } from '../../../../../../src/v2/view-builder/components/BaseAuthenticatorView';
import { AUTHENTICATOR_KEY } from '../../../../../../src/v2/ion/RemediationConstants';
describe('v2/view-builder/utils/AutoRedirectUtil', () => {

  it('Android OV Enrollment', ()=> {
    jest.spyOn(Util, 'isAndroidOVEnrollment').mockReturnValue(true);
    const beaconHeader = BaseHeader.extend({
      HeaderBeacon: BaseAuthenticatorBeacon.extend({
        authenticatorKey: AUTHENTICATOR_KEY.OV,
      })
    });
    expect(getHeader().toString()).toBe(beaconHeader.toString());
  });

  it('Not Android OV Enrollment', ()=> {
    jest.spyOn(Util, 'isAndroidOVEnrollment').mockReturnValue(false);
    const beaconHeader = BaseHeader.extend({
      HeaderBeacon: null
    });
    expect(getHeader().toString()).toBe(beaconHeader.toString());
  });

});
