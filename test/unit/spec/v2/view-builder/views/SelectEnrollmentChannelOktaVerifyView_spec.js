import SelectEnrollmentChannelOktaVerifyView from 'v2/view-builder/views/ov/SelectEnrollmentChannelOktaVerifyView';
import { Model } from 'okta';
import { BaseForm } from 'v2/view-builder/internals';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';

describe('v2/view-builder/views/ov/SelectEnrollmentChannelOktaVerifyView', function() {
  const QRCODE = 'qrcode';
  const EMAIL = 'email';
  const TEXT = 'sms';
  let testContext;
  let schema;

  beforeEach(function() {
    testContext = {};
    testContext.init = (channel) => {
      const appState = new AppState({
        currentAuthenticator: {
          contextualData: {
            selectedChannel: channel
          }
        },
        idx: {
          neededToProceed: []
        }
      }, {});
      const settings = new Settings({
        baseUrl: 'http://localhost:3000',
      });
      testContext.view = new SelectEnrollmentChannelOktaVerifyView({
        appState,
        settings,
        currentViewState: {},
        model: new Model({
          'authenticator.channel': channel
        }),
      });
      testContext.view.render();
    };
    schema = [
      {
        name: 'authenticator.channel',
        options: [
          { label: 'Scan a QR code', value: QRCODE },
          { label: 'Email me a setup link', value: EMAIL },
          { label: 'Text me a setup link', value: TEXT }
        ],
        value: QRCODE,
        type: 'radio'
      }
    ];
  });
  afterEach(function() {
    jest.resetAllMocks();
  });

  it('If previous channel is qrcode, then selected channel should be email', function() {
    jest.spyOn(BaseForm.prototype.getUISchema, 'apply').mockReturnValue(schema);
    testContext.init(QRCODE);

    expect(testContext.view.model.get('authenticator.channel')).toEqual(EMAIL);
  });

  it('If previous channel is email, then selected channel should be qrcode', function() {
    jest.spyOn(BaseForm.prototype.getUISchema, 'apply').mockReturnValue(schema);
    testContext.init(EMAIL);

    expect(testContext.view.model.get('authenticator.channel')).toEqual(QRCODE);
  });

  it('If previous channel is sms, then selected channel should be qrcode', function() {
    jest.spyOn(BaseForm.prototype.getUISchema, 'apply').mockReturnValue(schema);
    testContext.init(TEXT);

    expect(testContext.view.model.get('authenticator.channel')).toEqual(QRCODE);
  });

});
