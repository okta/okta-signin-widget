declare function augmentSchemaProp(schemaProp: any, possibleValues: any, profile: any): void;
declare function augmentSchemaProps(schemaProps: any, possibleValues: any, profile: any): any;
declare const _default: {
    /**
     * Creates the options hash for BaseForm.addInput from a prepared schema
     * property.
     *
     * @param {Okta.Model} [preparedSchemaProp] A schema property backbone model
     * that has been standardized by the prepareSchema method.
     * @return {Object} An object containing all of the options needed by
     * BaseForm's addInput()
     */
    createInputOptions: (preparedSchemaProp: any) => any;
    hasValidSchemaProps: (schemaProps: any, possibleValues: any) => boolean;
    /**
     * This method is responsible for preparing a collection for the form
     * factory to use by putting all of the information to create an input
     * into the schema property and removing invalid properties.
     * The typical UD form takes 3 models:
     * The data model has the input values.
     * The schema model describes which input to use, such as a textbox or a checkbox.
     * The possible values model provide a list of default options to display, for example in a drop down menu.
     *
     * @param {SchemaProperty Collection} [schemaProps] A schema property backbone model.
     * @param {Object} [possibleValues] An object of the form { key: [value1, value2]}
     * @param {Okta.Model} [profile] A backbone model containing the property described by the schema property.
     * @return {SchemaProperty Collection} A schema property collection with standardized models.
     * The standard schema model adds a couple of additional private properties to
     * allow the form factory to reference lookup values or name prefixes without going to a second model.
     */
    prepareSchema: (schemaProps: any, possibleValues: any, profile: any) => any;
    /**
     * `prepareSchema` will reset the property list which may not be necessary at some case.
     * like when setting default value for schema properties.
     * (more detail about such case @see wiki UX, App+Entitlements+for+Provisioning)
     *
     * @param { }
     * @return {String}
     */
    augmentSchemaProps: typeof augmentSchemaProps;
    augmentSchemaProp: typeof augmentSchemaProp;
};
export default _default;
