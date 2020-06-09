import { Collection, _ } from 'okta';
import FactorOptions from '../components/FactorOptions';
import AuthenticatorEnrollOptions from '../components/AuthenticatorEnrollOptions';
import AuthenticatorVerifyOptions from '../components/AuthenticatorVerifyOptions';
import FactorUtil from '../../util/FactorUtil';

const createFactorSelectView = (opt) => {
  var optionItems = (opt.options || [])
    .map(opt => {
      return Object.assign({}, FactorUtil.getFactorData(opt.factorType), opt);
    });
  return {
    View: FactorOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const createAuthenticatorEnrollSelectView = (opt) => {
  var optionItems = (opt.options || [])
    .map(opt => {
      return Object.assign({}, opt, FactorUtil.getFactorData(opt.authenticatorType));
    });
  return {
    View: AuthenticatorEnrollOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const createAuthenticatorVerifySelectView = (opt) => {
  var optionItems = (opt.options || [])
    .map(opt => {
      return Object.assign({}, FactorUtil.getFactorData(opt.authenticatorType), opt);
    });
  return {
    View: AuthenticatorVerifyOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const inputCreationStrategy = {
  factorSelect: createFactorSelectView,
  authenticatorEnrollSelect: createAuthenticatorEnrollSelectView,
  authenticatorVerifySelect: createAuthenticatorVerifySelectView
};

// TODO: move logic to uiSchemaTransformer
const create = function (uiSchemaObj) {
  const strategyFn = inputCreationStrategy[uiSchemaObj.type] || _.identity;
  return strategyFn(uiSchemaObj);
};
module.exports = {
  create,
};
