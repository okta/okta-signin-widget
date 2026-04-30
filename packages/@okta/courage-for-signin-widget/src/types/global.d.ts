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

interface Window {
  jQueryCourage?: JQueryStatic;
  _features?: string[];
  okta?: OktaCourage.okta;
}