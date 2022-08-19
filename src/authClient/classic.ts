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

// okta-auth-js supports a mixin pattern that allows us to compose a custom version containing only the code we need
// build an AuthJS client that supports only the Classic engine

type M = PKCETransactionMeta;
type S = OAuthStorageManagerInterface<M>;
type O = OktaAuthOAuthOptions;

const OptionsConstructor = createOAuthOptionsConstructor();
const StorageManager = createOAuthStorageManager<M>();
const TransactionManager = createTransactionManager<M, S>();

// Start with OAuth as base
const OktaAuthOAuth = createOktaAuthOAuth<M, S, O>(StorageManager, OptionsConstructor, TransactionManager);

// Mixin Authn support
const OktaAuth = mixinAuthn(OktaAuthOAuth);

export { OktaAuth };
