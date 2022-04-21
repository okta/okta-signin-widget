export default fn;
declare namespace fn {
    function getFactorName(provider: any, factorType: any): any;
    function getFactorNameForFactorType(factorType: any): "OKTA_VERIFY" | "U2F" | "WEBAUTHN" | "WINDOWS_HELLO" | "CUSTOM_HOTP" | "CUSTOM_CLAIMS";
    function isOktaVerify(provider: any, factorType: any): boolean;
    function getFactorLabel(provider: any, factorType: any): any;
    function getFactorDescription(provider: any, factorType: any): any;
    function getFactorIconClassName(provider: any, factorType: any): any;
    function getFactorSortOrder(provider: any, factorType: any): any;
    function getRememberDeviceValue(appState: any): any;
    function getSecurityQuestionLabel(questionObj: any): any;
    function removeRequirementsFromError(responseJSON: any, policy: any): any;
    function getPasswordComplexityDescriptionForHtmlList(policy: any): any[];
    function getPasswordComplexityDescription(policy: any): string;
    function getCardinalityText(enrolled: any, required: any, cardinality: any): any;
    function findFactorInFactorsArray(factors: any, provider: any, factorType: any): any;
}
//# sourceMappingURL=FactorUtil.d.ts.map