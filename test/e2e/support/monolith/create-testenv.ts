import {
  getClient,
  createTestOrg,
  enableFeatureFlag,
  disableFeatureFlag,
  createApp,
  createUser,
  enableOIE,
  activateOrgFactor,
  setPolicyForApp,
  disableStepUpForPasswordRecovery,
  getCatchAllRule,
  getDefaultAuthorizationServer
} from '@okta/dockolith';
import { writeFileSync } from 'fs';
import path from 'path';

// Bootstraps a local monolith instance
// Match configuration of current test org
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
  await activateOrgFactor(config, 'okta_email');
  await disableStepUpForPasswordRecovery(config);

  // Enable interaction_code grant on the default authorization server
  const authServer = await getDefaultAuthorizationServer(config);
  await authServer.listPolicies().each(async (policy) => {
    if (policy.name === 'Default Policy') {
      await policy.listPolicyRules(authServer.id).each(async (rule) => {
        if (rule.name === 'Default Policy Rule') {
          rule.conditions.grantTypes = {
            include: [
              'implicit',
              'client_credentials',
              'password',
              'authorization_code',
              'interaction_code' // need to add interaction_code grant or user will see no_matching_policy error
            ]
          };
          await rule.update(policy.id, authServer.id);
        }
      });
    }
  });

  const mfaGroup = await oktaClient.createGroup({
    profile: {
      name: 'MFA Required'
    }
  });

  const spaPolicy = await oktaClient.createPolicy({
    name: 'Widget SPA Policy',
    type: 'ACCESS_POLICY',
    status : 'ACTIVE'
  });

  const spaProfileEnrollmentPolicy = await oktaClient.createPolicy({
    name: 'Widget SPA Profile Enrollment Policy',
    type: 'PROFILE_ENROLLMENT',
    status : 'ACTIVE'
  });

  // Modify catch-all rule to enforce password only
  const catchAll = await getCatchAllRule(config, spaPolicy.id);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  catchAll.actions.appSignOn = {
    access: 'ALLOW',
    verificationMethod: {
        factorMode: '1FA',
        type: 'ASSURANCE',
        reauthenticateIn: 'PT12H',
        constraints: [{
          knowledge: {
            types: [
              'password'
            ]
          }
        }]
    }
  };
  catchAll.update(spaPolicy.id);

  spaPolicy.createRule({
    name: 'MFA Required',
    type: 'ACCESS_POLICY',
    conditions: {
      people: {
          groups: {
              include: [
                mfaGroup.id
              ]
          }
      },
    },
    actions: {
      appSignOn: {
        access: 'ALLOW',
        verificationMethod: {
          factorMode: '2FA',
          type: 'ASSURANCE',
          reauthenticateIn: 'PT2H',
          constraints: [{
            knowledge: {
              types: ['password'],
              reauthenticateIn: 'PT2H'
            }
          }]
        }
      }
    }
  });

  const options = {
    enableFFs: [
      'API_ACCESS_MANAGEMENT',
      'ENG_EMAIL_MAGIC_LINK_OOB_AUTHENTICATOR_FLOWS',
      'ACCOUNT_LOCKOUT_USER_EMAIL',
      'ENG_ENABLE_SSU_FOR_OIE',
      'ENG_OIE_TERMINAL_SSPR_FOR_MAGIC_LINK',
      'OKTA_MFA_POLICY',
      'MULTIPLE_FACTOR_ENROLLMENTS',
      'WEBAUTHN'
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

  let everyoneGroup: any;
  await oktaClient.listGroups().each(async (group) => {
    if (group.profile.name === 'Everyone') {
      everyoneGroup = group;
    }
  });
  if (!everyoneGroup) {
    throw new Error('Cannot find "Everyone" group');
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
    const app = await createApp(config, {
      clientUri: 'http://localhost:3000',
      redirectUris: [
        'http://localhost:3000/done'
      ],
      emailMagicLinkRedirectUri: 'http://localhost:3000/done',
      ...option
    });

    // assign "Everyone" to this application
    oktaClient.createApplicationGroupAssignment(app.id, everyoneGroup.id);

    createdApps.push(app);
  }
  const webApp = createdApps[0];
  const spaApp = createdApps[1];

  // Assign sign-on policy to SPA app
  setPolicyForApp(config, spaApp.id, spaPolicy.id);

  // Assign profile enrollment policy to SPA app
  setPolicyForApp(config, spaApp.id, spaProfileEnrollmentPolicy.id);

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


  // Activate phone authenticator
  const authenticators = await oktaClient.listAuthenticators();

  await authenticators.each(async (item) => {
    if (item.type === 'phone') {
      let phoneAuthenticator = item;
      phoneAuthenticator = await oktaClient.activateAuthenticator(phoneAuthenticator.id);

      phoneAuthenticator = await oktaClient.updateAuthenticator(phoneAuthenticator.id, {
        name: phoneAuthenticator.name,
        settings: {
          allowedFor: 'any'
        }
      });

      // For some reason, deactivating and activating again makes phone "OPTIONAL" (If not, it's "DISABLED")
      await oktaClient.deactivateAuthenticator(phoneAuthenticator.id);
      await oktaClient.activateAuthenticator(phoneAuthenticator.id);
    }
  });

  const getPasswordPolicy = (groupID : string) => {
    return {
      priority: 0,
      type: 'PASSWORD',
      conditions: {
        people: {
          groups: {
            include: [groupID]
          }
        },
        authProvider: {
          provider: 'OKTA'
        }
      },
      settings: {
        password: {
          complexity: {
            minLength: 8,
            minLowerCase: 0,
            minUpperCase: 0,
            minNumber: 0,
            minSymbol: 0,
            excludeUsername: true,
            dictionary: { common: { exclude: true } },
            excludeAttributes: []
          },
          age: {
            maxAgeDays: 0,
            expireWarnDays: 0,
            minAgeMinutes: 0,
            historyCount: 4
          },
          lockout:  {
            maxAttempts: 5,
            autoUnlockMinutes: 0,
            userLockoutNotificationChannels: [],
            showLockoutFailures: false
          }
        },
        recovery: {
          factors: {
            ['okta_email']: {
              status: 'ACTIVE',
              properties: {
                recoveryToken: {
                  tokenLifetimeMinutes: 60
                }
              }
            },
            ['okta_sms']: {
              status: 'ACTIVE'
            },
          }
        },
        delegation: {
          options: { skipUnlock: false }
        }
      }
    };
  };

  const getPasswordPolicyActions = () => {
    return {
        type: 'PASSWORD',
        status: 'ACTIVE',
        conditions: {
          people: { users: { exclude: [] } },
          network: { connection: 'ANYWHERE' }
        },
        actions: {
          passwordChange: {
            access: 'ALLOW'
          },
          selfServicePasswordReset: {
            access: 'ALLOW',
            requirement: {
              stepUp: {
                required: false
              },
              primary: {
                methods: [
                  'email'
                ]
              }
            }
          },
          selfServiceUnlock: {
            access: 'ALLOW',
          }
        }
      };
    };

  // Add new password policy that allows unlock
  const policyObject = getPasswordPolicy(everyoneGroup.id);

  const passwordPolicy = await oktaClient.createPolicy({
    ...policyObject,
    name: 'Allow Unlock Policy'
  });

  const actions = getPasswordPolicyActions();

  await oktaClient.createPolicyRule(passwordPolicy.id, {
    name: 'Allow Unlock Rule',
    ...actions
  });

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
