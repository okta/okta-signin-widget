import { enableOIE } from '@okta/dockolith';

(async function() {
  const { TEST_ORG_ID } = process.env;
  if (!TEST_ORG_ID) {
    throw new Error('enable-oie: Required environment variable `TEST_ORG_ID` is not set');
  }

  try {
    await enableOIE(`${TEST_ORG_ID}`);
  } catch (e) {
    console.error('Caught exception: ', e);
    throw e;
  }
})();
