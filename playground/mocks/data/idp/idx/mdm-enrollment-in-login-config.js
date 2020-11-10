module.exports = {
  baseUrl: 'http://localhost:3000',
  logoText: 'Windico',
  logo: '/img/logo_widgico.png',
  stateToken: "01K8EVWFUw35bN11A5vUOApKzPZRFjyKFtGkK-BMer",
  features: {
    router: true,
    rememberMe: true,
  },
  // deviceEnrollment: {
  //   name: 'mdm',
  //   platform: 'IOS',
  //   vendor: 'Airwatch',
  //   enrollmentLink: 'https://sampleEnrollmentlink.com'
  // },
  deviceEnrollment: {
    name: 'oda',
    signInUrl: 'https://idx.okta1.com',
    platform: 'ios'
  }
  // deviceEnrollment: {
  //   name: '',
  //   platform: '',
  //   vendor: '',
  //   enrollmentLink: '',
  //   signInUrl:''
  // }
}