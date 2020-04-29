import { _ } from 'okta';

const getRemediationErrors = (res) => {
  let errors = [];
  let remediationErrors = res.remediation && 
    res.remediation.value[0] && 
    _.omit(res.remediation.value[0].value, (value) => {
      return value.name === 'stateHandle';
    });

  if (remediationErrors) {
    _.each(remediationErrors, (remediationForm) => {
      if (remediationForm.form && remediationForm.form.value.length) {
        const formName = remediationForm.name;
        _.each(remediationForm.form.value, (field) => {
          if (field.messages && field.messages.value.length) {
            let cause = {};
            cause.property = `${formName}.${field.name}`;
            cause.errorSummary = [];
            _.each(field.messages.value, (err) => {
              cause.errorSummary.push(err.message);
            });
            errors.push(cause);
          }
        });
      }
    });
  }

  return errors;
};

const getGlobalErrors  = (res) => {
  let allErrors = [];

  if(res.messages && res.messages.value) {
    _.each(res.messages.value, (value) => {
      if(value.message) {
        allErrors.push(value.message);
      }
    });
  }

  return allErrors.join('.');
};

const convertFormErrors = (response) => {
  let errors = {
    errorCauses : getRemediationErrors(response),
    errorSummary : getGlobalErrors(response)
  };

  return {
    responseJSON : errors
  };
};

export default {
  convertFormErrors
};