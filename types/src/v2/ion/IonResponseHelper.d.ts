declare namespace _default {
    export { convertFormErrors };
    export { isIonErrorResponse };
}
export default _default;
declare function convertFormErrors(response: any): {
    responseJSON: {
        errorCauses: any[];
        errorSummary: any;
        errorSummaryKeys: any;
        errorIntent: any;
    };
};
declare function isIonErrorResponse(response?: {}): any;
//# sourceMappingURL=IonResponseHelper.d.ts.map