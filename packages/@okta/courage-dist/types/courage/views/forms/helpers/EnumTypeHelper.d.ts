declare namespace _default {
    export { getEnumInputOptions };
    export { getDropdownOptions };
    export { convertToOneOf };
    export { isConstraintValueMatchType };
}
export default _default;
/**
 * Generate Input Options in order to create an input in an Form for Enum type attribute.
 * @param {Object} config informations for creating input options
 *   config.name        schema property name
 *   config.title       schema property title
 *   config.readOnly    create an read only input?
 *   config.explain     sub-title to the input
 *   config.enumValues  list of enum values for creating input options (Dropdown/SimpleCheckBoxSet)
 *   config.displayType display type of schema property
 *
 * @return {Object} inputOptions options for create an Input view. (Dropdown/SimpleCheckBoxSet)
 *
 */
declare function getEnumInputOptions(config: any): any;
declare function getDropdownOptions(values: any): {};
declare function convertToOneOf(values: any): any;
declare function isConstraintValueMatchType(value: any, type: any): boolean;
