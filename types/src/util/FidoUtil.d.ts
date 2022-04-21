export default fn;
declare namespace fn {
    function getU2fEnrollErrorMessageKeyByCode(errorCode: any): "u2f.error.other" | "u2f.error.badRequest" | "u2f.error.unsupported" | "u2f.error.timeout";
    function getU2fVerifyErrorMessageKeyByCode(errorCode: any, isOneFactor: any): "u2f.error.other" | "u2f.error.badRequest" | "u2f.error.unsupported" | "u2f.error.timeout" | "u2f.error.other.oneFactor" | "u2f.error.badRequest.oneFactor" | "u2f.error.unsupported.oneFactor";
    function getU2fEnrollErrorMessageByCode(errorCode: any): any;
    function getU2fVerifyErrorMessageByCode(errorCode: any, isOneFactor: any): any;
    function getU2fVersion(): string;
    function isU2fAvailable(): any;
}
//# sourceMappingURL=FidoUtil.d.ts.map