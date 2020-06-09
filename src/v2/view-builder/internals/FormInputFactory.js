import { Collection, _ } from 'okta';
import FactorOptions from '../components/FactorOptions';
import AuthenticatorOptions from '../components/AuthenticatorOptions';
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

const createAuthenticatorSelectView = (opt) => {
  var optionItems = (opt.options || [])
    .map(opt => {
      return Object.assign({}, opt, FactorUtil.getFactorData(opt.authenticatorType));
    });
  return {
    View: AuthenticatorOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const inputCreationStrategy = {
  factorSelect: createFactorSelectView,
  authenticatorSelect: createAuthenticatorSelectView,
};

// TODO: move logic to uiSchemaTransformer
const create = function (uiSchemaObj) {
  const strategyFn = inputCreationStrategy[uiSchemaObj.type] || _.identity;
  return strategyFn(uiSchemaObj);
};
module.exports = {
  create,
};
