declare namespace _default {
    export { ConfigError };
    export { UnsupportedBrowserError };
    export { OAuthError };
    export { RegistrationError };
    export { AuthStopPollInitiationError };
    export { U2FError };
    export { WebAuthnError };
    export { WebauthnAbortError };
    export { ConfiguredFlowError };
}
export default _default;
declare function ConfigError(message: any): void;
declare class ConfigError {
    constructor(message: any);
    name: string;
    message: any;
}
declare function UnsupportedBrowserError(message: any): void;
declare class UnsupportedBrowserError {
    constructor(message: any);
    name: string;
    message: any;
}
declare function OAuthError(message: any): void;
declare class OAuthError {
    constructor(message: any);
    name: string;
    message: any;
}
declare function RegistrationError(message: any): void;
declare class RegistrationError {
    constructor(message: any);
    name: string;
    message: any;
}
declare function AuthStopPollInitiationError(): void;
declare class AuthStopPollInitiationError {
    name: string;
}
declare function U2FError(err: any): void;
declare class U2FError {
    constructor(err: any);
    name: string;
    message: any;
    xhr: any;
}
declare function WebAuthnError(err: any): void;
declare class WebAuthnError {
    constructor(err: any);
    name: string;
    message: any;
    xhr: any;
}
declare function WebauthnAbortError(): void;
declare class WebauthnAbortError {
    name: string;
}
declare function ConfiguredFlowError(message: any, flowSetting: any): void;
declare class ConfiguredFlowError {
    constructor(message: any, flowSetting: any);
    name: string;
    message: any;
    flowSetting: any;
}
//# sourceMappingURL=Errors.d.ts.map