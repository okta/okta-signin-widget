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


type M = IdxTransactionMeta;
type S = IdxStorageManagerInterface<M>;
type O = OktaAuthIdxOptions;
type TM = IdxTransactionManagerInterface;

const OptionsConstructor = createIdxOptionsConstructor();
const StorageManager = createIdxStorageManager<M>();
const IdxTransactionManager = createIdxTransactionManager();
const OktaAuthOAuth = createOktaAuthOAuth<M, S, O, TM>(StorageManager, OptionsConstructor, IdxTransactionManager);
const OktaAuth = mixinIdx(OktaAuthOAuth);

export { OktaAuth };
