export interface ErrorCause {
    errorSummary?: string;
    property?: string;
    reason?: string;
    location?: string;
}
export interface ErrorResponse extends ErrorCause {
    errorCauses?: ErrorCause[];
}
declare const _default: {
    /**
     * Helper function that returns the json output of an xhr objext
     * @param  {jqXhr} xhr
     * @return {Object}
     */
    getResponseJSON: (xhr: any) => ErrorResponse | undefined;
    /**
     * Parses an error summary to extract a field name and an error message
     * @param  {String} errorSummary The raw error summary
     * @return {String[]} An array with two members: [field name, error message]
     */
    parseErrorSummary: (errorSummary: string) => [string, string] | undefined;
    /**
     * Parses an error cause object to extract a field name from property attribute
     * and an error message form errorSummary attribute. It looks to see if there is
     * a custom override/translation for the erorrCause.reason before using the errorSummary
     * @param  {Object} errorCause object
     * @return {String[]} An array with two members: [field name, error message]
     */
    parseErrorCauseObject: (errorCause: ErrorCause) => [string, string] | undefined;
    parseErrors: (resp: any) => string[];
    /**
     * Parses the response for errors
     * Returns a map of field names > array or error messages
     * Example:
     * ```javascript
     * {
     *   url: ['The field cannot be left blank', 'The field has to be a valid URI'],
     *   name: ['The field cannot be left blank']
     * }
     * ```
     * @param  {Object} resp
     * @return {Object}
     */
    parseFieldErrors: (resp: any) => {};
};
export default _default;
