import getOktaClient from './getOktaClient';

export default async function (appId: string, groupId: string) {
  const oktaClient = getOktaClient();
  await oktaClient.applicationApi.assignGroupToApplication({
    appId,
    groupId,
  });
}
