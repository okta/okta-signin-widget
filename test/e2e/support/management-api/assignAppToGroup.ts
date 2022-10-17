import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtil';


export default async function (appId: string, groupId: string) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  await oktaClient.createApplicationGroupAssignment(appId, groupId);
}
