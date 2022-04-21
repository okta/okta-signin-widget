declare namespace _default {
    export { makeCredential };
    export { getAssertion };
    export function isAvailable(): any;
    export function isNewApiAvailable(): (options?: CredentialCreationOptions) => Promise<Credential>;
    export function isWebauthnOrU2fAvailable(): any;
}
export default _default;
declare function makeCredential(accountInfo: any, cryptoParams: any, challenge: any): any;
declare function getAssertion(challenge: any, allowList: any): any;
//# sourceMappingURL=webauthn.d.ts.map