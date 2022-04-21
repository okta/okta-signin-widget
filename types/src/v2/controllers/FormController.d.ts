import { HttpResponse } from '@okta/okta-auth-js';
export interface ContextData {
    controller: string;
    formName: string;
    authenticatorKey?: string;
    methodType?: string;
}
export interface ErrorContextData {
    xhr: HttpResponse;
    errorSummary?: string;
}
declare const _default: any;
export default _default;
//# sourceMappingURL=FormController.d.ts.map