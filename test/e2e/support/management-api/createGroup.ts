import { randomStr } from '../../util/random';
import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtil';


export default async (groupName: string) => {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  }); const group = await oktaClient.createGroup({
    profile: {
      name: groupName || `TestGroup-${randomStr(6)}`
    }
  });
  return group;
};
