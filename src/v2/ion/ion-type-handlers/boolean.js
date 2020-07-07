const getCheckboxUiSchema = ({ label, type, required }) => ({
  // For Remember Me checkbox, we need the label only on the right side of it.
  placeholder: label,
  label: false,
  // Separating prop type for Backbone.Model
  // from html input type
  modelType: type,
  // uiSchema type is the html input type desired.
  type: 'checkbox',
  required: required || false,
});

const createUiSchemaForBoolean = (ionFormField) => {
  return getCheckboxUiSchema(ionFormField);
};

export default createUiSchemaForBoolean;