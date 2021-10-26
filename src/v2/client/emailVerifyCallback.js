import { getSavedTransactionMeta } from './transactionMeta';

export async function emailVerifyCallback(settings) {
  const authClient = settings.getAuthClient();
  const meta = await getSavedTransactionMeta(settings);
  const interactionHandle = meta?.interactionHandle;
  const stateTokenExternalId = settings.get('stateTokenExternalId');

  // Unlike idx-js, which will throw error responses, auth-js will resolve both success and error responses
  const idxResponse = await authClient.idx.introspect({
    interactionHandle, // may be undefined if loading in another browser
    stateTokenExternalId
  });
  return idxResponse;
}
