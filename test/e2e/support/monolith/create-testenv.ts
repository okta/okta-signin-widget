import {
  getClient,
  createTestOrg,
  enableFeatureFlag,
  disableFeatureFlag,
  createApp,
  createUser,
  enableOIE
} from '@okta/dockolith';
import { writeFileSync } from 'fs';
import path from 'path';

// Bootstraps a local monolith instance
async function bootstrap() {
  const subDomain = process.env.TEST_ORG_SUBDOMAIN || 'siw-test-' + Date.now();
  const outputFilePath = path.join(__dirname, '../../../../', 'testenv.local');

  console.error(`Bootstrap starting: ${subDomain}`);

  const config = await createTestOrg({
    subDomain,
    edition: 'Test',
    userCount: 3,
    activateUsers: true,
    skipFirstTimeLogin: true,
    testName: subDomain
  });

  console.error('Org: ', config.orgUrl);
  console.error('Token: ', config.token);

  const oktaClient = getClient(config);
  const { id: orgId } = await oktaClient.getOrgSettings();

  await enableOIE(orgId);

  const options = {
    enableFFs: [
      'API_ACCESS_MANAGEMENT'
    ],
    disableFFs: [
      'REQUIRE_PKCE_FOR_OIDC_APPS'
    ],
    users: [
      {
        firstName: 'Saml',
        lastName: 'Jackson',
        email: 'george@acme.com',
        password: 'Abcd1234'
      },
      {
        firstName: 'Alexander',
        lastName: 'Hamilton',
        email: 'mary@acme.com',
        password: 'Abcd1234'
      }
    ],
    apps: [
      {
        label: 'SIW WEB APP',
        appType: 'web',
        interactionCode: true
      },
      {
        label: 'SIW SPA APP',
        appType: 'browser',
        interactionCode: true
      }
    ],
    origins: [
      {
        name: 'SIW Test App',
        origin: 'http://localhost:3000',
      }
    ]
  };

  // Set Feature flags
  console.error('Setting feature flags...')
  for (const option of options.enableFFs) {
    await enableFeatureFlag(config, orgId, option);
  }
  for (const option of options.disableFFs) {
    await disableFeatureFlag(config, orgId, option);
  }

  // Add Trusted origins
  for (const option of options.origins) {
    await oktaClient.listOrigins().each(async (origin) => {
      console.error('Existing origin: ', origin);
      if (origin.origin === option.origin) {
        console.error(`Removing existing origin ${option.name}`);
        await origin.delete();
      }
    });
    console.error(`Adding trusted origin "${option.name}": ${option.origin}`);
    await oktaClient.createOrigin({
      name: option.name,
      origin:  option.origin,
      scopes: [{
        type: 'CORS'
      }, {
        type: 'REDIRECT'
      }]
    });
  }

  // Delete apps if they already exist
  await oktaClient.listApplications().each(async (app) => {
    for (const option of options.apps) {
      if (app.label === option.label) {
        console.error(`Deleting existing application with label ${app.label}`);
        await app.deactivate();
        return app.delete();
      }
    }
  });

  // Create apps
  const createdApps = []
  for (const option of options.apps) {
    console.error(`Creating app "${option.label}"`);
    const app = await createApp(oktaClient, {
      clientUri: 'http://localhost:3000',
      redirectUris: [
        'http://localhost:3000/done'
      ],
      ...option
    });
    createdApps.push(app);
  }
  const webApp = createdApps[0];
  const spaApp = createdApps[1];

  // Delete users if they exist
  await oktaClient.listUsers().each(async (user) => {
    for (const option of options.users) {
      if (user.profile.login === option.email) {
        console.error(`Found existing user: ${option.email}`);
        await user.deactivate();
        await user.delete();
      }
    }
  });

  // Create users
  const createdUsers = [];
  for (const option of options.users) {
    console.error(`Creating user "${option.firstName} ${option.lastName}"`);
    const user = await createUser(oktaClient, option);
    createdUsers.push(user);
  }
  const user1 = createdUsers[0];
  const user2 = createdUsers[1];

  // User 1 assigned to apps
  for (const app of createdApps) {
    await oktaClient.assignUserToApplication(app.id, {
      id: user1.id
    });
  }
  // User 2 not assigned to app

  const output = {
    OKTA_CLIENT_TOKEN: config.token,
    TEST_ORG_ID: orgId,

    WIDGET_TEST_SERVER: config.orgUrl,

    WIDGET_SPA_CLIENT_ID: spaApp.id,
    WIDGET_WEB_CLIENT_ID: webApp.id,
    
    // Basic user - assigned to both apps
    WIDGET_BASIC_USER: user1.profile.login,
    WIDGET_BASIC_PASSWORD: options.users[0].password,
    WIDGET_BASIC_NAME: `${user1.profile.firstName} ${user1.profile.lastName}`,

    // Basic user 2 - (copy of 1)
    WIDGET_BASIC_USER_2: user1.profile.login,
    WIDGET_BASIC_PASSWORD_2: options.users[0].password,
    WIDGET_BASIC_NAME_2: `${user1.profile.firstName} ${user1.profile.lastName}`,

    // Basic user 3 - not used

    // Basic user 4 - (copy of 1)
    WIDGET_BASIC_USER_4: user1.profile.login,
    WIDGET_BASIC_PASSWORD_4: options.users[0].password,
    WIDGET_BASIC_NAME_4: `${user1.profile.firstName} ${user1.profile.lastName}`,

    // Basic user 5 - not assigned to any apps
    WIDGET_BASIC_USER_5: user2.profile.login,
    WIDGET_BASIC_PASSWORD_5: options.users[1].password,
    WIDGET_BASIC_NAME_5: `${user2.profile.firstName} ${user2.profile.lastName}`,
  }

  console.error(`Writing output to: ${outputFilePath}`);

  // write output
  const iniOutput = Object.keys(output).reduce((str, key) => {
    const val = (output as any)[key];
    return str + `${key}="${val}"\n`;
  }, `\n# Local config: ${subDomain}\n`);
  writeFileSync(outputFilePath, iniOutput);
}

(async function() {
  try {
    await bootstrap();
  } catch (e) {
    console.error('Caught exception: ', e);
    throw e;
  }
})();
