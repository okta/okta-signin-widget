declare namespace OktaCourage {

  interface settings {
    orgId?: string;
    orgName?: string;
    serverStatus?: string;
    persona?: string;
    isDeveloperConsole?: boolean;
    isPreview?: boolean;
    permissions?: string[];
  }

  interface okta {
    debug: boolean;
    cdnUrlHostname?: string;
    userId?: string;
    deployEnv?: string;
    locale?: string;
    settings?: settings;
    theme?: string;
    enableIMESupport?: boolean;
    isEnableBcp47OktaUi?: boolean;
    isLogCourageTemplateUtilUsage?: boolean;
  }

}


declare const okta: OktaCourage.okta;
declare const define: (fn: (...args:any[]) => any) => any;

// $.trim() was removed in @types/jquery 4.x but is still used in courage source
interface JQueryStatic {
  trim(str: string): string;
}

// msCrypto was removed from lib.dom.d.ts but courage's StringUtil still
// references it as a legacy IE fallback for window.crypto
interface Window {
  jQueryCourage?: JQueryStatic;
  _features?: string[];
  okta?: OktaCourage.okta;
  msCrypto?: Crypto;
}