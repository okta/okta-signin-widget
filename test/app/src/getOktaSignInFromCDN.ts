declare global {
  interface Window {
    OktaSignIn: any;
  }
}

const getOktaSignIn = (config: any) => {
  return new window.OktaSignIn(config);
};

export default getOktaSignIn;
