import { Collection, loc } from 'okta';
import FactorEnrollOptions from '../components/FactorEnrollOptions';
import FactorUtil from '../../util/FactorUtil';

// TODO: stategy to handle each input instead of using if/else.
const create = function (uiSchemaObj) {
  switch (uiSchemaObj.type) {
  case 'text':
  case 'password':
    return Object.assign(
      { 'label-top': true },
      uiSchemaObj,
    );
  case 'factorType':
    var optionItems = (uiSchemaObj.options || [])
      .map(opt => {
        return Object.assign({}, opt, FactorUtil.getFactorData(opt.value));
      });
    return {
      component: FactorEnrollOptions,
      options: {
        minimize: true,
        listTitle: loc('enroll.choices.description', 'login'),
        collection: new Collection(optionItems),
      }
    };
  }
};
module.exports = {
  create,
};
