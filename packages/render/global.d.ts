interface Window {
  OktaLoginPage: {
    render: (databag: Databag) => void;
  }
  OktaLoginPageRender: {
    render: (databag: Databag) => void;
  }
  OktaPluginA11y?: {
    init: (oktaSignin: OktaSignIn) => void;
  }
  cspNonce: string;
  okta: Okta;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OktaLogin: any;
}
