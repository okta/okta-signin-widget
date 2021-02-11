const createUiSchemaForArray = (ionFormField, remediationForm) => {
  if (ionFormField.name === 'scopes')  {
    const options = ionFormField.options.map(({name, label, desc}) => {
      return {name, displayName: label, description: desc};
    });

    // setting 'type' here to add a specific View in FormInputFactory.create
    const type = remediationForm.name === 'admin-consent-grant' ? 'adminConsentScopes' : 'enduserConsentScopes';

    return {
      options,
      type
    }
  }
};

export default createUiSchemaForArray;
