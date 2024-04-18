interface Window {
  OktaLoginPage: {
    render: (databag: Databag) => void;
  }
  OktaPluginA11y?: {
    init: (oktaSignin: OktaSignIn) => void;
  }
  cspNonce: string;
  okta: Okta;
}
