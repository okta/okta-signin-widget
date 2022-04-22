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
  }

}


declare const okta: OktaCourage.okta;
declare const define: (fn: (...args:any[]) => any) => any;

interface Window {
  jQueryCourage?: JQueryStatic;
  _features?: string[];
  okta?: OktaCourage.okta;
}