export default insertUISchema;
export type Authenticator = {
    label: string;
    value: AuthenticatorValue;
};
export type AuthenticatorValue = {
    /**
     * Authenticator Type
     */
    type: string;
    /**
     * Authenticator Org Authenticator ID
     */
    id: string;
    methods: AuthenticatorMethod[];
};
export type AuthenticatorEnrollment = {
    label: string;
    value: AuthenticatorEnrollmentValue;
};
export type AuthenticatorEnrollmentValue = {
    /**
     * Org Authenticator ID
     */
    authenticatorId: string;
    /**
     * Authenticator Type
     */
    type: string;
    /**
     * Authenticator Enrollment ID
     */
    id: string;
    methods: AuthenticatorMethod[];
};
export type AuthenticatorMethod = {
    /**
     * Authenticator method type
     */
    type: string;
};
export type AuthenticatorOption = {
    label: string;
    form: {
        value: AuthenticatorOption[];
    };
};
export type AuthenticatorOptionValue = {
    name: string;
    required: boolean;
    value: string;
    mutable: boolean;
};
export type IONForm = {
    name: string;
    rel: string[];
    method: string;
    href: string;
    accepts: string;
    value: IONFormField[];
};
export type IONFormField = {
    name: string;
    type?: string | undefined;
    required?: string | undefined;
    secret?: string | undefined;
    label?: string | undefined;
    options: any[];
    form?: any | undefined;
    value: IONFormField[];
};
/**
 *
 * @param {AuthResult} transformedResp
 */
declare function insertUISchema(settings: any, transformedResp: any): any;
//# sourceMappingURL=uiSchemaTransformer.d.ts.map