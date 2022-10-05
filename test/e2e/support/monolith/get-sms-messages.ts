import { getSMSMessages } from '@okta/dockolith';

(async function() {
  const { OKTA_CLIENT_TOKEN, TEST_ORG, TEST_PHONE } = process.env;
  if (!OKTA_CLIENT_TOKEN) {
    throw new Error('Required environment variable `OKTA_CLIENT_TOKEN` is not set');
  }
  if (!TEST_ORG) {
    throw new Error('Required environment variable `TEST_ORG` is not set');
  }
  if (!TEST_PHONE) {
    throw new Error('Required environment variable `TEST_EMAIL` is not set');
  }
  try {
    const messages = await getSMSMessages({
      orgUrl: `${TEST_ORG}`,
      token: `${OKTA_CLIENT_TOKEN}`,
    },`${TEST_PHONE}`);
    console.log('messages: ', messages);
  } catch (e) {
    console.error('Caught exception: ', e);
    throw e;
  }
})();
