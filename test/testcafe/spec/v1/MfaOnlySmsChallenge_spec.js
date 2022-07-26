import { ClientFunction, RequestMock } from 'testcafe';
import MfaChallengePageObject from '../../framework/page-objects-v1/MfaChallengePageObject';
import mfaChallengeResponse from '../../../../playground/mocks/data/mfa-only/factor-challenge-sms.json';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(mfaChallengeResponse);


fixture('Mfa-only SMS challenge');

const renderWidget = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
});

async function setup(t, options = {}) {
  const pageObject = new MfaChallengePageObject(t);
  await pageObject.navigateToPage({ render: true });

  // Render the widget for interaction code flow
  await pageObject.mockCrypto();
  await renderWidget({
    stateToken: '00EPMl_-Vn1hX-3CRz8qjcmdHIIXx89qaNR6d705mU',
    status: 'mfa_required',  
    features: {
      hideSignOutLinkInMFA: true
    },
    ...options
  });

  return pageObject;
}

// to reduce the execution time we are testing only 2 transitions
const supportedLanguages = [
  'fr',
  'hu',
  'id'
];

supportedLanguages.forEach( (lang) => {
  test
    .requestHooks(mock)('Show SMS challenge for MFA only setup "' + lang + '" locale', async t => {
      const pageObject = await setup(t, {
        language: lang
      });

      // wait for all elements to render
      await t.wait(5000);      
        
      const r1 = await pageObject.getBeaconRect();
      const r2 = await pageObject.getFormRect();

      const overlap = !(r1.top > r2.bottom || r1.left > r2.right ||
                        r1.bottom < r2.top || r1.right < r2.left);
      await t.expect(overlap).notOk();
    });
});
