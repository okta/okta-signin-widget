import createUiSchemaForObject from '../../../../../../src/v2/ion/ui-schema/ion-object-handler';
import ionFormField from '../../../../../../playground/mocks/data/idp/idx/authenticator-authenticate-ion-form-field.json';
import remediationForm from '../../../../../../playground/mocks/data/idp/idx/authenticator-authenticate-remediation-form.json';
import {AUTHENTICATOR_KEY} from '../../../../../../src/v2/ion/RemediationConstants';

describe('v2/ion/ui-schema/ion-object-handler', function() {

  describe('check whether custom app options are updated', () => {
    it('with custom app options', () => {
      const uiSchema = createUiSchemaForObject(ionFormField, remediationForm);
      const customAppItems = uiSchema.options.filter((option) => option.relatesTo.key === AUTHENTICATOR_KEY.CUSTOM_APP);
      expect(customAppItems.length).toBe(2);
      customAppItems.forEach((customAppItem) => {
        // methodType should be in value to be sent to backend.
        const methodTypeObj = customAppItem?.value?.methodType;
        expect(methodTypeObj).toBeDefined();
        expect(methodTypeObj).toBe('push');
      });
    });

    it('without custom app options', () => {
      const newIonFormField = Object.assign({}, ionFormField);
      newIonFormField.options =  newIonFormField.options.filter((option)=>option.label !== 'Test Custom Push Authenticator');

      const uiSchema = createUiSchemaForObject(newIonFormField, remediationForm);
      const customAppItems = uiSchema.options.filter((option) => option.relatesTo.key === AUTHENTICATOR_KEY.CUSTOM_APP);
      expect(customAppItems.length).toBe(0);
    });
  });
});
