// OIE supports only IDX pipeline
import {
  createOktaAuthOAuth,
  mixinIdx,
  IdxTransactionMeta,
  IdxStorageManagerInterface,
  createIdxStorageManager,
  createIdxOptionsConstructor,
  OktaAuthIdxOptions,
  IdxTransactionManagerInterface,
  createIdxTransactionManager
} from '@okta/okta-auth-js';

// okta-auth-js supports a mixin pattern that allows us to compose a custom version containing only the code we need
// build an AuthJS client that supports only the OIE engine

type M = IdxTransactionMeta;
type S = IdxStorageManagerInterface<M>;
type O = OktaAuthIdxOptions;
type TM = IdxTransactionManagerInterface;

const OptionsConstructor = createIdxOptionsConstructor();
const StorageManager = createIdxStorageManager<M>();
const IdxTransactionManager = createIdxTransactionManager();

// Start with OAuth as base
const OktaAuthOAuth = createOktaAuthOAuth<M, S, O, TM>(StorageManager, OptionsConstructor, IdxTransactionManager);

// Mixin IDX support
const OktaAuth = mixinIdx(OktaAuthOAuth);

export { OktaAuth };
