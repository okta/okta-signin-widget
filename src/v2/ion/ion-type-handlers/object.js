/**
 * Example of the option like
 * @param {AuthenticatorOption[]} options
 * @param {( AuthenticatorEnrollment[] || Authenticator[] )} authenticators
 */
const createAuthenticatorOptions = (options = []) => {
  return options.map(option => {
    const value = option.value && option.value.form && option.value.form.value || [];

    // Each authenticator option has list of ION field.
    // Currently we are only support merely selecting one of options
    // rather than pop up another page to collection extra data
    // (in order to fill value for `mutable: true; value: null` fields).
    // The only reason of such design is to simplify widget implementation
    // but could subject to change in later releases.
    // Thus only surface up fields that are `required: true; mutable: false`
    // which implies it already has `value`.
    const valueObject = value
      .filter(v => v.required === true && v.mutable === false)
      .reduce((init, v) => {
        return Object.assign(init, { [v.name]: v.value });
      }, {});

    return {
      label: option.label,
      value: valueObject,
      authenticatorType: option.relatesTo && option.relatesTo.type,
    };
  });
};

const getAuthenticatorsEnrollUiSchema = ({ options }) => {
  return {
    type: 'authenticatorEnrollSelect',
    options: createAuthenticatorOptions(options),
  };
};

const getAuthenticatorsVerifyUiSchema = ({ options }) => {
  return {
    type: 'authenticatorVerifySelect',
    options: createAuthenticatorOptions(options),
  };
};

const createUiSchemaForObject = (ionFormField, remediationForm, transformedResp, createUISchema) => {
  const uiSchema = {};

  if (ionFormField.name === 'authenticator' && remediationForm.name === 'select-authenticator-authenticate') {
    // similar to `factorId` but `authenticator` is a new way to model factors
    // hence it has different structure
    Object.assign(uiSchema, getAuthenticatorsVerifyUiSchema(ionFormField));
  } else if (ionFormField.name === 'authenticator' && remediationForm.name === 'select-authenticator-enroll') {
    Object.assign(uiSchema, getAuthenticatorsEnrollUiSchema(ionFormField));
  } else {
    // e.g. { "name": "credentials", "type": "object", options: [ {value: {form: value:[]} ]
    uiSchema.optionsUiSchemas = ionFormField.options.map(opt => {
      return createUISchema(transformedResp, {
        value: [
          {
            name: ionFormField.name,
            value: opt.value,
          }
        ]
      });
    });
    uiSchema.options = ionFormField.options.map((opt, index) => {
      return { label: opt.label, value: index };
    });
    // assume (default to) use radio buttons to switch sub-schema.
    uiSchema.type = 'radio';
    uiSchema.value = '0';
    uiSchema.name = `sub_schema_local_${ionFormField.name}`;
  }

  return uiSchema;
};

export default createUiSchemaForObject;