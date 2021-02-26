import { Collection } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorVerifyOptions from '../../components/AuthenticatorVerifyOptions';
import { getAuthenticatorDataForVerification } from '../../utils/AuthenticatorUtil';
import { Body as SelectAuthenticatorVerifyViewBody } from '../SelectAuthenticatorVerifyView';
import { AUTHENTICATOR_KEY } from '../../../ion/RemediationConstants';

const Body = SelectAuthenticatorVerifyViewBody.extend({
  getUISchema () {
    // Change the UI schema to not display radios here.
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const methodsSchema = uiSchemas.find(schema => schema.name === 'authenticator.methodType');
    const methodOptions = methodsSchema.options.map((option) => {
      return Object.assign({}, option, getAuthenticatorDataForVerification({authenticatorKey: AUTHENTICATOR_KEY.OV}));
    });
    return [{
      View: AuthenticatorVerifyOptions,
      options: {
        name: methodsSchema.name,
        collection: new Collection(methodOptions),
      }
    }];
  },
});

export default BaseAuthenticatorView.extend({
  Body
});
