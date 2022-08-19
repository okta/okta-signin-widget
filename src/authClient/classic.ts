// Classic supports only Authn pipelines
import {
  createOktaAuthOAuth,
  mixinAuthn,
  PKCETransactionMeta,
  OAuthStorageManagerInterface,
  createOAuthStorageManager,
  OktaAuthOAuthOptions,
  createOAuthOptionsConstructor,
  createTransactionManager
} from '@okta/okta-auth-js';


type M = PKCETransactionMeta;
type S = OAuthStorageManagerInterface<M>;
type O = OktaAuthOAuthOptions;

const OptionsConstructor = createOAuthOptionsConstructor();
const StorageManager = createOAuthStorageManager<M>();
const TransactionManager = createTransactionManager<M, S>();
const OktaAuthOAuth = createOktaAuthOAuth<M, S, O>(StorageManager, OptionsConstructor, TransactionManager);
const OktaAuth = mixinAuthn(OktaAuthOAuth);

export { OktaAuth };
